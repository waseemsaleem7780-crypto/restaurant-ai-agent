import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.config import settings

# Password ko hash (encrypt) karne ke liye
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Check karo ke password sahi hai ya nahi"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Password ko secure hash mein badlo"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """JWT Token banao (login ke waqt milta hai)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt