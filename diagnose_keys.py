import os
import time
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
OR1 = os.environ.get("OPENROUTER_API_KEY", "")
OR2 = os.environ.get("OPENROUTER_API_KEY_SECONDARY", "")
G1 = os.environ.get("GEMINI_API_KEY", "")
G2 = os.environ.get("GEMINI_API_KEY_SECONDARY", "")

def test_or_key(key, name):
    if not key: return f"{name}: MISSING"
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model": "qwen/qwen3-4b:free", "messages": [{"role": "user", "content": "HI"}], "max_tokens": 5}
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=10)
        return f"{name}: {r.status_code} - {r.text[:50]}"
    except Exception as e:
        return f"{name}: ERROR - {str(e)}"

def test_gemini_key(key, name):
    if not key: return f"{name}: MISSING"
    try:
        from google import genai
        client = genai.Client(api_key=key)
        # Try a few models to see if any work
        for m in ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-lite-preview-02-05"]:
            try:
                # Need to use the correct model ID for the library
                # The GenAI library is picky. 
                # Let's try simple strings first.
                resp = client.models.generate_content(model=m, contents="HI")
                return f"{name} ({m}): SUCCESS"
            except Exception as e:
                if "429" in str(e) or "EXHAUSTED" in str(e):
                    continue
                else:
                    return f"{name} ({m}): ERROR - {str(e)[:50]}"
        return f"{name}: ALL MODELS EXHAUSTED"
    except Exception as e:
        return f"{name}: INITIALIZATION ERROR - {str(e)}"

print("=== KEY DIAGNOSTICS ===")
print(test_or_key(OR1, "OpenRouter Primary"))
print(test_or_key(OR2, "OpenRouter Secondary"))
print(test_gemini_key(G1, "Gemini Primary"))
print(test_gemini_key(G2, "Gemini Secondary"))
