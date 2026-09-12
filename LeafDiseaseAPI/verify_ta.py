import time
import requests
import json
import sys

URL = "https://ai-leafdisease-detection.onrender.com"

print("Testing Farmer Report (TA) with Tomato Early Blight...")
start = time.time()
try:
    r = requests.post(f"{URL}/api/ai/farmer-report", json={
        "plant": "Tomato",
        "disease": "Tomato___Early_blight",
        "confidence": 92.5,
        "language": "ta"
    }, timeout=45)
    dur = time.time() - start
    print(f"Status: {r.status_code}")
    print(f"Duration: {dur:.2f}s")
    try:
        print(json.dumps(r.json(), ensure_ascii=False, indent=2))
    except:
        print(f"Raw Text:\n{r.text}")
except Exception as e:
    print(f"Error: {e}")
