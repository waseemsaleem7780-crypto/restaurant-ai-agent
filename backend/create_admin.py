from app.database import SessionLocal, engine, Base
from app.models import AdminUser
from app.auth import get_password_hash

# Database tables banao (agar nahi bani hain toh)
Base.metadata.create_all(bind=engine)

def create_admin():
    db = SessionLocal()
    email = "admin@restaurant.com"
    password = "admin123"
    
    # Check karo ke admin pehle se toh nahi hai
    existing_admin = db.query(AdminUser).filter(AdminUser.email == email).first()
    if existing_admin:
        print(f"Admin pehle se maujood hai: {email}")
    else:
        new_admin = AdminUser(
            email=email,
            password_hash=get_password_hash(password)
        )
        db.add(new_admin)
        db.commit()
        print(f"✅ Admin account ban gaya!")
        print(f"Email: {email}")
        print(f"Password: {password}")
    
    db.close()

if __name__ == "__main__":
    create_admin()