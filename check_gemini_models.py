import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(override=True)
G1 = os.environ.get("GEMINI_API_KEY", "")

if not G1:
    print("No Gemini key")
    exit(1)

client = genai.Client(api_key=G1)
print("=== AVAILABLE GEMINI MODELS ===")
try:
    # This listing might fail if the key is restricted 
    # but let's try.
    for model in client.models.list():
        print(f"MODEL: {model.name} ({model.display_name})")
except Exception as e:
    print(f"Error listing models: {e}")

# Try direct generation with verified names
print("\n=== GENERATION TEST (gemini-2.0-flash-lite) ===")
try:
    # For the google-genai library, use just the model name
    # e.g. "gemini-2.0-flash-lite"
    resp = client.models.generate_content(
        model="gemini-2.0-flash-lite", 
        contents="Say HI"
    )
    print(f"SUCCESS: {resp.text}")
except Exception as e:
    print(f"FAILED: {e}")

print("\n=== GENERATION TEST (gemini-1.5-flash) ===")
try:
    resp = client.models.generate_content(
        model="gemini-1.5-flash", 
        contents="Say HI"
    )
    print(f"SUCCESS: {resp.text}")
except Exception as e:
    print(f"FAILED: {e}")
