import time
import requests
import json
import sys

URL = "https://ai-leafdisease-detection.onrender.com"

print(f"Waiting for {URL} to come online with the new deployment...")
for i in range(20):
    try:
        r = requests.get(f"{URL}/health", timeout=10)
        if r.status_code == 200:
            print("Render is ONLINE.")
            break
    except Exception as e:
        pass
    time.sleep(15)
else:
    print("Render did not come online in time.")
    sys.exit(1)

results = {}

def test_endpoint(endpoint, payload):
    start = time.time()
    try:
        r = requests.post(f"{URL}{endpoint}", json=payload, timeout=45)
        dur = time.time() - start
        return {"status": r.status_code, "duration_sec": round(dur, 2), "response": r.json()}
    except Exception as e:
        dur = time.time() - start
        return {"status": "error", "duration_sec": round(dur, 2), "error": str(e)}

print("Testing AI Doctor (EN)...")
results['ai_doctor_en'] = test_endpoint("/api/chat", {
    "question": "What should I do if my tomato leaves are turning yellow?",
    "language": "en"
})
print(f"Duration: {results['ai_doctor_en']['duration_sec']}s")

print("Testing AI Doctor (TA)...")
results['ai_doctor_ta'] = test_endpoint("/api/chat", {
    "question": "என் உருளைக்கிழங்கு இலையில் பழுப்பு நிற புள்ளிகள் இருக்கிறது. என்ன செய்யலாம்?",
    "language": "ta"
})
print(f"Duration: {results['ai_doctor_ta']['duration_sec']}s")


print("Testing Farmer Report (EN) with Tomato Early Blight...")
results['farmer_report_en'] = test_endpoint("/api/ai/farmer-report", {
    "plant": "Tomato",
    "disease": "Tomato___Early_blight",
    "confidence": 92.5,
    "language": "en"
})
print(f"Duration: {results['farmer_report_en']['duration_sec']}s")

print("Testing Farmer Report (TA) with Tomato Early Blight...")
results['farmer_report_ta'] = test_endpoint("/api/ai/farmer-report", {
    "plant": "Tomato",
    "disease": "Tomato___Early_blight",
    "confidence": 92.5,
    "language": "ta"
})
print(f"Duration: {results['farmer_report_ta']['duration_sec']}s")

with open("verify_out.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Test complete. Results saved to verify_out.json.")
