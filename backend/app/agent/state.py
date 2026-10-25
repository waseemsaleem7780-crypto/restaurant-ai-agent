from typing import TypedDict, Optional, Dict, Any

class AgentState(TypedDict):
    restaurant_id: int
    menu: Dict[str, Any]
    customer_phone: str
    message: str
    intent: str          # menu, order, status, other
    response: str
    order_items: Optional[Dict[str, Any]]