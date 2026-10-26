from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.database import get_db
from app.models import Restaurant, RestaurantUser, Order
from app.schemas import RestaurantResponse, RestaurantLogin, TokenResponse
from app.auth import verify_password, create_access_token
from app.config import settings
from app.services.rag import train_restaurant_menu
from app.services.ai_manager import get_llm  # <-- Auto-detect model import kiya
from pypdf import PdfReader
from pydantic import BaseModel
import jwt
import io
import json

router = APIRouter(prefix="/api/restaurant", tags=["Restaurant"])

# Helper function: Token check karne ke liye
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
    """Owner PDF upload karega, AI usko padh kar menu train karega"""
    print("🚀 [1] PDF Upload Request Received") # Debug
    
    if not file.filename.endswith(".pdf"):
        print("❌ [Error] File PDF nahi hai")
        raise HTTPException(status_code=400, detail="Sirf PDF file allowed hai")

    # 1. PDF se text nikalo
    pdf_content = await file.read()
    print(f"📄 [2] PDF Size: {len(pdf_content)} bytes")
    
    pdf_reader = PdfReader(io.BytesIO(pdf_content))
    extracted_text = ""
    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"

    print(f"📝 [3] Extracted Text Length: {len(extracted_text)} characters")

    if not extracted_text.strip():
        print("❌ [Error] PDF se text nahi mila")
        raise HTTPException(status_code=400, detail="PDF se koi text nahi mila (Image wali PDF ho sakti hai).")

    # 2. Auto-Detect AI Model se text ko JSON menu mein badlo
    prompt = f"""
    Extract the menu items from this restaurant menu text. 
    Return ONLY a valid JSON object where keys are item names and values are objects with "price" (number) and "available" (true).
    Do not include any other text or markdown.
    
    Menu Text:
    {extracted_text}
    """
    
    try:
        print("🤖 [4] Calling AI Model (OpenRouter)...")
        llm = get_llm() 
        ai_response = llm.invoke(prompt)
        print("✅ [5] AI Response Received")
        
        clean_json = ai_response.content.replace("```json", "").replace("```", "").strip()
        menu_dict = json.loads(clean_json)
        print(f"✅ [6] JSON Parsed Successfully. Items: {len(menu_dict)}")
        
    except Exception as e:
        print(f"❌ [Error] AI menu parse nahi kar paya: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI menu parse nahi kar paya: {str(e)}")

    # 3. Database mein save karo
    print("💾 [7] Saving to Database...")
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload["restaurant_id"]).first()
    restaurant.menu = menu_dict
    flag_modified(restaurant, "menu")
    db.commit()

    # 4. RAG (Vector DB) par train karo
    print("🧠 [8] Training RAG...")
    train_restaurant_menu(restaurant.id, menu_dict)
    print("🎉 [9] All Done!")

    return {
        "message": "PDF se menu extract ho gaya aur AI train ho gaya!",
        "items_found": len(menu_dict),
        "menu": menu_dict
    }