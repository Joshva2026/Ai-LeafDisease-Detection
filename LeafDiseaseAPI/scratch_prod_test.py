import time
import requests
import sys

BASE_URL = "https://ai-leafdisease-detection.onrender.com"

def log(msg):
    print(f"[TEST] {msg}")

def check_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        log(f"/health Status: {r.status_code}")
        log(f"/health Response: {r.json()}")
        return r.status_code == 200
    except Exception as e:
        log(f"/health Error: {e}")
        return False

def check_predict():
    try:
        # We need a real leaf image
        with open("test_green_leaf.jpg", "rb") as f:
            files = {"image": ("test_green_leaf.jpg", f, "image/jpeg")}
            r = requests.post(f"{BASE_URL}/predict", files=files)
            log(f"/predict Status: {r.status_code}")
            # log(f"/predict Response: {r.json()}")
            return r.status_code == 200
    except Exception as e:
        log(f"/predict Error: {e}")
        return False

def check_chat(lang, msg):
    try:
        r = requests.post(f"{BASE_URL}/api/chat", json={"message": msg})
        log(f"/api/chat ({lang}) Status: {r.status_code}")
        resp = r.json()
        log(f"/api/chat ({lang}) Provider: {resp.get('provider')}")
        return r.status_code == 200 or r.status_code == 503
    except Exception as e:
        log(f"/api/chat ({lang}) Error: {e}")
        return False

def check_report(lang):
    try:
        data = {
            "plant": "Tomato",
            "disease": "Tomato___Early_blight",
            "confidence": 82,
            "language": lang
        }
        r = requests.post(f"{BASE_URL}/api/ai/farmer-report", json=data)
        log(f"/api/ai/farmer-report ({lang}) Status: {r.status_code}")
        resp = r.json()
        log(f"/api/ai/farmer-report ({lang}) Provider: {resp.get('provider')}")
        return r.status_code == 200 or r.status_code == 503
    except Exception as e:
        log(f"/api/ai/farmer-report ({lang}) Error: {e}")
        return False

def wait_for_render():
    log("Waiting for Render deployment to finish...")
    for _ in range(60):
        if check_health():
            return True
        time.sleep(10)
    return False

if __name__ == "__main__":
    if wait_for_render():
        log("Render is online! Running tests...")
        check_predict()
        check_chat("en", "What should I do if my tomato plant has early blight?")
        check_chat("ta", "என் தக்காளி செடியில் இலைக்கருகல் நோய் உள்ளது. நான் என்ன செய்ய வேண்டும்?")
        check_report("en")
        check_report("ta")
    else:
        log("Render deployment did not become healthy in time.")
