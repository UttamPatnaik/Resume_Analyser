from pathlib import Path
import json


class PromptBuilder:
    """
    Responsible for loading and preparing AI prompts.
    """

    def __init__(self):
        self.prompt_dir = (
            Path(__file__).resolve().parents[2]
            / "prompts"
        )

    def _load_prompt(self, filename: str) -> str:
        prompt_file = self.prompt_dir / filename

        if not prompt_file.exists():
            raise FileNotFoundError(
                f"Prompt file not found: {filename}"
            )

        return prompt_file.read_text(
            encoding="utf-8"
        )

    def build_resume_analysis_prompt(
        self,
        resume_text: str,
        request_id: str,
        structure=None,
    ) -> str:

        prompt = self._load_prompt(
            "resume_prompt.txt"
        )

        # Convert deterministic analysis into JSON.
        structure_data = {}

        if structure is not None:
            structure_data = {
                "sections_detected": structure.sections_detected,

                "contact": {
                    "email": structure.contact.email,
                    "phone": structure.contact.phone,
                    "linkedin": structure.contact.linkedin,
                    "github": structure.contact.github,
                    "portfolio": structure.contact.portfolio,
                },

                "skills_detected": structure.skills_detected,
                "education_detected": structure.education_detected,
                "experience_detected": structure.experience_detected,
                "projects_detected": structure.projects_detected,
                "certifications_detected": structure.certifications_detected,

                "project_count": structure.project_count,
                "education_count": structure.education_count,

                "dates_detected": structure.dates_detected,
                "urls_detected": structure.urls_detected,

                "structural_issues": structure.structural_issues,
            }

        structure_json = json.dumps(
            structure_data,
            indent=2,
        )

        prompt = prompt.replace(
            "{{request_id}}",
            request_id,
        )

        prompt = prompt.replace(
            "{{structure_data}}",
            structure_json,
        )

        prompt = prompt.replace(
            "{{resume_text}}",
            resume_text,
        )

        return prompt