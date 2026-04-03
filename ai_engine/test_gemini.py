import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# These are the 3 ways Google identifies the model across different regions/versions
models_to_try = [
    'gemini-1.5-flash',      # Standard
    'models/gemini-1.5-flash', # Explicit path
    'gemini-pro'             # Legacy fallback
]

print(f"Testing Gemini Connection...")

for model_name in models_to_try:
    try:
        print(f"Trying model: {model_name}...", end=" ")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Testing connection. Reply with 'OK'.")
        print(f"SUCCESS! -> {response.text}")
        break # Stop if we find one that works
    except Exception as e:
        print(f"FAILED.")
        if model_name == models_to_try[-1]:
            print(f"\nAll models failed. Last Error: {str(e)}")