from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Models ki list (jo try karne hain) - Groq
GROQ_MODELS = [
    "llama3-70b-8192",
    "llama3-8b-8192",
    "llama-3.1-70b-versatile",
    "gemma2-9b-it"
]

# Gemini Models (Free Tier)
GEMINI_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro"
]

def get_working_llm():
    """Yeh function check karta hai ke kaunsa model chal raha hai aur wohi return karta hai"""
    
    # 1. Groq Models Check karo
    if settings.GROQ_API_KEY:
        for model_name in GROQ_MODELS:
            try:
                llm = ChatGroq(model=model_name, temperature=0, groq_api_key=settings.GROQ_API_KEY)
                llm.invoke("Hello") # Test call
                logger.info(f"✅ Groq Model Working: {model_name}")
                return llm
            except Exception as e:
                logger.warning(f"❌ Groq Model Failed ({model_name}): {str(e)}")
                continue
    
    # 2. Gemini Models Check karo (Agar Groq fail ho jaye)
    if settings.GEMINI_API_KEY:
        for model_name in GEMINI_MODELS:
            try:
                llm = ChatGoogleGenerativeAI(model=model_name, temperature=0, google_api_key=settings.GEMINI_API_KEY)
                llm.invoke("Hello") # Test call
                logger.info(f"✅ Gemini Model Working: {model_name}")
                return llm
            except Exception as e:
                logger.warning(f"❌ Gemini Model Failed ({model_name}): {str(e)}")
                continue
    
    # 3. Agar kuch bhi kaam na kare
    raise Exception("❌ Koi bhi AI Model kaam nahi kar raha. API Keys check karein.")

# Ek global variable jisme working LLM save hoga
_working_llm = None

def get_llm():
    """Yeh function ek baar working model dhoond kar save kar leta hai"""
    global _working_llm
    if _working_llm is None:
        _working_llm = get_working_llm()
    return _working_llm