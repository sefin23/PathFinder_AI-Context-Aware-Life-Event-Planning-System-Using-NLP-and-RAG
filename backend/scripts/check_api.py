
import requests
import json

def check_api():
    try:
        resp = requests.get("http://127.0.0.1:8000/api/life-events/3")
        print(f"Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error Text: {resp.text}")
            return
        data = resp.json()
        print(f"Tasks count: {len(data.get('tasks', []))}")
        if data.get('tasks'):
             for i, t in enumerate(data['tasks']):
                 print(f"  [{i}] {t['title']} (ID: {t['id']}) - Subtasks: {len(t.get('subtasks', []))}")
        else:
             print("No tasks in JSON response.")
             
        # Also check vault
        resp_v = requests.get("http://localhost:8000/api/vault/")
        print(f"Vault Docs count: {len(resp_v.json())}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_api()
