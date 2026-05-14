import sys
import os
import tempfile

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

API_KEY = "raju123"


def test_home():

    response = client.get("/")

    assert response.status_code == 200


def test_chat_without_content():

    response = client.post(
        "/chat",
        json={
            "question": "hello"
        },
        headers={
            "x-api-key": API_KEY
        }
    )

    assert response.status_code == 200


def test_invalid_api_key():

    response = client.post(
        "/chat",
        json={
            "question": "hello"
        },
        headers={
            "x-api-key": "wrong"
        }
    )

    assert response.status_code == 401


def test_upload_without_file():

    response = client.post(
        "/upload",
        headers={
            "x-api-key": API_KEY
        }
    )

    assert response.status_code == 422


def test_upload_invalid_file():

    with open(__file__, "rb") as file:

        response = client.post(
            "/upload",
            files={
                "file": (
                    "test.txt",
                    file,
                    "text/plain"
                )
            },
            headers={
                "x-api-key": API_KEY
            }
        )

    assert response.status_code == 200


def test_pdf_upload():

    pdf_content = b"%PDF-1.4 test pdf"

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_pdf:

        temp_pdf.write(pdf_content)

        temp_pdf.seek(0)

        with open(temp_pdf.name, "rb") as pdf_file:

            response = client.post(
                "/upload",
                files={
                    "file": (
                        "sample.pdf",
                        pdf_file,
                        "application/pdf"
                    )
                },
                headers={
                    "x-api-key": API_KEY
                }
            )

    assert response.status_code == 200


def test_summary_question():

    response = client.post(
        "/chat",
        json={
            "question": "summary"
        },
        headers={
            "x-api-key": API_KEY
        }
    )

    assert response.status_code == 200