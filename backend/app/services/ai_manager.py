from openai import OpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def get_llm():
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "https://restaurant-ai-agent-omega.vercel.app",
                "X-Title": "RestoAgent"
            }
        )
        client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct:free", # <-- Yeh model try karein
            messages=[{"role": "user", "content": "Hello"}]
        )
        logger.info("✅ OpenRouter Free Router Working")
        return client
    except Exception as e:
        logger.error(f"❌ OpenRouter Failed: {str(e)}")
        print(f"❌ OPENROUTER REAL ERROR: {str(e)}") # <-- Yeh line add karein
        raise Exception(f"OpenRouter API kaam nahi kar raha: {str(e)}")
