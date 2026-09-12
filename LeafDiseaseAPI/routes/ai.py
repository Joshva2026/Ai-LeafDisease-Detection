import json
import re
from flask import Blueprint, request, jsonify
from services.nvidia_service import call_nvidia_ai_service
from utils.validators import validate_tamil_quality, validate_farmer_report_json, validate_agricultural_facts
from utils.disease_data import DISEASE_DATA

ai_bp = Blueprint("ai_bp", __name__)

@ai_bp.route("/api/ai/farmer-report", methods=["POST"])
def farmer_report():
    data = request.json or {}
    plant = data.get("plant", "Crop")
    disease = data.get("disease", "")
    confidence = data.get("confidence", 0)
    
    # We ignore the requested language and always generate English first as the source of truth.
    lang = "en"
    
    if not disease:
        return jsonify({"success": False, "error": "Disease identification required"}), 400

    disease_meta = DISEASE_DATA.get(disease, {})
    trusted_context = ""
    if disease_meta:
        trusted_context = f"\nTRUSTED DISEASE KNOWLEDGE:\nDescription: {disease_meta.get('description', '')}\nSymptoms: {', '.join(disease_meta.get('symptoms', []))}\nTreatment: {disease_meta.get('treatment', '')}\nPrevention: {disease_meta.get('prevention', '')}\n\nUse this trusted information as your factual basis. Do not contradict it."

    system_prompt = (
        "You are an expert Agricultural AI Assistant.\n"
        "The existing MobileNetV2 disease detection model classified this specimen.\n"
        "STRICT RULES:\n"
        "1. NEVER alter or contradict the diagnosed condition, plant, or confidence.\n"
        "2. DO NOT diagnose a different disease.\n"
        "3. DO NOT claim laboratory confirmation.\n"
        "4. DO NOT invent pesticide, fungicide, insecticide names, chemical dosages, or spray schedules.\n"
        "5. If specific verified treatment information is unavailable, recommend consulting the local Agriculture Department or an agriculture officer.\n"
        "6. Output must be entirely in simple, clear English.\n"
        "7. Output must be STRICTLY valid JSON with EXACTLY these 9 keys:\n"
        '   "diagnosis", "summary", "symptoms", "causes", "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"\n'
        "8. ALL list fields (symptoms, causes, immediate_actions, treatment, prevention, monitoring, farmer_advice) MUST be JSON arrays of strings.\n"
        "9. Each item in the array MUST be one complete, clean sentence. DO NOT add Markdown numbering, bullets, or svg text.\n"
        "10. Return ONLY the report JSON, with no introduction, explanation, or markdown code fences.\n"
    )
    user_prompt = (
        f"Crop: {plant}\nCondition: {disease}\nConfidence: {confidence}%\n{trusted_context}\n"
        "Generate a complete 8-section farmer advisory report in JSON format."
    )

    structured_report = None
    nvidia_error = "Unknown error"
    
    # 2-stage Validation Loop (1 initial + 1 retry)
    for attempt in range(2):
        current_temp = 0.2 + (attempt * 0.1)  # 0.2 then 0.3
        ai_reply, err = call_nvidia_ai_service(user_prompt, system_prompt, response_format={"type": "json_object"}, temperature=current_temp, max_tokens=1100)
        
        if not ai_reply:
            nvidia_error = err
            continue
            
        parsed, json_err = validate_farmer_report_json(ai_reply)
        if not parsed:
            nvidia_error = f"JSON Validation failed: {json_err}"
            continue

        is_fact_valid, fact_err = validate_agricultural_facts(parsed, disease, disease_meta)
        if not is_fact_valid:
            nvidia_error = f"Fact Validation failed: {fact_err}"
            continue
                
        # If we reach here, it passed all validations!
        structured_report = parsed
        break

    if structured_report:
        return jsonify({
            "success": True,
            "language": "en",
            "provider": "nvidia_ai",
            "report_text": "",
            "structured_report": structured_report
        })

    return jsonify({
        "success": False,
        "provider": "none",
        "nvidia_debug_error": nvidia_error,
        "error": "AI report is currently unavailable. Please try again."
    }), 503

@ai_bp.route("/api/ai/translate-report", methods=["POST"])
def translate_report():
    data = request.json or {}
    english_report = data.get("english_report")
    target_language = str(data.get("target_language") or data.get("lang") or "ta").lower()
    
    if not english_report or not isinstance(english_report, dict):
        return jsonify({"success": False, "error": "Valid English report JSON required"}), 400

    if target_language not in ["ta", "tamil", "தமிழ்"]:
        return jsonify({"success": False, "error": "Only Tamil (ta) is supported for translation currently"}), 400

    from utils.validators import clean_tamil_text
    
    system_prompt = (
        "You are a Tamil translator for agriculture.\n"
        "Translate the English text to Tamil.\n"
        "Output ONLY the Tamil translation using Tamil script (தமிழ்).\n"
        "Keep scientific names (e.g. Alternaria solani) in English.\n"
        "Do not explain. Do not use Hindi, Korean, Japanese, Arabic, or Chinese.\n"
    )

    translated_report = {}
    failed_keys = []
    
    for key, value in english_report.items():
        if isinstance(value, list):
            # Translate list items together as a numbered block
            if not value:
                translated_report[key] = []
                continue
                
            numbered = "\n".join([f"{i+1}. {item}" for i, item in enumerate(value)])
            user_prompt = f"Translate these {len(value)} agricultural points to Tamil:\n{numbered}"
            
            translated_items = []
            success = False
            
            for attempt in range(2):
                ai_reply, err = call_nvidia_ai_service(
                    user_prompt, system_prompt, 
                    temperature=0.1 + (attempt * 0.1), 
                    max_tokens=400, 
                    timeout=20
                )
                if not ai_reply:
                    continue
                
                # Clean the output
                ai_reply = clean_tamil_text(ai_reply)
                
                # Parse numbered items
                lines = ai_reply.strip().split('\n')
                items = []
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    # Strip leading numbers like "1. " or "1) "
                    cleaned = re.sub(r'^\d+[\.\)]\s*', '', line)
                    if cleaned:
                        items.append(cleaned)
                
                if items:
                    translated_items = items
                    success = True
                    break
            
            if success:
                translated_report[key] = translated_items
            else:
                failed_keys.append(key)
                translated_report[key] = value  # Fallback to English
                
        else:
            # Translate single string value
            if not value or not str(value).strip():
                translated_report[key] = str(value)
                continue
                
            user_prompt = f"Translate to Tamil: {value}"
            success = False
            
            for attempt in range(2):
                ai_reply, err = call_nvidia_ai_service(
                    user_prompt, system_prompt,
                    temperature=0.1 + (attempt * 0.1),
                    max_tokens=150,
                    timeout=15
                )
                if not ai_reply:
                    continue
                
                # Clean the output
                ai_reply = clean_tamil_text(ai_reply)
                
                if ai_reply:
                    translated_report[key] = ai_reply
                    success = True
                    break
            
            if not success:
                failed_keys.append(key)
                translated_report[key] = str(value)  # Fallback to English
    
    # Validate the final translated report
    all_text = " ".join([str(v) for v in translated_report.values()])
    is_valid, ta_err = validate_tamil_quality(all_text)
    
    # Even if validation fails, if we translated most keys, return with a warning
    if len(failed_keys) <= 2:
        # Validate structure
        parsed, json_err = validate_farmer_report_json(json.dumps(translated_report, ensure_ascii=False))
        if parsed:
            return jsonify({
                "success": True,
                "language": "ta",
                "provider": "nvidia_ai_translate",
                "structured_report": parsed,
                "partial": bool(failed_keys),
                "failed_keys": failed_keys
            })

    return jsonify({
        "success": False,
        "provider": "none",
        "nvidia_debug_error": f"Failed keys: {failed_keys}" if failed_keys else "Translation failed",
        "error": "AI அறிக்கை தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்."
    }), 503


@ai_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_msg = data.get("question") or data.get("message") or data.get("prompt") or ""
    lang = data.get("lang") or data.get("language") or "en"
    is_ta = (lang == "ta")

    if not user_msg:
        return jsonify({"success": False, "error": "Question message required"}), 400

    if is_ta:
        system_prompt = (
            "You are an agricultural AI assistant for Tamil Nadu farmers.\n"
            "The selected language is Tamil.\n"
            "Write natural, grammatically correct Tamil.\n"
            "Use simple farmer-friendly Tamil.\n"
            "Use standard agricultural terminology.\n"
            "IMPORTANT: Your entire response MUST be strictly in Tamil and English ONLY.\n"
            "For Tamil output: Write natural Tamil using Tamil script. Do not generate Devanagari, Chinese, Japanese, or Korean characters.\n"
            "Do not invent pesticide names, fungicide names, chemical dosages, or spray schedules.\n"
            "If verified treatment is unavailable, recommend consulting the local Agriculture Department.\n"
            "Do not claim laboratory confirmation.\n"
            "The supplied CNN disease prediction is authoritative. Do not override it.\n"
            "Keep the response helpful, concise, and safe. Do not generate long introductions or repeated explanations."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI Agronomic Doctor, an expert crop disease specialist.\n"
            "Provide helpful, concise, practical agricultural advice for plant health and disease prevention questions.\n"
            "Do not invent pesticide names, unsafe chemical dosages, or spray schedules.\n"
            "If verified treatment is unavailable, recommend consulting a local agriculture officer.\n"
            "The supplied disease prediction is authoritative.\n"
            "Do not replace or contradict the prediction."
        )

    valid_reply = None
    nvidia_error = "Unknown error"

    # 2-stage Validation Loop (1 initial + 1 retry)
    for attempt in range(2):
        current_temp = 0.2 + (attempt * 0.1) # 0.2 then 0.3
        ai_reply, err = call_nvidia_ai_service(user_msg, system_prompt, temperature=current_temp, max_tokens=600)
        
        if not ai_reply:
            nvidia_error = err
            continue
            
        if is_ta:
            is_valid, ta_err = validate_tamil_quality(ai_reply)
            if not is_valid:
                nvidia_error = f"Tamil Validation failed: {ta_err}"
                continue
                
        # Passed validation
        valid_reply = ai_reply
        break

    if valid_reply:
        return jsonify({
            "success": True,
            "provider": "nvidia_ai",
            "reply": valid_reply,
            "response": valid_reply
        })

    return jsonify({
        "success": False,
        "provider": "none",
        "nvidia_debug_error": nvidia_error,
        "error": "AI அறிக்கை தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." if is_ta else "AI report is currently unavailable. Please try again."
    }), 503


