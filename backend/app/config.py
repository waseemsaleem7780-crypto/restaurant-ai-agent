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
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")  # <-- Key hata di
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "+14155238886")

settings = Settings()