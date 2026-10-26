FROM python:3.11-slim

# System dependencies install karein (Tesseract + Poppler)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Working directory set karein
WORKDIR /app

# Requirements copy karein aur install karein
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baaki saara code copy karein
COPY . .

# Server start karein
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
