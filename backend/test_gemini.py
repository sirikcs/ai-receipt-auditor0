from dotenv import load_dotenv
from google import genai
import os

print("Starting Gemini test...")

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: Gemini API key not found!")
else:
    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents="Reply with exactly: Gemini is working!"
        )

        print("SUCCESS!")
        print(response.text)

    except Exception as e:
        print("GEMINI TEST FAILED:")
        print(repr(e))