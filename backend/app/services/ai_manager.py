from langchain_openai import ChatOpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def get_llm():
    """Sirf aur sirf OpenRouter use karega (No Gemini, No Groq)"""
    try:
        llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001", 
            temperature=0,
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://restaurant-ai-agent-omega.vercel.app",
                "X-Title": "RestoAgent"
            }
        )
        llm.invoke("Hello")
        logger.info("✅ OpenRouter Working perfectly")
        return llm
    except Exception as e:
        logger.error(f"❌ OpenRouter Failed: {str(e)}")
        raise Exception("OpenRouter API kaam nahi kar raha")