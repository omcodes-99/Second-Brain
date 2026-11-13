
import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


def generate_json(prompt: str) -> dict:
    """
    Send a prompt to Gemini and return its JSON response.

    Requires GEMINI_API_KEY in the project's .env file.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Add it to your .env file."
        )

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(api_version="v1beta"),
    )

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response.")

        return json.loads(response.text)

    except json.JSONDecodeError as error:
        raise RuntimeError(
            "Gemini returned invalid JSON."
        ) from error
    except Exception as error:
        raise RuntimeError(
            f"Gemini request failed: {error}"
        ) from error
