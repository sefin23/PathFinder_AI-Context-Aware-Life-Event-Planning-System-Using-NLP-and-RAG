"""
Check which models actually respond right now vs are rate-limited.
Uses tiny prompts (1 token output) to probe availability without wasting quota.
Also checks if any model IDs are wrong.
"""
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

print(f"OpenRouter key present: {'YES' if API_KEY else 'NO'}")
print(f"Gemini key present: {'YES' if GEMINI_KEY else 'NO'}")
print()

# Check OpenRouter account limits
URL = "https://openrouter.ai/api/v1/auth/key"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}
r = requests.get(URL, headers=HEADERS, timeout=10)
if r.status_code == 200:
    data = r.json()
    d = data.get("data", {})
    print("=== OpenRouter Account Info ===")
    print(f"  Label: {d.get('label', 'N/A')}")
    print(f"  Usage: ${d.get('usage', 0):.4f}")
    print(f"  Limit: {d.get('limit', 'unlimited')}")
    print(f"  Rate limit (free): {d.get('rate_limit', {})}")
    print(f"  Is Free Tier: {d.get('is_free_tier', 'unknown')}")
    print()
else:
    print(f"Could not check OpenRouter key: {r.status_code} {r.text[:100]}")

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
rate_limited = []
failing = []

for model in ALL_MODELS:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Say OK"}],
        "max_tokens": 5,
        "temperature": 0.0,
    }
    try:
        resp = requests.post(COMP_URL, headers=COMP_HEADERS, json=payload, timeout=20)
        if resp.status_code == 200:
            data = resp.json()
            choices = data.get("choices", [])
            if choices and choices[0].get("message", {}).get("content"):
                print(f"  ✅ WORKING    {model}")
                working.append(model)
            else:
                print(f"  ⚠️  EMPTY      {model}")
                failing.append(model)
        elif resp.status_code == 429:
            retry_after = resp.headers.get("X-RateLimit-Reset-Requests", "?")
            print(f"  🔴 RATE_LIMIT {model} (reset: {retry_after})")
            rate_limited.append(model)
        elif resp.status_code == 404:
            print(f"  💀 REMOVED    {model}")
            failing.append(model)
        elif resp.status_code == 400:
            try:
                err = resp.json().get("error", {}).get("message", resp.text[:60])
            except:
                err = resp.text[:60]
            print(f"  ⛔ BAD_REQ    {model}: {err}")
            failing.append(model)
        else:
            print(f"  ❓ HTTP_{resp.status_code}  {model}: {resp.text[:60]}")
            failing.append(model)
    except Exception as e:
        print(f"  💥 ERROR      {model}: {str(e)[:60]}")
        failing.append(model)
    
    time.sleep(0.5)  # small delay between checks

print(f"\n✅ Working: {len(working)} | 🔴 Rate limited: {len(rate_limited)} | ❌ Failing: {len(failing)}")
print(f"\nWorking models right now:")
for m in working:
    print(f"  {m}")

# Test Gemini key
if GEMINI_KEY:
    print("\n=== Gemini Key Status ===")
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_KEY)
        resp = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents="Say OK",
            config={"max_output_tokens": 5}
        )
        print(f"  ✅ gemini-2.0-flash-lite: WORKING — '{resp.text.strip()}'")
    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            # Extract retry time
            import re
            retry = re.search(r'retry in (\d+)', err)
            retry_s = retry.group(1) if retry else "?"
            print(f"  🔴 gemini-2.0-flash-lite: QUOTA EXHAUSTED (retry in ~{retry_s}s)")
        else:
            print(f"  ❓ gemini-2.0-flash-lite: {err[:100]}")
    
    try:
        resp = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Say OK",
            config={"max_output_tokens": 5}
        )
        print(f"  ✅ gemini-1.5-flash: WORKING — '{resp.text.strip()}'")
    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            print(f"  🔴 gemini-1.5-flash: QUOTA EXHAUSTED")
        else:
            print(f"  ❓ gemini-1.5-flash: {err[:100]}")
