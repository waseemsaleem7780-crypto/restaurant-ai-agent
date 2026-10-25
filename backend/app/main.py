from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import admin, restaurant, webhook
from app import models # <-- Yeh zaroori hai taake tables banein

# Database tables create karein
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Restaurant WhatsApp Agent API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Testing ke liye, baad mein Vercel URL daal dena
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(restaurant.router)
app.include_router(webhook.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running perfectly on PostgreSQL!"}