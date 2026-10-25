from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.nodes import intent_node, menu_node, order_node, status_node, human_node, route_intent

# Graph banao
workflow = StateGraph(AgentState)

# Nodes add karo
workflow.add_node("intent", intent_node)
workflow.add_node("menu", menu_node)
workflow.add_node("order", order_node)
workflow.add_node("status", status_node)
workflow.add_node("other", human_node)

# Edges jodo
workflow.add_edge(START, "intent")

# Conditional routing
workflow.add_conditional_edges(
    "intent",
    route_intent,
    {
        "menu": "menu",
        "order": "order",
        "status": "status",
        "other": "other"
    }
)

# Sab nodes END par jayenge
workflow.add_edge("menu", END)
workflow.add_edge("order", END)
workflow.add_edge("status", END)
workflow.add_edge("other", END)

# Compile
app = workflow.compile()