from enum import Enum

from typing import List

from pydantic import BaseModel, Field


class SectionScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    feedback: str


class ResumeSections(BaseModel):
    content_quality: SectionScore
    formatting_structure: SectionScore
    keywords_skills: SectionScore
    ats_compatibility: SectionScore

class ResumeLevel(str, Enum):
    poor = "Poor"
    average = "Average"
    good = "Good"
    strong = "Strong"
    excellent = "Excellent"


class ResumeAnalysisResponse(BaseModel):
    is_resume: bool

    overall_score: int = Field(..., ge=0, le=100)

    resume_level: ResumeLevel

    sections: ResumeSections

    major_issues: List[str]

    missing_elements: List[str]

    strengths: List[str]

    improvement_suggestions: List[str]

    ats_verdict: str

    recruiter_verdict: str