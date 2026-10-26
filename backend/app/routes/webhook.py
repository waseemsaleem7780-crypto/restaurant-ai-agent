from fastapi import APIRouter, Request, Depends, BackgroundTasks, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant
from app.agent.graph import app as agent_app
from app.services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/webhook", tags=["WhatsApp Webhook"])

def process_agent_reply(restaurant_id: int, menu: dict, customer_phone: str, message: str, provider: str, api_key: str):
    print(f"🚀 [DEBUG] Processing reply for: {customer_phone}")
    
    initial_state = {
        "restaurant_id": restaurant_id,
        "menu": menu,
        "customer_phone": customer_phone,
        "message": message,
        "intent": "",
        "response": "",
        "order_items": None
    }
    
    try:
        result = agent_app.invoke(initial_state)
        ai_response = result["response"]
        print(f"✅ [DEBUG] AI Response: {ai_response[:100]}")
    except Exception as e:
        print(f"❌ [DEBUG] AI Agent Error: {e}")
        return
    
    try:
        send_result = send_whatsapp_message(
            to_phone=customer_phone, 
            message=ai_response,
            provider=provider,
            api_key=api_key
        )
        print(f"✅ [DEBUG] WhatsApp Send Result: {send_result}")
    except Exception as e:
        print(f"❌ [DEBUG] WhatsApp Send Error: {e}")

@router.post("/web2c")
async def web2c_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/x-www-form-urlencoded" in content_type:
            form_data = await request.form()
            customer_phone = form_data.get("From", "").replace("whatsapp:", "")
            message_text = form_data.get("Body", "")
            receiving_number = form_data.get("From", "").replace("whatsapp:", "")
        else:
            data = await request.json()
            customer_phone = data.get("from")
            message_text = data.get("text", {}).get("body", "")
            receiving_number = data.get("to")

        print(f"📩 [DEBUG] Webhook received from {customer_phone}: {message_text}")
        print(f"🔍 [DEBUG] Looking for restaurant with number: {receiving_number}")

        if not customer_phone or not message_text:
            return Response(content="<Response></Response>", media_type="text/xml")

        # Number ko normalize karo (03196952226 -> +923196952226)
        normalized_number = receiving_number
        if receiving_number.startswith("0"):
            normalized_number = "+92" + receiving_number[1:]
        elif receiving_number.startswith("92"):
            normalized_number = "+" + receiving_number
        
        print(f"🔍 [DEBUG] Normalized number: {normalized_number}")

        # Pehle normalized number se try karo
        restaurant = db.query(Restaurant).filter(Restaurant.whatsapp_number == normalized_number).first()
        
        # Agar nahi mila, toh original format se try karo
        if not restaurant:
            restaurant = db.query(Restaurant).filter(Restaurant.whatsapp_number == receiving_number).first()
        
        # Agar phir bhi nahi mila, toh 0 wale format se try karo
        if not restaurant and receiving_number.startswith("+"):
            old_format = "0" + receiving_number[3:]
            restaurant = db.query(Restaurant).filter(Restaurant.whatsapp_number == old_format).first()
        
        if not restaurant:
            print(f"❌ [DEBUG] Restaurant not found for number: {receiving_number}")
            return Response(content="<Response></Response>", media_type="text/xml")

        background_tasks.add_task(
            process_agent_reply, 
            restaurant.id, 
            restaurant.menu, 
            customer_phone, 
            message_text,
            restaurant.whatsapp_provider or "twilio",
            restaurant.whatsapp_api_key or ""
        )

        return Response(content="<Response></Response>", media_type="text/xml")
        
    except Exception as e:
        print(f"❌ [DEBUG] Webhook Error: {e}")
        return Response(content="<Response></Response>", media_type="text/xml")