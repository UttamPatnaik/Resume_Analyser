from dataclasses import dataclass
from typing import List


@dataclass
class QualityReport:
    score: int
    status: str
    warnings: List[str]


class DocumentQualityService:
    """
    Evaluates the quality of extracted document text.

    This service does NOT determine whether a document is a resume.
    It only answers:

    'Can we trust the extracted text?'
    """

    MIN_WORDS = 80
    MIN_CHARACTERS = 500

    def evaluate(
        self,
        text: str,
        pages: int,
    ) -> QualityReport:

        warnings = []

        words = len(text.split())
        characters = len(text)

        score = 100

        # -----------------------------
        # Too little extracted text
        # -----------------------------
        if words < self.MIN_WORDS:
            warnings.append("Very little text extracted.")
            score -= 40

        if characters < self.MIN_CHARACTERS:
            warnings.append("Character count is unusually low.")
            score -= 20

        # -----------------------------
        # Empty document
        # -----------------------------
        if text.strip() == "":
            warnings.append("Document contains no readable text.")
            score = 0

        # -----------------------------
        # Multi-page but almost no text
        # -----------------------------
        if pages > 1 and words < 100:
            warnings.append(
                "Multi-page document with unusually little text."
            )
            score -= 20

        # -----------------------------
        # Determine status
        # -----------------------------
        score = max(score, 0)

        if score >= 90:
            status = "EXCELLENT"
        elif score >= 75:
            status = "GOOD"
        elif score >= 50:
            status = "FAIR"
        else:
            status = "POOR"

        return QualityReport(
            score=score,
            status=status,
            warnings=warnings,
        )