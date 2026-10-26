from app.agent.state import AgentState
from app.services.ai_manager import get_llm
import json

def intent_node(state: AgentState):
    """Customer ka message padh kar intent decide karta hai"""
    prompt = f"""
    Customer message: "{state['message']}"
    Menu: {json.dumps(state['menu'])}
    
    Classify the intent into exactly one word from these: 'menu', 'order', 'status', 'other'.
    Return only the single word.
    """
    try:
        client = get_llm()  # <-- OpenRouter Client
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=[{"role": "user", "content": prompt}]
        )
        intent = response.choices[0].message.content.strip().lower()
        if intent not in ['menu', 'order', 'status', 'other']:
            intent = 'other'
    except Exception as e:
        print(f"Intent Error: {e}")
        intent = 'other'
        
    return {"intent": intent}

def menu_node(state: AgentState):
    if not state['menu']:
        return {"response": "Maaf kijiyega, is waqt menu available nahi hai."}
    menu_text = "🍽️ *Hamara Menu:*\n\n"
    for item, details in state['menu'].items():
        menu_text += f"• {item}: {details['price']} PKR\n"
    menu_text += "\nOrder karne ke liye item ka naam likhein."
    return {"response": menu_text}

def order_node(state: AgentState):
    return {"response": "Aapka order note kar liya gaya hai. Jald confirm kiya jayega!"}

def status_node(state: AgentState):
    return {"response": "Aapka order abhi tayyar ho raha hai. 15 minute mein mil jayega."}

def human_node(state: AgentState):
    return {"response": "Mujhe samajh nahi aaya. Maine aapki message owner ko forward kar di hai."}

def route_intent(state: AgentState):
    return state["intent"]