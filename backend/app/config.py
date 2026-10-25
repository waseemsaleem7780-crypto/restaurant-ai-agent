import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./restaurant_app.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "default_secret_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    WHATSAPP_API_KEY: str = os.getenv("WHATSAPP_API_KEY", "")
    WHATSAPP_BASE_URL: str = os.getenv("WHATSAPP_BASE_URL", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6LI1wsxAA8nmuGc_031vymZiWB7oVdrb-jcj30IMPb7HA")# <-- Yeh yahan aayega

settings = Settings()
