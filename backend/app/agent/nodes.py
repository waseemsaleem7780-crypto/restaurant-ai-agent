from app.agent.state import AgentState
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
import json

# Gemini AI Setup
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    google_api_key=settings.GEMINI_API_KEY
)

def intent_node(state: AgentState):
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