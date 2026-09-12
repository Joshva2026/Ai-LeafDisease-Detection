import requests
import json

url = "http://127.0.0.1:10000/api/ai/farmer-report"
data = {
    "disease": "Apple___Apple_scab",
    "plant": "Apple",
    "confidence": 98.5,
    "language": "en"
}

try:
    print(f"Testing {url} ...")
    r = requests.post(url, json=data)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")
