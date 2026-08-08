from fastapi import APIRouter, File, UploadFile

from app.schemas.resume import ResumeAnalysisResponse
from app.services.resume.analysis_service import ResumeService

router = APIRouter(
    prefix="/api",
    tags=["Resume Analysis"],
)

resume_service = ResumeService()


@router.post(
    "/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume(
    resume_file: UploadFile = File(...),
):
    return await resume_service.analyze_resume(resume_file)