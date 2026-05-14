# AI Document & Multimedia Q&A Web Application

## Project Overview

This project is an AI-powered full-stack web application that allows users to upload PDF documents, audio files, and video files, then interact with the uploaded content using an AI chatbot.

The application can:

- Upload PDF, audio, and video files
- Extract text from uploaded files
- Generate summaries
- Transcribe audio/video using Whisper AI
- Extract timestamps from media
- Play media from specific timestamps
- Perform semantic search using FAISS
- Answer questions based on uploaded content

---

# Features

## PDF Processing
- Upload PDF files
- Extract document text
- Generate summaries
- Ask questions about document content

## Audio Processing
- Upload MP3/WAV files
- Whisper AI transcription
- Timestamp extraction
- Media playback from timestamps

## Video Processing
- Upload MP4/MOV/AVI files
- Extract audio from video
- Whisper AI transcription
- Timestamp extraction
- Video playback support

## AI Chatbot
- Semantic search using FAISS
- Question answering
- Content summarization

## Security
- API key authentication

## Database
- SQLite database integration using SQLAlchemy

---

# Tech Stack

## Backend
- FastAPI
- Python
- Whisper AI
- FAISS
- SQLAlchemy
- SQLite
- MoviePy
- PyMuPDF

## Frontend
- React.js
- Axios
- HTML5 Audio/Video

---

# Project Structure

```bash
ai-doc-chatbot/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │
│   ├── uploads/
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│
├── .github/
│   └── workflows/
│       └── main.yml
│
├── docker-compose.yml
├── README.md
```

---

# Installation

## Backend Setup

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment:

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Install additional packages:

```bash
pip install httptools
```

Run backend:

```bash
uvicorn app.main:app --http httptools
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# API Endpoints

## Upload File

### Endpoint

```bash
POST /upload
```

### Supported Files

- PDF
- MP3
- WAV
- MP4
- MOV
- AVI

---

## Chatbot

### Endpoint

```bash
POST /chat
```

### Example Request

```json
{
  "question": "What is the document about?"
}
```

---

# Authentication

The backend uses API key authentication.

Example:

```bash
x-api-key: raju123
```

---

# Semantic Search

FAISS vector search is implemented for semantic document retrieval.

The chatbot retrieves the most relevant document chunks based on user queries.

---

# Timestamp Extraction

Whisper AI generates timestamps for:
- Audio files
- Video files

Users can:
- View timestamps
- Click play button
- Jump to relevant media section

---

# Screenshots

## Home Page

(Add Screenshot Here)

## PDF Upload

(Add Screenshot Here)

## Audio Upload

(Add Screenshot Here)

## Video Upload

(Add Screenshot Here)

## Timestamp Playback

(Add Screenshot Here)

---

# Docker Support

Run using Docker:

```bash
docker-compose up --build
```

---

# GitHub Actions CI/CD

GitHub Actions workflow is configured in:

```bash
.github/workflows/main.yml
```

---

# Future Improvements

- OpenAI GPT integration
- JWT authentication
- Redis caching
- Pinecone vector database
- Real-time streaming responses

---

# Author

Jallela Raju
