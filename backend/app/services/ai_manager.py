from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def get_llm():
    """Sirf Gemini ka latest model use karega"""
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.8-flash", 
            temperature=0, 
            google_api_key=settings.GEMINI_API_KEY
        )
        llm.invoke("Hello")
        logger.info("✅ Gemini 3.8 Flash Working")
        return llm
    except Exception as e:
        logger.error(f"❌ Gemini Failed: {str(e)}")
        raise Exception("Gemini API Model kaam nahi kar raha")
