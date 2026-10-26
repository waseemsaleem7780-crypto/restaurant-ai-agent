from fastapi import APIRouter, Request, Depends, BackgroundTasks, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant
from app.agent.graph import app as agent_app
from app.services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/webhook", tags=["WhatsApp Webhook"])

def process_agent_reply(restaurant_id: int, menu: dict, customer_phone: str, message: str, provider: str, api_key: str):
    initial_state = {
        "restaurant_id": restaurant_id,
        "menu": menu,
        "customer_phone": customer_phone,
        "message": message,
        "intent": "",
        "response": "",
        "order_items": None
    }
    
    result = agent_app.invoke(initial_state)
    ai_response = result["response"]
    
    send_whatsapp_message(
        to_phone=customer_phone, 
        message=ai_response,
        provider=provider,
        api_key=api_key
    )

@router.post("/web2c")
async def web2c_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/x-www-form-urlencoded" in content_type:
            form_data = await request.form()
            customer_phone = form_data.get("From", "").replace("whatsapp:", "")
            message_text = form_data.get("Body", "")
            receiving_number = form_data.get("To", "").replace("whatsapp:", "")
        else:
            data = await request.json()
            customer_phone = data.get("from")
            message_text = data.get("text", {}).get("body", "")
            receiving_number = data.get("to")

        if not customer_phone or not message_text:
            return Response(content="<Response></Response>", media_type="text/xml")

        restaurant = db.query(Restaurant).filter(Restaurant.whatsapp_number == receiving_number).first()
        
        if not restaurant:
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

        # Twilio ko XML (TwiML) response bhejo
        return Response(content="<Response></Response>", media_type="text/xml")
        
    except Exception as e:
        print(f"Webhook Error: {e}")
        return Response(content="<Response></Response>", media_type="text/xml")