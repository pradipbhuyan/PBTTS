from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware


from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
import edge_tts
import asyncio
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TTS Converter API", version="1.0.0")

# CORS configuration - Allow all origins for testing (temporary)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://*.vercel.app",           # Allow all Vercel deployments
    "https://pbtts.vercel.app",       # Your specific frontend URL
    "https://*.onrender.com",         # Allow Render backends
]

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "https://pbtts.vercel.app",
        "https://pbtls.vercel.app",
        "https://*.vercel.app",
        "https://*.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create storage directory
MP3_STORAGE = "converted_mp3s"
os.makedirs(MP3_STORAGE, exist_ok=True)

# Serve static files
app.mount("/downloads", StaticFiles(directory=MP3_STORAGE), name="downloads")

# Health check endpoint (prevents cold starts)
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "TTS Converter API", "status": "running"}

@app.post("/convert")
async def convert_to_speech(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    # ... your existing conversion code ...
    pass

@app.post("/convert-batch")
async def convert_batch(files: list[UploadFile] = File(...), background_tasks: BackgroundTasks = None):
    # ... your existing batch conversion code ...
    pass

@app.get("/files")
async def list_files():
    files = []
    for f in os.listdir(MP3_STORAGE):
        if f.endswith('.mp3'):
            file_path = os.path.join(MP3_STORAGE, f)
            files.append({
                "filename": f,
                "size": os.path.getsize(file_path),
                "download_url": f"/downloads/{f}"
            })
    return {"files": files}

# Run with: uvicorn main:app --host 0.0.0.0 --port 8000
