import os
import json
import requests
import logging

# Set up logging
logger = logging.getLogger(__name__)

def call_gemini_ai_service(user_prompt, system_prompt="", timeout=20):
    """
    Direct Gemini REST API service helper using requests.
    Uses GEMINI_API_KEY from environment or .env.
    Returns (generated content string, error_message).
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not gemini_key or gemini_key in ("YOUR_API_KEY_HERE", "YOUR_GEMINI_KEY_HERE", "None"):
        return None, "Gemini API key not configured"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
    
    contents = []
    if system_prompt:
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {system_prompt}\n\nUSER REQUEST: {user_prompt}"}]
        })
    else:
        contents.append({
            "role": "user",
            "parts": [{"text": user_prompt}]
        })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024
        }
    }

    try:
        resp = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=timeout
        )
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"].strip(), None
            return None, "No candidates in Gemini response"
        elif resp.status_code == 401:
            return None, "Gemini authentication failed - invalid API key"
        elif resp.status_code == 429:
            return None, "Gemini rate limit exceeded"
        elif resp.status_code >= 500:
            return None, f"Gemini server error: HTTP {resp.status_code}"
        else:
            return None, f"Gemini HTTP {resp.status_code}: {resp.text[:150]}"
    except requests.Timeout:
        error_msg = "Gemini API timeout"
        logger.warning(f"[Gemini AI Service]: {error_msg}")
        return None, error_msg
    except requests.ConnectionError:
        error_msg = "Gemini API connection error"
        logger.warning(f"[Gemini AI Service]: {error_msg}")
        return None, error_msg
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        logger.warning(f"[Gemini AI Service]: {error_msg}")
        return None, error_msg
