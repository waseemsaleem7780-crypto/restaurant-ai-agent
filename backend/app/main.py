from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import admin, restaurant, webhook

# Database tables create karein
Base.metadata.create_all(bind=engine)

# FastAPI app initialize karein
app = FastAPI(
    title="Restaurant WhatsApp Agent API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://restaurant-ai-agent-omega.vercel.app",  # Aapka Vercel Link
        "http://localhost:5173",                          # Local testing
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes include karein
app.include_router(admin.router)
app.include_router(restaurant.router)
app.include_router(webhook.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running perfectly!"}