from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Sirf woh models jo abhi 100% zinda hain
GROQ_MODELS = [
    "llama-3.3-70b-versatile",  # Latest
    "llama-3.1-8b-instant",     # Latest Fast
]

# Gemini ke naye models
GEMINI_MODELS = [
    "gemini-2.5-flash",         # Latest
    "gemini-2.0-flash", 
    "gemini-3.8-flash",        # Backup
]

def get_working_llm():
    """Yeh function check karta hai ke kaunsa model chal raha hai aur wohi return karta hai"""
    
    # 1. Groq Models Check karo
    if settings.GROQ_API_KEY:
        for model_name in GROQ_MODELS:
            try:
                llm = ChatGroq(model=model_name, temperature=0, groq_api_key=settings.GROQ_API_KEY)
                llm.invoke("Hello")
                logger.info(f"✅ Groq Model Working: {model_name}")
                return llm
            except Exception as e:
                logger.warning(f"❌ Groq Model Failed ({model_name}): {str(e)}")
                continue
    
    # 2. Gemini Models Check karo
    if settings.GEMINI_API_KEY:
        for model_name in GEMINI_MODELS:
            try:
                llm = ChatGoogleGenerativeAI(model=model_name, temperature=0, google_api_key=settings.GEMINI_API_KEY)
                llm.invoke("Hello")
                logger.info(f"✅ Gemini Model Working: {model_name}")
                return llm
            except Exception as e:
                logger.warning(f"❌ Gemini Model Failed ({model_name}): {str(e)}")
                continue
    
    raise Exception("❌ Koi bhi AI Model kaam nahi kar raha. API Keys check karein.")

_working_llm = None

def get_llm():
    global _working_llm
    if _working_llm is None:
        _working_llm = get_working_llm()
    return _working_llm