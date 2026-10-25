from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# --- Restaurant Schemas ---
class RestaurantCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: str
    owner_email: EmailStr  # <-- Yeh naya add kiya
    owner_password: str    # <-- Yeh naya add kiya
    whatsapp_provider: Optional[str] = "web2c"
    whatsapp_api_key: Optional[str] = None

class RestaurantResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    whatsapp_number: str
    menu: Dict[str, Any]
    is_active: bool
    owner_email: Optional[str] = None  # <-- Yeh naya add kiya
    whatsapp_provider: Optional[str] = "web2c"
    whatsapp_api_key: Optional[str] = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

# --- User Schemas ---
class RestaurantUserCreate(BaseModel):
    email: EmailStr
    password: str
    restaurant_id: int

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"

# --- Order Schemas ---
class OrderCreate(BaseModel):
    restaurant_id: int
    customer_phone: str
    items: Dict[str, Any]
    total_amount: float

class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    customer_phone: str
    items: Dict[str, Any]
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True