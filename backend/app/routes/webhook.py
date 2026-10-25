from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant
from app.agent.graph import app as agent_app
from app.services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/webhook", tags=["WhatsApp Webhook"])

def process_agent_reply(restaurant_id: int, menu: dict, customer_phone: str, message: str, receiving_number: str):
    """Yeh function background mein chalta hai taake webhook jaldi reply kar sake"""
    
    # Agent ko chalao
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
    
    # Jawab bhejo
    send_whatsapp_message(to_phone=customer_phone, message=ai_response)

@router.post("/web2c")
async def web2c_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Web2C se message aane par yeh trigger hota hai"""
    try:
        data = await request.json()
        
        # Web2C ke format ke mutabiq data nikaalna
        # (Agar Web2C ka format thoda alag ho toh yahan change karna padega)
        customer_phone = data.get("from") 
        message_text = data.get("text", {}).get("body", "")
        receiving_number = data.get("to")
        
        if not customer_phone or not message_text:
            return {"status": "ignored"}

        # Restaurant dhoondo kis number par message aaya hai
        restaurant = db.query(Restaurant).filter(Restaurant.whatsapp_number == receiving_number).first()
        
        if not restaurant:
            return {"status": "unknown number"}

        # Background task mein AI chalao taake webhook 200 OK wapas de sake
        background_tasks.add_task(
            process_agent_reply, 
            restaurant.id, 
            restaurant.menu, 
            customer_phone, 
            message_text,
            receiving_number
        )

        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook Error: {e}")
        return {"status": "error"}