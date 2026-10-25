from app.database import SessionLocal
from app.models import RestaurantUser
from app.auth import get_password_hash

def create_owner():
    db = SessionLocal()
    email = "owner@ali.com"
    password = "owner123"
    restaurant_id = 1 # Humne abhi pehla restaurant banaya tha jiski ID 1 hai
    
    existing = db.query(RestaurantUser).filter(RestaurantUser.email == email).first()
    if not existing:
        new_owner = RestaurantUser(
            email=email,
            password_hash=get_password_hash(password),
            restaurant_id=restaurant_id
        )
        db.add(new_owner)
        db.commit()
        print("✅ Owner account ban gaya! Email: owner@ali.com, Password: owner123")
    else:
        print("Owner pehle se maujood hai.")
    db.close()

if __name__ == "__main__":
    create_owner()