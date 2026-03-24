import requests
import json

r = requests.get('https://openrouter.ai/api/v1/models')
data = r.json()
free_models = [m for m in data.get('data', []) if ':free' in m.get('id', '')]

with open('free_models_output.txt', 'w') as f:
    f.write(f'Total free models: {len(free_models)}\n')
    for m in sorted(free_models, key=lambda x: x.get('created', 0), reverse=True):
        mid = m['id']
        ctx = m.get('context_length', '?')
        f.write(f'  {mid} | context: {ctx}\n')

print(f'Done. Found {len(free_models)} free models. Written to free_models_output.txt')
