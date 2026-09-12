import os
import json
from openai import OpenAI

def call_nvidia_ai_service(user_prompt, system_prompt, response_format=None, temperature=0.2, max_tokens=1800, timeout=45):
    """
    Isolated NVIDIA AI Service helper using OpenAI Python SDK.
    Reads NVIDIA_API_KEY and NVIDIA_MODEL exclusively from backend environment.
    Returns (generated content string, error_message).
    """
    nvidia_key = os.getenv("NVIDIA_API_KEY", "").strip()
    model_name = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b").strip()

    if not nvidia_key or nvidia_key in ("YOUR_NVIDIA_KEY_HERE", "YOUR_API_KEY_HERE"):
        return None, f"Key exists=NO, Model={model_name}"

    try:
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=nvidia_key,
            timeout=timeout
        )

        extra_body = {}
        if "nemotron" in model_name.lower():
            extra_body["chat_template_kwargs"] = {"enable_thinking": False}

        kwargs = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "top_p": 0.9,
            "max_tokens": max_tokens,
            "stream": False,
            "extra_body": extra_body if extra_body else None
        }

        if response_format:
            kwargs["response_format"] = response_format

        completion = client.chat.completions.create(**kwargs)

        if completion and completion.choices and len(completion.choices) > 0:
            content = completion.choices[0].message.content
            return content.strip() if content else None, None

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print("[NVIDIA AI Service Error]:", error_msg)
        return None, error_msg
    return None, "No completion choices returned"

