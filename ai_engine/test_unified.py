import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
# The new Client automatically handles the correct API version (v1)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Testing Unified SDK Connection...")

try:
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents="Hello! If you can read this, our connection is finally fixed."
    )
    print("SUCCESS! Gemini says:", response.text)
except Exception as e:
    print(f"FAILED again. Error details: {str(e)}")