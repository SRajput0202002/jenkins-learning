"""
FastAPI backend for the Jenkins CI/CD learning project.

Endpoints:
  GET /health       - Liveness probe for deploy validation
  GET /api/message  - Sample API consumed by the React frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FastAPI React Jenkins Demo",
    description="Backend API for fullstack DevOps learning",
    version="1.0.0",
)

# Allow local dev (Vite) and containerized frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://frontend:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check used by Docker, Jenkins, and load balancers."""
    return {"status": "ok"}


@app.get("/api/message")
def get_message():
    """Returns a JSON message displayed on the React homepage."""
    return {
        "message": "Hello from FastAPI backend",
        "source": "fastapi-react-jenkins-demo",
    }
