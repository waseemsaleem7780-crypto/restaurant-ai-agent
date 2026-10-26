import requests
from app.config import settings

def send_whatsapp_message(to_phone: str, message: str, provider: str = "twilio", api_key: str = ""):
    """Twilio ya Web2C ke zariye message bhejta hai"""
    
    if provider == "twilio":
        # Render ke environment se values aayengi
        account_sid = settings.TWILIO_ACCOUNT_SID  
        auth_token = api_key
        from_number = settings.TWILIO_PHONE_NUMBER  
        
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        
        payload = {
            "From": f"whatsapp:{from_number}",
            "To": f"whatsapp:{to_phone}",
            "Body": message
        }
        
        try:
            response = requests.post(url, data=payload, auth=(account_sid, auth_token))
            return response.json()
        except Exception as e:
            print(f"Twilio Error: {e}")
            return None
    else:
        url = f"{settings.WHATSAPP_BASE_URL}/sendMessage"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "to": to_phone,
            "type": "text",
            "text": {"body": message}
        }
        try:
            response = requests.post(url, json=payload, headers=headers)
            return response.json()
        except Exception as e:
            print(f"Web2C Error: {e}")
            return None