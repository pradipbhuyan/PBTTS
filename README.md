# 🎙️ Text to MP3 Converter - Full Stack Application

Convert text files to speech using Edge TTS with React frontend and FastAPI backend.

## Features

- 📝 Upload text files (single or batch up to 5)
- 🎤 Multiple Indian English voices (en-IN-NeerjaNeural default)
- 📧 Auto-email MP3 files to recipients
- 💾 Manual download from web interface
- 📦 Auto-ZIP for files > 30MB
- 🔄 Sequential processing with progress tracking
- 💤 Screen keep-alive during long conversions

## Tech Stack

- **Frontend**: React 18, Axios
- **Backend**: FastAPI, Edge TTS
- **Email**: Resend API
- **Hosting**: Vercel (Frontend) + Render (Backend)

## Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- Resend API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your RESEND_API_KEY
uvicorn main:app --reload --port 8000
