from fastapi import HTTPException, UploadFile

from app.schemas.resume import ResumeAnalysisResponse

from app.services.ai.nvidia_client import NVIDIAClient

from app.services.document.parser_service import PDFParserService
from app.services.document.quality_service import DocumentQualityService
from app.services.document.classifier_service import DocumentClassifierService

from app.services.structure_analyzer import ResumeStructureAnalyzer


class ResumeService:
    """
    Handles the complete resume analysis workflow.
    """

    def __init__(self):
        self.parser = PDFParserService()
        self.quality_service = DocumentQualityService()
        self.classifier = DocumentClassifierService()
        self.structure_analyzer = ResumeStructureAnalyzer()
        self.ai_client = NVIDIAClient()

    async def analyze_resume(
        self,
        resume_file: UploadFile,
    ) -> ResumeAnalysisResponse:

        # -----------------------------------------
        # Read uploaded file
        # -----------------------------------------

        file_bytes = await resume_file.read()

        # -----------------------------------------
        # STEP 1: Extract text
        # -----------------------------------------

        extraction = self.parser.extract_text(
            file_bytes=file_bytes,
            filename=resume_file.filename,
        )

        print("\n========== EXTRACTION REPORT ==========")
        print(f"Parser      : {extraction.parser_used}")
        print(f"Pages       : {extraction.pages}")
        print(f"Words       : {extraction.words}")
        print(f"Characters  : {extraction.characters}")
        print(f"Quality     : {extraction.quality}")
        print(f"Has Text    : {extraction.has_text}")
        print(f"Scanned     : {extraction.is_scanned}")
        print("=======================================\n")

        # -----------------------------------------
        # STEP 2: Evaluate extraction quality
        # -----------------------------------------

        quality = self.quality_service.evaluate(
            text=extraction.text,
            pages=extraction.pages,
        )

        print("\n========== QUALITY REPORT ==========")
        print(f"Score    : {quality.score}")
        print(f"Status   : {quality.status}")

        if quality.warnings:
            print("Warnings:")

            for warning in quality.warnings:
                print(f" - {warning}")

        print("====================================\n")

        # -----------------------------------------
        # STEP 3: Classify document
        # -----------------------------------------

        classification = self.classifier.classify(
            extraction.text
        )

        print("\n====== DOCUMENT CLASSIFIER ======")
        print(f"Type       : {classification.document_type}")
        print(f"Confidence : {classification.confidence}")
        print(f"Reason     : {classification.reason}")
        print("=================================\n")

        if not classification.is_resume:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Uploaded document is not a resume. "
                    f"Detected: {classification.document_type}"
                ),
            )

        # -----------------------------------------
        # STEP 4: Deterministic resume analysis
        # -----------------------------------------

        structure = self.structure_analyzer.analyze(
            extraction.text
        )

        print("\n====== RESUME STRUCTURE ======")

        print(
            f"Sections   : {structure.sections_detected}"
        )

        print(
            f"Projects   : {structure.project_count}"
        )

        print(
            f"Education  : {structure.education_count}"
        )

        print(
            f"Dates      : {structure.dates_detected}"
        )

        print(
            f"URLs       : {structure.urls_detected}"
        )

        print("Contact:")

        print(
            f" - Email    : {structure.contact.email}"
        )

        print(
            f" - Phone    : {structure.contact.phone}"
        )

        print(
            f" - LinkedIn : {structure.contact.linkedin}"
        )

        print(
            f" - GitHub   : {structure.contact.github}"
        )

        print(
            f" - Portfolio: {structure.contact.portfolio}"
        )

        if structure.structural_issues:
            print("Issues:")

            for issue in structure.structural_issues:
                print(f" - {issue}")

        print("===============================\n")

        # -----------------------------------------
        # STEP 5: Send resume + deterministic
        #         facts to NVIDIA AI
        # -----------------------------------------

        result = self.ai_client.analyze_resume(
            resume_text=extraction.text,
            structure=structure,
        )

        # -----------------------------------------
        # STEP 6: Calculate final score ourselves
        # -----------------------------------------

        sections = result["sections"]

        content_score = sections["content_quality"]["score"]
        formatting_score = sections["formatting_structure"]["score"]
        keywords_score = sections["keywords_skills"]["score"]
        ats_score = sections["ats_compatibility"]["score"]

        overall_score = round(
            (content_score * 0.40)
            + (formatting_score * 0.20)
            + (keywords_score * 0.20)
            + (ats_score * 0.20)
        )

        result["overall_score"] = overall_score

        # -----------------------------------------
        # STEP 7: Determine resume level ourselves
        # -----------------------------------------

        if overall_score < 40:
            result["resume_level"] = "Poor"

        elif overall_score < 60:
            result["resume_level"] = "Average"

        elif overall_score < 75:
            result["resume_level"] = "Good"

        elif overall_score < 90:
            result["resume_level"] = "Strong"

        else:
            result["resume_level"] = "Excellent"

        # -----------------------------------------
        # STEP 8: Final resume validation
        # -----------------------------------------

        if not result.get("is_resume", True):
            raise HTTPException(
                status_code=400,
                detail=(
                    "The AI determined this is not a resume."
                ),
            )

        # -----------------------------------------
        # STEP 9: Validate response schema
        # -----------------------------------------

        return ResumeAnalysisResponse.model_validate(
            result
        )