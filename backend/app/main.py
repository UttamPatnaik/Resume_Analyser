from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exceptions import AppException
from app.core.exception_handlers import app_exception_handler

from app.api.resume import router as resume_router

app = FastAPI(
    title="Resume Analyzer API",
    version="1.0.0",
    description="AI-powered Resume Analyzer using NVIDIA LLM",
)

app.add_exception_handler(
    AppException,
    app_exception_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We'll restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)


@app.get("/")
def root():
    return {
        "message": "Resume Analyzer API is running."
    }