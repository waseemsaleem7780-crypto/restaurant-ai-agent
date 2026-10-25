import requests
from app.config import settings

def send_whatsapp_message(to_phone: str, message: str):
    """Web2C API se WhatsApp message bhejta hai"""
    url = f"{settings.WHATSAPP_BASE_URL}/sendMessage" # Web2C ka endpoint
    
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "to": to_phone,
        "type": "text",
        "text": {
            "body": message
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
    except Exception as e:
        print(f"WhatsApp API Error: {e}")
        return None

def send_audio_message(to_phone: str, audio_url: str):
    """Order confirm hone par ringtone/audio bhejne ke liye"""
    url = f"{settings.WHATSAPP_BASE_URL}/sendAudio"
    
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "to": to_phone,
        "type": "audio",
        "audio": {
            "link": audio_url
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
    except Exception as e:
        print(f"WhatsApp Audio Error: {e}")
        return None