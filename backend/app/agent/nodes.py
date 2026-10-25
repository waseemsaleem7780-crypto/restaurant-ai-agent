from app.agent.state import AgentState
from langchain_groq import ChatGroq
from app.config import settings
import json

# LLM Setup (Groq)
llm = ChatGroq(
    model="llama-3.1-8b-instant",  # <-- Groq ka abhi ka sabse fast aur live model
    temperature=0,
    groq_api_key=settings.GROQ_API_KEY
)

def intent_node(state: AgentState):
    """Customer ka message padh kar intent (fees/order/menu) decide karta hai"""
    prompt = f"""
    Customer message: "{state['message']}"
    Menu: {json.dumps(state['menu'])}
    
    Classify the intent into exactly one word from these: 'menu', 'order', 'status', 'other'.
    Return only the single word.
    """
    try:
        response = llm.invoke(prompt)
        intent = response.content.strip().lower()
        if intent not in ['menu', 'order', 'status', 'other']:
            intent = 'other'
    except Exception:
        intent = 'other' # Agar AI fail ho jaye
        
    return {"intent": intent}

def menu_node(state: AgentState):
    """Customer ko menu bhejta hai"""
    if not state['menu']:
        return {"response": "Maaf kijiyega, is waqt menu available nahi hai."}
    
    menu_text = "🍽️ *Hamara Menu:*\n\n"
    for item, details in state['menu'].items():
        menu_text += f"• {item}: {details['price']} PKR\n"
    menu_text += "\nOrder karne ke liye item ka naam likhein."
    
    return {"response": menu_text}

def order_node(state: AgentState):
    """Customer ka order leta hai (Abhi ke liye simple message)"""
    return {"response": "Aapka order note kar liya gaya hai. Jald confirm kiya jayega!"}

def status_node(state: AgentState):
    """Order status check karta hai"""
    return {"response": "Aapka order abhi tayyar ho raha hai. 15 minute mein mil jayega."}

def human_node(state: AgentState):
    """Agar AI samajh na paye"""
    return {"response": "Mujhe samajh nahi aaya. Maine aapki message owner ko forward kar di hai."}

def route_intent(state: AgentState):
    """Conditional edge ka faisla"""
    return state["intent"]