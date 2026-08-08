from dataclasses import dataclass

import fitz  # PyMuPDF
import pdfplumber


@dataclass
class ExtractionResult:
    text: str
    parser_used: str
    pages: int
    characters: int
    words: int
    quality: str
    has_text: bool
    is_scanned: bool


class PDFParserService:
    """
    Service responsible for extracting text from PDF resumes.

    Extraction strategy:
    1. Try PyMuPDF first.
    2. Evaluate the extracted text.
    3. Fall back to pdfplumber when extraction quality is poor.
    4. Detect PDFs that appear to be scanned/image-only documents.

    OCR is intentionally not performed here yet.
    """

    MIN_WORDS = 80
    MIN_CHARACTERS = 300

    def extract_text(
        self,
        file_bytes: bytes,
        filename: str,
    ) -> ExtractionResult:

        if not filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are supported.")

        # -----------------------------------------
        # 1. Try PyMuPDF
        # -----------------------------------------
        pymupdf_result = self._extract_pymupdf(file_bytes)

        if self._is_good_extraction(pymupdf_result):
            return pymupdf_result

        # -----------------------------------------
        # 2. Fall back to pdfplumber
        # -----------------------------------------
        pdfplumber_result = self._extract_pdfplumber(file_bytes)

        # -----------------------------------------
        # 3. Return the better result
        # -----------------------------------------
        if self._extraction_score(pdfplumber_result) > self._extraction_score(
            pymupdf_result
        ):
            return pdfplumber_result

        return pymupdf_result

    # =========================================================
    # PyMuPDF extraction
    # =========================================================

    def _extract_pymupdf(
        self,
        file_bytes: bytes,
    ) -> ExtractionResult:

        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

        page_texts = []

        for page in document:
            # "text" gives us the normal reading-oriented extraction.
            page_text = page.get_text("text")

            if page_text:
                page_texts.append(page_text.strip())

        page_count = len(document)

        document.close()

        text = self._clean_text(
            "\n\n".join(page_texts)
        )

        return self._build_result(
            text=text,
            parser_used="PyMuPDF",
            pages=page_count,
        )

    # =========================================================
    # pdfplumber fallback
    # =========================================================

    def _extract_pdfplumber(
        self,
        file_bytes: bytes,
    ) -> ExtractionResult:

        import io

        page_texts = []

        with pdfplumber.open(
            io.BytesIO(file_bytes)
        ) as pdf:

            page_count = len(pdf.pages)

            for page in pdf.pages:
                extracted = page.extract_text()

                if extracted:
                    page_texts.append(
                        extracted.strip()
                    )

        text = self._clean_text(
            "\n\n".join(page_texts)
        )

        return self._build_result(
            text=text,
            parser_used="pdfplumber",
            pages=page_count,
        )

    # =========================================================
    # Result construction
    # =========================================================

    def _build_result(
        self,
        text: str,
        parser_used: str,
        pages: int,
    ) -> ExtractionResult:

        words = len(text.split())
        characters = len(text)

        has_text = (
            words > 0
            and characters > 0
        )

        is_scanned = self._looks_scanned(
            text=text,
            words=words,
        )

        quality = self._calculate_quality(
            text=text,
            words=words,
            characters=characters,
            is_scanned=is_scanned,
        )

        return ExtractionResult(
            text=text,
            parser_used=parser_used,
            pages=pages,
            characters=characters,
            words=words,
            quality=quality,
            has_text=has_text,
            is_scanned=is_scanned,
        )

    # =========================================================
    # Text cleaning
    # =========================================================

    def _clean_text(
        self,
        text: str,
    ) -> str:

        if not text:
            return ""

        lines = []

        for line in text.splitlines():

            # Remove excessive whitespace.
            cleaned_line = " ".join(
                line.split()
            )

            if cleaned_line:
                lines.append(cleaned_line)

        return "\n".join(lines).strip()

    # =========================================================
    # Quality evaluation
    # =========================================================

    def _calculate_quality(
        self,
        text: str,
        words: int,
        characters: int,
        is_scanned: bool,
    ) -> str:

        if is_scanned:
            return "Poor"

        if (
            words < self.MIN_WORDS
            or characters < self.MIN_CHARACTERS
        ):
            return "Poor"

        if words >= 500:
            return "Excellent"

        if words >= 250:
            return "Good"

        return "Average"

    def _is_good_extraction(
        self,
        result: ExtractionResult,
    ) -> bool:

        return (
            result.has_text
            and not result.is_scanned
            and result.words >= self.MIN_WORDS
            and result.characters >= self.MIN_CHARACTERS
            and result.quality != "Poor"
        )

    # =========================================================
    # Extraction comparison
    # =========================================================

    def _extraction_score(
        self,
        result: ExtractionResult,
    ) -> int:

        score = 0

        score += min(
            result.words,
            1000,
        )

        score += min(
            result.characters // 10,
            1000,
        )

        if result.has_text:
            score += 500

        if not result.is_scanned:
            score += 500

        if result.quality == "Excellent":
            score += 300

        elif result.quality == "Good":
            score += 200

        elif result.quality == "Average":
            score += 100

        return score

    # =========================================================
    # Scanned PDF detection
    # =========================================================

    def _looks_scanned(
        self,
        text: str,
        words: int,
    ) -> bool:

        # A PDF containing almost no extractable text
        # is likely image-based/scanned.
        if not text.strip():
            return True

        if words < 20:
            return True

        return False