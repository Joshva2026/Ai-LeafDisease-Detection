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
    lang = data.get("language") or data.get("lang") or "en"
    is_ta = (lang == "ta")

    if not disease:
        return jsonify({"success": False, "error": "Disease identification required"}), 400

    disease_meta = DISEASE_DATA.get(disease, {})
    trusted_context = ""
    if disease_meta:
        trusted_context = f"\nTRUSTED DISEASE KNOWLEDGE:\nDescription: {disease_meta.get('description', '')}\nSymptoms: {', '.join(disease_meta.get('symptoms', []))}\nTreatment: {disease_meta.get('treatment', '')}\nPrevention: {disease_meta.get('prevention', '')}\n\nUse this trusted information as your factual basis. Do not contradict it."

    if is_ta:
        system_prompt = (
            "You are an agricultural AI assistant for Tamil Nadu farmers.\n"
            "The selected language is Tamil.\n"
            "Write natural, grammatically correct Tamil.\n"
            "Use simple farmer-friendly Tamil.\n"
            "Do not mix unrelated languages.\n"
            "Use standard agricultural terminology.\n"
            "Scientific disease names may appear in parentheses after the Tamil name when useful.\n"
            "IMPORTANT: Your entire response MUST be strictly in Tamil and English ONLY.\n"
            "For Tamil output:\n"
            "Write natural Tamil using Tamil script.\n"
            "Do not generate Devanagari. Do not generate Chinese characters. Do not generate Japanese characters. Do not generate Korean characters.\n"
            "Do not generate unrelated foreign-language words.\n"
            "English is allowed ONLY for: scientific names, disease names in parentheses, technical identifiers, model names, standard units, percentages, pH, unavoidable technical terminology.\n"
            "Never mix unrelated languages inside Tamil words.\n"
            "Do not invent pesticide names, fungicide names, insecticides, antibiotics, or fertilizers.\n"
            "Do not invent chemical dosages, concentrations, or spray intervals.\n"
            "If specific verified treatment information is unavailable, recommend consulting the local Agriculture Department or an agriculture officer.\n"
            "Prefer: 'Use only locally registered products and follow the product label and agricultural extension guidance.'\n"
            "Do not claim laboratory confirmation.\n"
            "The supplied CNN disease prediction is authoritative.\n"
            "Do not change the supplied disease or crop.\n"
            "Provide the report STRICTLY in JSON format with exactly these 8 keys (in English), and all values in Tamil:\n"
            "- diagnosis\n- summary\n- symptoms\n- causes\n- immediate_actions\n- treatment\n- prevention\n- monitoring\n"
            "Do not output markdown or conversational filler outside the JSON.\n"
        )
        user_prompt = (
            f"Crop: {plant}\nDisease: {disease}\nConfidence: {confidence}%\n{trusted_context}\n"
            "Generate the detailed agricultural farmer report in JSON format."
        )
    else:
        system_prompt = (
            "You are an expert Agricultural AI Assistant.\n"
            "The existing MobileNetV2 disease detection model classified this specimen.\n"
            "STRICT RULES:\n"
            "1. NEVER alter or contradict the diagnosed condition, plant, or confidence.\n"
            "2. DO NOT diagnose a different disease.\n"
            "3. DO NOT claim laboratory confirmation.\n"
            "4. DO NOT invent pesticide, fungicide, insecticide names, chemical dosages, or spray schedules.\n"
            "5. If specific verified treatment information is unavailable, recommend consulting the local Agriculture Department or an agriculture officer.\n"
            "   Prefer: 'Use only locally registered products and follow the product label and agricultural extension guidance.'\n"
            "6. Provide safe, actionable agronomic advice.\n"
            "7. Output must be entirely in simple, clear English.\n"
            "8. Output must be STRICTLY valid JSON with these 8 keys:\n"
            "- diagnosis\n- summary\n- symptoms\n- causes\n- immediate_actions\n- treatment\n- prevention\n- monitoring\n"
            "Do not output markdown or conversational filler outside the JSON.\n"
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
            
        if is_ta:
            # Validate Tamil Quality of the combined text values
            all_text = " ".join([str(v) for v in parsed.values()])
            is_valid, ta_err = validate_tamil_quality(all_text)
            if not is_valid:
                nvidia_error = f"Tamil Validation failed: {ta_err}"
                continue
                
        # If we reach here, it passed all validations!
        structured_report = parsed
        break

    if structured_report:
        return jsonify({
            "success": True,
            "language": lang,
            "provider": "nvidia_ai",
            "report_text": "",  # Deprecated but kept for backward compatibility if needed
            "structured_report": structured_report
        })

    return jsonify({
        "success": False,
        "provider": "none",
        "nvidia_debug_error": nvidia_error,
        "error": "AI அறிக்கை தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." if is_ta else "AI report is currently unavailable. Please try again."
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


