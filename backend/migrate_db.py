from app.database import engine, Base
from sqlalchemy import text

# Tables create karo (agar nahi hain toh)
Base.metadata.create_all(bind=engine)

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE restaurants ADD COLUMN whatsapp_provider VARCHAR(50) DEFAULT 'web2c';"))
            conn.execute(text("ALTER TABLE restaurants ADD COLUMN whatsapp_api_key VARCHAR(500);"))
            conn.commit()
            print("✅ Columns successfully add ho gaye!")
        except Exception as e:
            print("Columns pehle se hain ya error:", e)

if __name__ == "__main__":
    migrate()
