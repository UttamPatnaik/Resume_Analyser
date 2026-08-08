from dataclasses import dataclass
from enum import Enum


class DocumentType(str, Enum):
    RESUME = "Resume"
    CV = "CV"
    PORTFOLIO = "Portfolio"
    JOB_DESCRIPTION = "Job Description"
    UNKNOWN = "Unknown"


@dataclass
class ClassificationResult:
    is_resume: bool
    document_type: DocumentType
    confidence: float
    reason: str


class DocumentClassifierService:
    """
    Lightweight document classifier.

    Uses heuristics only.

    Fast (<1ms)

    No LLM cost.
    """

    RESUME_KEYWORDS = {
        "education",
        "experience",
        "skills",
        "projects",
        "internship",
        "certifications",
        "contact",
        "email",
        "phone",
        "summary",
        "objective",
        "linkedin",
        "github",
    }

    JOB_DESCRIPTION_KEYWORDS = {
        "responsibilities",
        "requirements",
        "preferred qualifications",
        "salary",
        "benefits",
        "job description",
        "apply",
    }

    def classify(
        self,
        text: str,
    ) -> ClassificationResult:

        lower = text.lower()

        resume_matches = sum(
            keyword in lower
            for keyword in self.RESUME_KEYWORDS
        )

        jd_matches = sum(
            keyword in lower
            for keyword in self.JOB_DESCRIPTION_KEYWORDS
        )

        # Resume
        if resume_matches >= 4:
            return ClassificationResult(
                is_resume=True,
                document_type=DocumentType.RESUME,
                confidence=0.92,
                reason="Resume sections detected."
            )

        # Job Description
        if jd_matches >= 3:
            return ClassificationResult(
                is_resume=False,
                document_type=DocumentType.JOB_DESCRIPTION,
                confidence=0.90,
                reason="Job description keywords detected."
            )

        return ClassificationResult(
            is_resume=False,
            document_type=DocumentType.UNKNOWN,
            confidence=0.50,
            reason="Unable to confidently classify document."
        )