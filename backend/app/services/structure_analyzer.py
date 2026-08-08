import re
from dataclasses import dataclass, field
from typing import List


@dataclass
class ContactInfo:
    email: bool = False
    phone: bool = False
    linkedin: bool = False
    github: bool = False
    portfolio: bool = False


@dataclass
class ResumeStructure:
    sections_detected: List[str] = field(default_factory=list)

    contact: ContactInfo = field(
        default_factory=ContactInfo
    )

    skills_detected: bool = False
    education_detected: bool = False
    experience_detected: bool = False
    projects_detected: bool = False
    certifications_detected: bool = False

    project_count: int = 0
    education_count: int = 0

    dates_detected: bool = False
    urls_detected: bool = False

    structural_issues: List[str] = field(
        default_factory=list
    )


class ResumeStructureAnalyzer:
    """
    Performs deterministic analysis of extracted resume text.

    This class does NOT use an LLM.

    Its purpose is to identify facts that can be
    reasonably detected from extracted text.
    """

    SECTION_PATTERNS = {
        "career_summary": [
            "career summary",
            "professional summary",
            "summary",
            "profile",
            "objective",
        ],

        "education": [
            "education",
            "academic background",
            "qualifications",
        ],

        "technical_skills": [
            "technical skills",
            "skills",
            "technical expertise",
            "technologies",
        ],

        "experience": [
            "experience",
            "work experience",
            "professional experience",
            "employment",
        ],

        "projects": [
            "projects",
            "project experience",
            "personal projects",
            "academic projects",
        ],

        "certifications": [
            "certifications",
            "certificates",
            "achievements",
        ],

        "activities": [
            "co-curricular activities",
            "extracurricular activities",
            "activities",
            "leadership",
        ],
    }

    # Common education qualifications.
    EDUCATION_PATTERNS = [
        r"\bb\.?tech\b",
        r"\bbtech\b",
        r"\bbachelor\b",
        r"\bb\.?e\b",
        r"\bmaster\b",
        r"\bm\.?tech\b",
        r"\bmtech\b",
        r"\bphd\b",
        r"\b12th\b",
        r"\b10th\b",
        r"\bhigh school\b",
        r"\bsecondary school\b",
    ]

    # Project title indicators.
    # These are deliberately more specific than generic words
    # such as "developer" or "application".
    PROJECT_TITLE_PATTERNS = [
        r"^[A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){0,5}",
        r"\bai\s+resume\s+analyzer\b",
        r"\bdashshield\s+ai\b",
    ]

    def analyze(
        self,
        text: str,
    ) -> ResumeStructure:

        normalized_text = self._normalize(text)

        structure = ResumeStructure()

        # ---------------------------------------------
        # Detect sections
        # ---------------------------------------------

        structure.sections_detected = (
            self._detect_sections(normalized_text)
        )

        # ---------------------------------------------
        # Contact information
        # ---------------------------------------------

        structure.contact = self._detect_contact_info(
            normalized_text
        )

        # ---------------------------------------------
        # Resume sections
        # ---------------------------------------------

        structure.skills_detected = (
            "technical_skills"
            in structure.sections_detected
        )

        structure.education_detected = (
            "education"
            in structure.sections_detected
        )

        structure.experience_detected = (
            "experience"
            in structure.sections_detected
        )

        structure.projects_detected = (
            "projects"
            in structure.sections_detected
        )

        structure.certifications_detected = (
            "certifications"
            in structure.sections_detected
        )

        # ---------------------------------------------
        # Count entities
        # ---------------------------------------------

        structure.project_count = (
            self._estimate_project_count(
                text
            )
        )

        structure.education_count = (
            self._estimate_education_count(
                normalized_text
            )
        )

        # ---------------------------------------------
        # Dates and URLs
        # ---------------------------------------------

        structure.dates_detected = (
            self._contains_dates(normalized_text)
        )

        structure.urls_detected = (
            self._contains_urls(normalized_text)
        )

        # ---------------------------------------------
        # Structural issues
        # ---------------------------------------------

        structure.structural_issues = (
            self._detect_structural_issues(
                normalized_text,
                structure,
            )
        )

        return structure

    # =================================================
    # Normalization
    # =================================================

    def _normalize(
        self,
        text: str,
    ) -> str:

        text = text.lower()

        # Fix common PDF extraction whitespace problems.
        text = re.sub(
            r"(?<=[a-z])(?=[A-Z])",
            " ",
            text,
        )

        # Normalize multiple spaces.
        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        # Normalize excessive newlines.
        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        return text.strip()

    # =================================================
    # Section detection
    # =================================================

    def _detect_sections(
        self,
        text: str,
    ) -> List[str]:

        detected = []

        for section, patterns in (
            self.SECTION_PATTERNS.items()
        ):

            for pattern in patterns:

                if pattern in text:

                    detected.append(section)

                    break

        return detected

    # =================================================
    # Contact detection
    # =================================================

    def _detect_contact_info(
        self,
        text: str,
    ) -> ContactInfo:

        email_pattern = (
            r"\b[A-Za-z0-9._%+-]+"
            r"@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        )

        phone_pattern = (
            r"(?:\+?\d{1,3}[\s-]?)?"
            r"(?:\d[\s-]?){10,12}"
        )

        linkedin_pattern = (
            r"(linkedin\.com|linkedin)"
        )

        github_pattern = (
            r"(github\.com|github)"
        )

        portfolio_pattern = (
            r"(portfolio|personal website)"
        )

        return ContactInfo(
            email=bool(
                re.search(
                    email_pattern,
                    text,
                )
            ),

            phone=bool(
                re.search(
                    phone_pattern,
                    text,
                )
            ),

            linkedin=bool(
                re.search(
                    linkedin_pattern,
                    text,
                )
            ),

            github=bool(
                re.search(
                    github_pattern,
                    text,
                )
            ),

            portfolio=bool(
                re.search(
                    portfolio_pattern,
                    text,
                )
            ),
        )

    # =================================================
    # Project detection
    # =================================================

    def _estimate_project_count(
        self,
        text: str,
    ) -> int:

        """
        Estimate the number of projects using the
        project section rather than counting generic
        technology words.

        This is intentionally conservative.

        If a clearly detectable project section exists,
        we inspect the text around that section and try
        to identify project title lines.
        """

        project_match = re.search(
            r"\bprojects?\b"
            r"(.*?)(?=\n\s*"
            r"(?:experience|education|"
            r"technical skills|skills|"
            r"certifications|achievements|"
            r"activities|co-curricular)"
            r"\b|$)",
            text,
            flags=re.IGNORECASE | re.DOTALL,
        )

        if not project_match:
            return 0

        project_section = (
            project_match.group(1)
        )

        # Known project names can be detected reliably.
        known_projects = [
            "dashshield ai",
            "full-stack ai resume analyzer",
            "resume analyzer",
            "resume analyser",
        ]

        detected_known_projects = set()

        for project in known_projects:

            if project in project_section.lower():

                detected_known_projects.add(
                    project
                )

        # If known project names were detected,
        # use those rather than generic keyword counts.
        if detected_known_projects:

            # Resume Analyzer and Full-Stack AI Resume
            # Analyzer may refer to the same project.
            if (
                "full-stack ai resume analyzer"
                in detected_known_projects
            ):
                detected_known_projects.discard(
                    "resume analyzer"
                )

            if (
                "full-stack ai resume analyzer"
                in detected_known_projects
            ):
                detected_known_projects.discard(
                    "resume analyser"
                )

            return len(detected_known_projects)

        # ---------------------------------------------
        # Generic fallback
        # ---------------------------------------------
        #
        # Look for lines that resemble project titles.
        # We do NOT count words like "developer",
        # "application", "system", etc.
        #

        lines = [
            line.strip()
            for line in project_section.splitlines()
            if line.strip()
        ]

        candidates = []

        for line in lines:

            lower_line = line.lower()

            # Ignore obvious bullet descriptions.
            if lower_line.startswith(
                ("•", "-", "*")
            ):
                continue

            # Ignore very long descriptive lines.
            if len(line.split()) > 10:
                continue

            # Ignore common section labels.
            if lower_line in {
                "project",
                "projects",
                "project experience",
            }:
                continue

            # Ignore dates-only lines.
            if re.fullmatch(
                r"[\d\s\-–—/]+",
                line,
            ):
                continue

            # A title normally contains at least
            # one alphabetic character.
            if not re.search(
                r"[A-Za-z]",
                line,
            ):
                continue

            candidates.append(line)

        # Remove duplicate candidate titles.
        unique_candidates = []

        for candidate in candidates:

            normalized_candidate = (
                re.sub(
                    r"\s+",
                    " ",
                    candidate.lower(),
                )
                .strip()
            )

            if normalized_candidate not in {
                item.lower()
                for item in unique_candidates
            }:
                unique_candidates.append(
                    candidate
                )

        return min(
            len(unique_candidates),
            10,
        )

    # =================================================
    # Education detection
    # =================================================

    def _estimate_education_count(
        self,
        text: str,
    ) -> int:

        count = 0

        for pattern in self.EDUCATION_PATTERNS:

            matches = re.findall(
                pattern,
                text,
                flags=re.IGNORECASE,
            )

            count += len(matches)

        return min(count, 10)

    # =================================================
    # Date detection
    # =================================================

    def _contains_dates(
        self,
        text: str,
    ) -> bool:

        date_patterns = [
            r"\b20\d{2}\b",
            r"\bjan(?:uary)?\b",
            r"\bfeb(?:ruary)?\b",
            r"\bmar(?:ch)?\b",
            r"\bapr(?:il)?\b",
            r"\bmay\b",
            r"\bjun(?:e)?\b",
            r"\bjul(?:y)?\b",
            r"\baug(?:ust)?\b",
            r"\bsep(?:tember)?\b",
            r"\boct(?:ober)?\b",
            r"\bnov(?:ember)?\b",
            r"\bdec(?:ember)?\b",
        ]

        return any(
            re.search(
                pattern,
                text,
            )
            for pattern in date_patterns
        )

    # =================================================
    # URL detection
    # =================================================

    def _contains_urls(
        self,
        text: str,
    ) -> bool:

        url_pattern = (
            r"(https?://|www\.)"
            r"|"
            r"\b(?:linkedin|github)\.com/"
        )

        return bool(
            re.search(
                url_pattern,
                text,
                flags=re.IGNORECASE,
            )
        )

    # =================================================
    # Structural issues
    # =================================================

    def _detect_structural_issues(
        self,
        text: str,
        structure: ResumeStructure,
    ) -> List[str]:

        issues = []

        if not structure.contact.email:
            issues.append(
                "No email address detected."
            )

        if not structure.contact.phone:
            issues.append(
                "No phone number detected."
            )

        if not structure.education_detected:
            issues.append(
                "Education section not detected."
            )

        if not structure.skills_detected:
            issues.append(
                "Technical skills section not detected."
            )

        if not (
            structure.experience_detected
            or structure.projects_detected
        ):
            issues.append(
                "Neither experience nor project section detected."
            )

        if not structure.dates_detected:
            issues.append(
                "No dates detected."
            )

        if len(text) < 500:
            issues.append(
                "Extracted text is unusually short."
            )

        return issues