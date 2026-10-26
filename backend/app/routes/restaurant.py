from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.database import get_db
from app.models import Restaurant, RestaurantUser, Order
from app.schemas import RestaurantResponse, RestaurantLogin, TokenResponse
from app.auth import verify_password, create_access_token
from app.config import settings
from app.services.rag import train_restaurant_menu
from app.services.ai_manager import get_llm
from pydantic import BaseModel
import jwt
import io
import json
import os
import re

# OCR libraries
from pdf2image import convert_from_bytes
import pytesseract

if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

router = APIRouter(prefix="/api/restaurant", tags=["Restaurant"])

def verify_restaurant_token(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        if payload.get("role") != "owner":
            raise HTTPException(status_code=403, detail="Sirf restaurant owner access kar sakta hai")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid ya Expired Token")

@router.post("/login", response_model=TokenResponse)
def restaurant_login(data: RestaurantLogin, db: Session = Depends(get_db)):
    user = db.query(RestaurantUser).filter(RestaurantUser.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Galat email ya password")
    
    token = create_access_token({
        "user_id": user.id, 
        "restaurant_id": user.restaurant_id, 
        "role": "owner"
    })
    return {"token": token}

@router.get("/profile", response_model=RestaurantResponse)
def get_profile(payload: dict = Depends(verify_restaurant_token), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload["restaurant_id"]).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant nahi mila")
    return restaurant

@router.get("/orders")
def get_my_orders(payload: dict = Depends(verify_restaurant_token), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.restaurant_id == payload["restaurant_id"]).all()
    return orders

class MenuItemCreate(BaseModel):
    name: str
    price: float

@router.post("/menu")
def add_menu_item(item: MenuItemCreate, payload: dict = Depends(verify_restaurant_token), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload["restaurant_id"]).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant nahi mila")
    
    current_menu = restaurant.menu or {}
    current_menu[item.name] = {"price": item.price, "available": True}
    restaurant.menu = current_menu
    flag_modified(restaurant, "menu")
    
    db.commit()
    db.refresh(restaurant)
    return {"message": "Menu item added", "menu": restaurant.menu}

@router.post("/upload-menu-pdf")
async def upload_menu_pdf(
    file: UploadFile = File(...), 
    payload: dict = Depends(verify_restaurant_token), 
    db: Session = Depends(get_db)
):
    print("🚀 [1] PDF Upload Request Received")
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sirf PDF file allowed hai")

    pdf_content = await file.read()
    print(f"📄 [2] PDF Size: {len(pdf_content)} bytes")
    
    extracted_text = ""
    
    # 1. Pehle pypdf se try karo (agar text-based PDF hai toh)
    try:
        from pypdf import PdfReader
        pdf_reader = PdfReader(io.BytesIO(pdf_content))
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        print(f"📝 [3] Text-based extraction: {len(extracted_text)} chars")
    except Exception as e:
        print(f"⚠️ pypdf failed: {e}")

    # 2. Agar text nahi mila, toh OCR (image-based) try karo
    if not extracted_text.strip():
        print("🔍 [4] Falling back to OCR (Image-based PDF)...")
        try:
            images = convert_from_bytes(pdf_content)
            for img in images:
                text = pytesseract.image_to_string(img, lang='eng')
                extracted_text += text + "\n"
            print(f"📝 [5] OCR extraction: {len(extracted_text)} chars")
        except Exception as e:
            print(f"❌ OCR Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"PDF se text nahi nikal paya (OCR error): {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="PDF se koi text nahi mila (Bilkul khali PDF ho sakti hai).")

    # 3. AI se menu parse karo
    prompt = f"""
    Extract the menu items from this restaurant menu text. 
    Return ONLY a valid JSON object where keys are item names and values are objects with "price" (number) and "available" (true).
    Do not include any other text or markdown.
    
    Menu Text:
    {extracted_text}
    """
    
    try:
        print("🤖 [6] Calling AI Model...")
        client = get_llm()
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_text = response.choices[0].message.content
        print("✅ [7] AI Response Received")
        
        # DEBUG: AI ka raw jawab print karo
        print(f"🤖 [DEBUG] AI Raw Response (first 300 chars): {ai_text[:300]}")
        
        # JSON ko extract karo
        json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
        if not json_match:
            raise ValueError(f"AI ne valid JSON nahi diya. Raw response: {ai_text[:200]}")
        
        clean_json = json_match.group(0)
        menu_dict = json.loads(clean_json)
        print(f"✅ [8] Parsed Items: {len(menu_dict)}")
        
    except Exception as e:
        print(f"❌ [Error] AI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # 4. Database mein save karo
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload["restaurant_id"]).first()
    restaurant.menu = menu_dict
    flag_modified(restaurant, "menu")
    db.commit()

    # 5. RAG train karo
    train_restaurant_menu(restaurant.id, menu_dict)
    print("🎉 [9] All Done!")

    return {
        "message": "PDF se menu extract ho gaya aur AI train ho gaya!",
        "items_found": len(menu_dict),
        "menu": menu_dict
    }