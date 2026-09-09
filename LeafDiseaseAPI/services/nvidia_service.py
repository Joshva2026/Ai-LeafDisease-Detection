import os
import json
from openai import OpenAI

def call_nvidia_ai_service(user_prompt, system_prompt):
    """
    Isolated NVIDIA AI Service helper using OpenAI Python SDK.
    Reads NVIDIA_API_KEY and NVIDIA_MODEL exclusively from backend environment.
    Returns generated content string or None on failure/missing key.
    """
    nvidia_key = os.getenv("NVIDIA_API_KEY", "").strip()
    if not nvidia_key or nvidia_key in ("YOUR_NVIDIA_KEY_HERE", "YOUR_API_KEY_HERE"):
        return None

    model_name = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b").strip()

    try:
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=nvidia_key
        )

        extra_body = {}
        if "nemotron" in model_name.lower():
            extra_body["chat_template_kwargs"] = {"enable_thinking": False}

        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            top_p=0.9,
            max_tokens=1800,
            stream=False,
            extra_body=extra_body if extra_body else None
        )

        if completion and completion.choices and len(completion.choices) > 0:
            content = completion.choices[0].message.content
            return content.strip() if content else None

    except Exception as e:
        print("[NVIDIA AI Service Error]:", type(e).__name__, str(e))
    return None


def call_gemini_fallback(user_prompt, system_prompt):
    """
    Isolated Gemini AI Fallback helper using requests.
    """
    import requests
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not gemini_key or gemini_key in ("YOUR_API_KEY_HERE", ""):
        return None

    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
    for model_name in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={gemini_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\nUser Prompt: {user_prompt}"}]
                    }
                ]
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip() if text else None
        except Exception as e:
            print(f"[Gemini Fallback {model_name} Error]:", e)
    return None
