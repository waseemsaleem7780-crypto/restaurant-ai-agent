from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant, AdminUser, RestaurantUser
from app.schemas import RestaurantCreate, RestaurantResponse, AdminLogin, TokenResponse
from app.auth import verify_password, create_access_token, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"]) # <-- YEH LINE MISSING HAI

@router.post("/login", response_model=TokenResponse)
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Galat email ya password")
    
    token = create_access_token({"admin_id": admin.id, "role": "super_admin"})
    return {"token": token}

@router.post("/restaurants", response_model=RestaurantResponse)
def create_restaurant(data: RestaurantCreate, db: Session = Depends(get_db)):
    existing = db.query(Restaurant).filter(Restaurant.whatsapp_number == data.whatsapp_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Yeh WhatsApp number pehle se registered hai")
    
    existing_user = db.query(RestaurantUser).filter(RestaurantUser.email == data.owner_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Yeh Email pehle se registered hai")

    new_restaurant = Restaurant(
        name=data.name,
        logo_url=data.logo_url,
        address=data.address,
        phone=data.phone,
        whatsapp_number=data.whatsapp_number
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    new_owner = RestaurantUser(
        restaurant_id=new_restaurant.id,
        email=data.owner_email,
        password_hash=get_password_hash(data.owner_password)
    )
    db.add(new_owner)
    db.commit()

    return new_restaurant

@router.get("/restaurants", response_model=list[RestaurantResponse])
def get_all_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).all()
    result = []
    for r in restaurants:
        # Owner ka email dhoondo
        owner = db.query(RestaurantUser).filter(RestaurantUser.restaurant_id == r.id).first()
        r_dict = {
            "id": r.id, "name": r.name, "logo_url": r.logo_url, "address": r.address,
            "phone": r.phone, "whatsapp_number": r.whatsapp_number, "menu": r.menu,
            "is_active": r.is_active, "owner_email": owner.email if owner else "N/A"
        }
        result.append(r_dict)
    return result


@router.get("/create-first-admin")
def create_first_admin(db: Session = Depends(get_db)):
    # Check karo ke admin pehle se toh nahi hai
    existing = db.query(AdminUser).filter(AdminUser.email == "admin@restaurant.com").first()
    if existing:
        return {"message": "Admin pehle se maujood hai!"}
    
    # Naya admin banao
    new_admin = AdminUser(
        email="admin@restaurant.com",
        password_hash=get_password_hash("admin123")
    )
    db.add(new_admin)
    db.commit()
    return {"message": "✅ Admin successfully ban gaya! Ab aap login kar sakte hain."}