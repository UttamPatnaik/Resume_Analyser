import time

import requests

from app.core.config import settings
from app.core.exceptions import (
    AIConnectionError,
    AIResponseError,
    AIInvalidJSONError,
)
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.json_parser import JSONParser


class NVIDIAClient:
    """
    Client responsible for communicating with NVIDIA's LLM API.

    Responsibilities:
    - Build the request
    - Send the request
    - Handle NVIDIA API communication errors
    - Parse the AI response

    Prompt construction is handled by PromptBuilder.
    JSON parsing is handled by JSONParser.
    """

    def __init__(self):
        self.api_url = settings.NVIDIA_API_URL
        self.api_key = settings.NVIDIA_API_KEY
        self.model = settings.MODEL_NAME
        self.timeout = settings.REQUEST_TIMEOUT

        self.prompt_builder = PromptBuilder()
        self.json_parser = JSONParser()

    def analyze_resume(
        self,
        resume_text: str,
        structure,
    ) -> dict:
        """
        Analyze a resume using NVIDIA's LLM.

        The LLM receives:
        - Extracted resume text
        - Deterministic structural analysis
        """

        # -----------------------------------
        # 1. Generate request ID
        # -----------------------------------

        request_id = str(time.time())

        # -----------------------------------
        # 2. Build prompt
        # -----------------------------------

        prompt = self.prompt_builder.build_resume_analysis_prompt(
            resume_text=resume_text,
            request_id=request_id,
            structure=structure,
        )

        # -----------------------------------
        # 3. Prepare request
        # -----------------------------------

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "temperature": 0.5,
            "max_tokens": 2048,
            "stream": False,
        }

        # -----------------------------------
        # 4. Call NVIDIA API
        # -----------------------------------

        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )

            response.raise_for_status()

        except requests.RequestException as exc:
            raise AIConnectionError(
                message="Unable to communicate with the AI service.",
                code="AI_CONNECTION_ERROR",
            ) from exc

        # -----------------------------------
        # 5. Extract AI response
        # -----------------------------------

        try:
            response_data = response.json()

            ai_response = (
                response_data["choices"][0]
                ["message"]
                ["content"]
            )

        except (
            KeyError,
            IndexError,
            TypeError,
            ValueError,
        ) as exc:
            raise AIResponseError(
                message="AI service returned an unexpected response.",
                code="AI_RESPONSE_ERROR",
            ) from exc

        # -----------------------------------
        # 6. Parse JSON response
        # -----------------------------------

        try:
            return self.json_parser.parse(
                ai_response
            )

        except ValueError as exc:

            print("\n========== RAW AI RESPONSE ==========")
            print(ai_response)
            print("=====================================\n")

            raise AIInvalidJSONError(
                message="AI service returned an invalid analysis response.",
                code="AI_INVALID_JSON",
            ) from exc