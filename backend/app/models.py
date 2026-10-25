from sqlalchemy import Column, Integer, String, JSON, Boolean, DECIMAL, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String(20), nullable=True)
    whatsapp_number = Column(String(20), unique=True, nullable=False)
    menu = Column(JSON, default={})  # Menu JSON format mein save hoga
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class RestaurantUser(Base):
    __tablename__ = "restaurant_users"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="owner") # owner, manager, staff
    created_at = Column(TIMESTAMP, server_default=func.now())

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    items = Column(JSON, nullable=False)  # Order ki items JSON mein
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), default="pending") # pending, confirmed, delivered
    created_at = Column(TIMESTAMP, server_default=func.now())