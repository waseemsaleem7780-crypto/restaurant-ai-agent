from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import admin, restaurant, webhook # webhook add kiya

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Restaurant WhatsApp Agent API",
    description="Multi-Restaurant AI Agent Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes jodo
app.include_router(admin.router)
app.include_router(restaurant.router)
app.include_router(webhook.router) # Yeh naya add hua

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running perfectly!"}