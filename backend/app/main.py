from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from moviepy import VideoFileClip
from sentence_transformers import SentenceTransformer

from app.database import engine, SessionLocal, Base
from app.models import UploadedContent

import os
import shutil
import fitz
import whisper
import faiss
import numpy as np

app = FastAPI()

Base.metadata.create_all(bind=engine)

API_KEY = "raju123"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

model = whisper.load_model("small")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

stored_text = ""
document_chunks = []
document_embeddings = None
stored_timestamps = []


def verify_api_key(x_api_key: str):
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )


@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }


def create_vector_store(text):
    global document_chunks
    global document_embeddings

    document_chunks = text.split(". ")

    if len(document_chunks) == 0:
        document_chunks = [text]

    embeddings = embedding_model.encode(
        document_chunks
    )

    embeddings = np.array(
        embeddings
    ).astype("float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    document_embeddings = index


def transcribe_audio(audio_path):

    result = model.transcribe(
        audio_path,
        fp16=False,
        task="translate",
        language="te",
        verbose=False,
        temperature=0
    )

    text = result["text"]

    timestamps = []

    for segment in result["segments"]:

        if segment["text"].strip():

            timestamps.append({
                "start": round(segment["start"], 2),
                "end": round(segment["end"], 2),
                "text": segment["text"]
            })

    return {
        "text": text,
        "timestamps": timestamps
    }


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    x_api_key: str = Header(...)
):

    verify_api_key(x_api_key)

    global stored_text
    global stored_timestamps

    try:

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        extracted_text = ""

        # PDF
        if file.filename.endswith(".pdf"):

            doc = fitz.open(file_path)

            for page in doc:
                extracted_text += page.get_text()

            extracted_text = extracted_text.replace(
                "\n",
                " "
            )

            stored_text = extracted_text
            stored_timestamps = []

            create_vector_store(stored_text)

            db = SessionLocal()

            new_data = UploadedContent(
                file_name=file.filename,
                file_type="pdf",
                extracted_text=stored_text
            )

            db.add(new_data)
            db.commit()
            db.close()

            return {
                "summary":
                f"""
PDF uploaded successfully.

File Name:
{file.filename}

Extracted Preview:

{extracted_text[:1200]}
""",

                "text": extracted_text,
                "timestamps": [],
                "media_url": ""
            }

        # AUDIO
        elif file.filename.endswith(
            (".mp3", ".wav")
        ):

            result = transcribe_audio(file_path)

            transcript = result["text"]
            timestamps = result["timestamps"]

            stored_text = transcript
            stored_timestamps = timestamps

            create_vector_store(stored_text)

            db = SessionLocal()

            new_data = UploadedContent(
                file_name=file.filename,
                file_type="audio",
                extracted_text=stored_text
            )

            db.add(new_data)
            db.commit()
            db.close()

            return {
                "summary":
                f"""
Audio uploaded successfully.

File Name:
{file.filename}

Transcript Preview:

{transcript[:1200]}
""",

                "text": transcript,
                "timestamps": timestamps,
                "media_url":
                f"uploads/{file.filename}"
            }

        # VIDEO
        elif file.filename.endswith(
            (".mp4", ".mov", ".avi")
        ):

            video = VideoFileClip(file_path)

            audio_path = os.path.join(
                UPLOAD_FOLDER,
                "temp_audio.mp3"
            )

            video.audio.write_audiofile(
                audio_path,
                logger=None
            )

            result = transcribe_audio(audio_path)

            transcript = result["text"]
            timestamps = result["timestamps"]

            stored_text = transcript
            stored_timestamps = timestamps

            create_vector_store(stored_text)

            db = SessionLocal()

            new_data = UploadedContent(
                file_name=file.filename,
                file_type="video",
                extracted_text=stored_text
            )

            db.add(new_data)
            db.commit()
            db.close()

            return {
                "summary":
                f"""
Video uploaded successfully.

File Name:
{file.filename}

Transcript Preview:

{transcript[:1200]}
""",

                "text": transcript,
                "timestamps": timestamps,
                "media_url":
                f"uploads/{file.filename}"
            }

        else:
            return {
                "summary": "Unsupported file format.",
                "text": "",
                "timestamps": [],
                "media_url": ""
            }

    except Exception as e:

        return {
            "summary": f"Error: {str(e)}",
            "text": "",
            "timestamps": [],
            "media_url": ""
        }


@app.post("/chat")
async def chat(
    question: dict,
    x_api_key: str = Header(...)
):

    verify_api_key(x_api_key)

    global stored_text
    global document_embeddings
    global document_chunks

    user_question = question.get(
        "question",
        ""
    ).lower()

    if stored_text == "":
        return {
            "answer":
            "No uploaded content available."
        }

    if (
        "summary" in user_question
        or
        "summarize" in user_question
    ):

        words = stored_text.split()

        short_summary = " ".join(words[:100])

        answer = f"""
Summary:

{short_summary}
"""

    else:

        query_embedding = embedding_model.encode(
            [user_question]
        )

        query_embedding = np.array(
            query_embedding
        ).astype("float32")

        D, I = document_embeddings.search(
            query_embedding,
            k=3
        )

        results = []

        for idx in I[0]:

            if idx < len(document_chunks):
                results.append(
                    document_chunks[idx]
                )

        if len(results) > 0:
            answer = results[0]
        else:
            answer = "No relevant answer found."

    return {
        "answer": answer
    }