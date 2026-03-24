import os
import time
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

# Test each model with a VERY simple prompt
ALL_MODELS = [
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "arcee-ai/trinity-large-preview:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4.5-air:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "stepfun/step-3.5-flash:free",
    "minimax/minimax-m2.5:free",
    "qwen/qwen3-4b:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
]

COMP_URL = "https://openrouter.ai/api/v1/chat/completions"
COMP_HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-Title": "Pathfinder AI Test",
}

print("=== Model Availability Check ===")
working = []

for model in ALL_MODELS:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Say OK"}],
        "max_tokens": 5,
        "temperature": 0.0,
    }
    try:
        resp = requests.post(COMP_URL, headers=COMP_HEADERS, json=payload, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("choices"):
                print(f"PASS: {model}")
                working.append(model)
            else:
                print(f"EMPTY: {model}")
        else:
            print(f"FAIL {resp.status_code}: {model}")
    except Exception as e:
        print(f"ERR: {model} - {str(e)[:50]}")
    
    time.sleep(0.2)

print(f"\nTotal working: {len(working)}")
for m in working:
    print(f"  {m}")
