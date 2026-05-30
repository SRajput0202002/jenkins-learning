"""Tests for GET /api/message"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_message_returns_expected_fields():
    response = client.get("/api/message")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Hello from FastAPI backend"
    assert data["source"] == "fastapi-react-jenkins-demo"
