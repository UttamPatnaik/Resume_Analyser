import json


class JSONParser:
    """
    Safely extracts and parses a JSON object from an LLM response.
    """

    def parse(self, response_text: str) -> dict:
        if not response_text:
            raise ValueError("AI response is empty.")

        cleaned = response_text.strip()

        # -----------------------------------------
        # Remove Markdown code fences if present
        # -----------------------------------------

        if "```json" in cleaned:
            cleaned = cleaned.split("```json", 1)[1]

            if "```" in cleaned:
                cleaned = cleaned.split("```", 1)[0]

        elif "```" in cleaned:
            cleaned = cleaned.split("```", 1)[1]

            if "```" in cleaned:
                cleaned = cleaned.split("```", 1)[0]

        cleaned = cleaned.strip()

        # -----------------------------------------
        # Find the JSON object
        # -----------------------------------------

        start = cleaned.find("{")

        if start == -1:
            raise ValueError(
                "AI response does not contain a JSON object."
            )

        # -----------------------------------------
        # Extract balanced JSON object
        # -----------------------------------------

        depth = 0
        in_string = False
        escaped = False
        end = None

        for index in range(start, len(cleaned)):

            char = cleaned[index]

            if in_string:

                if escaped:
                    escaped = False

                elif char == "\\":
                    escaped = True

                elif char == '"':
                    in_string = False

                continue

            if char == '"':
                in_string = True

            elif char == "{":
                depth += 1

            elif char == "}":
                depth -= 1

                if depth == 0:
                    end = index + 1
                    break

        if end is None:
            raise ValueError(
                "AI response contains incomplete JSON."
            )

        json_text = cleaned[start:end]

        # -----------------------------------------
        # Parse JSON
        # -----------------------------------------

        try:
            result = json.loads(json_text)

        except json.JSONDecodeError as exc:
            raise ValueError(
                f"AI returned invalid JSON: {exc}"
            ) from exc

        # -----------------------------------------
        # Ensure JSON object
        # -----------------------------------------

        if not isinstance(result, dict):
            raise ValueError(
                "AI response must be a JSON object."
            )

        return result