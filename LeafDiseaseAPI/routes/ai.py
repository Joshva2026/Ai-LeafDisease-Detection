import json
import re
import os
from flask import Blueprint, request, jsonify
from services.nvidia_service import call_nvidia_ai_service
from services.gemini_service import call_gemini_ai_service
from services.google_translate import google_translate, translate_report_to_tamil
from utils.validators import validate_tamil_quality, validate_farmer_report_json, validate_agricultural_facts, clean_tamil_text
from utils.disease_data import DISEASE_DATA

ai_bp = Blueprint("ai_bp", __name__)

def generate_offline_structured_report(plant, disease, confidence):
    """
    Tier-3 Deterministic Agricultural Advisory Fallback.
    Returns an authoritative 9-key structured report grounded in verified agronomic science.
    """
    meta = DISEASE_DATA.get(disease, {})
    plant_clean = plant.replace('_', ' ')
    cond_clean = disease.split('___')[1].replace('_', ' ') if '___' in disease else disease
    is_healthy = "healthy" in disease.lower()

    desc = meta.get("description", f"Foliar diagnostic evaluation for {plant_clean}.")
    symptoms = meta.get("symptoms", [])
    if not symptoms or symptoms == ["None"]:
        symptoms = [f"Foliage demonstrates standard healthy development for {plant_clean} without visible chlorosis or lesions."] if is_healthy else [f"Observed foliar lesions and tissue discoloration consistent with {cond_clean} on {plant_clean}."]

    treatment = meta.get("treatment", "Consult a local agricultural extension office or university horticultural agent for site-specific treatment.")
    prevention = meta.get("prevention", "Maintain balanced irrigation, proper canopy airflow through pruning, and regular sanitation of field equipment.")

    treatment_list = [treatment] if isinstance(treatment, str) else treatment
    prevention_list = [prevention] if isinstance(prevention, str) else prevention

    return {
        "diagnosis": f"{plant_clean} — {cond_clean}",
        "summary": desc,
        "symptoms": symptoms,
        "causes": [
            f"Environmental pathogen spread (fungal spores, bacteria, or vector pests) favored by leaf wetness." if not is_healthy else "Normal biological growth under suitable agronomic conditions."
        ],
        "immediate_actions": [
            "Prune and safely dispose of heavily infected leaves to restrict further canopy spread." if not is_healthy else "Continue regular crop scouting and balanced watering.",
            "Water at the base of the plant to keep foliage dry.",
            "Sanitize pruning tools between plants with a 10% disinfectant solution."
        ],
        "treatment": treatment_list,
        "prevention": prevention_list,
        "monitoring": [
            "Inspect the underside of leaves weekly during humid or rainy weather.",
            "Monitor surrounding plants for early localized disease hotspots."
        ],
        "farmer_advice": [
            "Always consult your district Agriculture Department or extension officer before purchasing chemical controls.",
            "Verify label instructions for approved crop safety and pre-harvest intervals."
        ]
    }


@ai_bp.route("/api/ai/farmer-report", methods=["POST"])
def farmer_report():
    data = request.json or {}
    plant = data.get("plant", "Crop")
    disease = data.get("disease", "")
    confidence = data.get("confidence", 0)

    if not disease:
        return jsonify({"success": False, "error": "Disease identification required"}), 400

    disease_meta = DISEASE_DATA.get(disease, {})
    trusted_context = ""
    if disease_meta:
        trusted_context = (
            f"\nTRUSTED DISEASE KNOWLEDGE:\n"
            f"Description: {disease_meta.get('description', '')}\n"
            f"Symptoms: {', '.join(disease_meta.get('symptoms', []))}\n"
            f"Treatment: {disease_meta.get('treatment', '')}\n"
            f"Prevention: {disease_meta.get('prevention', '')}\n\n"
            f"Use this trusted information as your factual basis. Do not contradict it."
        )

    system_prompt = (
        "You are an expert Agricultural AI Assistant.\n"
        "STRICT RULES:\n"
        "1. NEVER alter or contradict the diagnosed condition, plant, or confidence.\n"
        "2. DO NOT diagnose a different disease.\n"
        "3. DO NOT invent unapproved pesticide names or chemical dosages.\n"
        "4. Output must be entirely in simple, clear English.\n"
        "5. Output must be STRICTLY valid JSON with EXACTLY these 9 keys:\n"
        '   "diagnosis", "summary", "symptoms", "causes", "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"\n'
        "6. ALL list fields MUST be JSON arrays of strings.\n"
        "7. Return ONLY the JSON object, with no markdown code fences or conversational text."
    )
    user_prompt = (
        f"Crop: {plant}\nCondition: {disease}\nConfidence: {confidence}%\n{trusted_context}\n"
        "Generate a complete 9-section farmer advisory report in JSON format."
    )

    structured_report = None
    provider_used = "none"

    # --- TIER 1: NVIDIA NIM ---
    for attempt in range(2):
        current_temp = 0.2 + (attempt * 0.1)
        ai_reply, err = call_nvidia_ai_service(
            user_prompt, system_prompt, 
            response_format={"type": "json_object"}, 
            temperature=current_temp, 
            max_tokens=1100,
            timeout=20
        )
        if ai_reply:
            parsed, json_err = validate_farmer_report_json(ai_reply)
            if parsed:
                is_fact_valid, _ = validate_agricultural_facts(parsed, disease, disease_meta)
                if is_fact_valid:
                    structured_report = parsed
                    provider_used = "nvidia_ai"
                    break

    # --- TIER 2: Google Gemini Flash (if Tier 1 failed) ---
    if not structured_report:
        gemini_reply, g_err = call_gemini_ai_service(user_prompt, system_prompt, timeout=20)
        if gemini_reply:
            parsed, json_err = validate_farmer_report_json(gemini_reply)
            if parsed:
                is_fact_valid, _ = validate_agricultural_facts(parsed, disease, disease_meta)
                if is_fact_valid:
                    structured_report = parsed
                    provider_used = "gemini_ai"

    # --- TIER 3: Curated Offline Agricultural Database (Guaranteed Fallback) ---
    if not structured_report:
        structured_report = generate_offline_structured_report(plant, disease, confidence)
        provider_used = "offline_knowledge_base"

    return jsonify({
        "success": True,
        "language": "en",
        "provider": provider_used,
        "report_text": "",
        "structured_report": structured_report
    })


@ai_bp.route("/api/ai/translate-report", methods=["POST"])
def translate_report():
    data = request.json or {}
    english_report = data.get("english_report")
    target_language = str(data.get("target_language") or data.get("lang") or "ta").lower()

    if not english_report or not isinstance(english_report, dict):
        return jsonify({"success": False, "error": "Valid English report JSON required"}), 400

    if target_language not in ["ta", "tamil", "தமிழ்"]:
        return jsonify({"success": False, "error": "Only Tamil (ta) is supported for translation currently"}), 400

    # Step 1: Fast & clean translation via Google Translate service
    try:
        translated, failed_keys, g_err = translate_report_to_tamil(english_report)
        if translated and len(failed_keys) <= 3:
            # Validate structure
            parsed, _ = validate_farmer_report_json(json.dumps(translated, ensure_ascii=False))
            if parsed:
                return jsonify({
                    "success": True,
                    "language": "ta",
                    "provider": "google_translate",
                    "structured_report": parsed,
                    "failed_keys": failed_keys
                })
    except Exception as e:
        print("[Translate] Google Translate fallback triggered:", str(e))

    # Step 2: Fallback to NVIDIA NIM with strict Tamil prompt
    system_prompt = (
        "You are an agricultural Tamil translator.\n"
        "Translate the provided English agricultural JSON report into natural, simple Tamil.\n"
        "RULES:\n"
        "1. Write exclusively in Tamil script (தமிழ்).\n"
        "2. Keep scientific names (e.g. Alternaria solani) in English.\n"
        "3. DO NOT output Devanagari, Chinese, Japanese, Korean, or Arabic characters.\n"
        "4. Return strictly valid JSON preserving all 9 keys."
    )
    user_prompt = f"Translate this JSON report to Tamil:\n{json.dumps(english_report, ensure_ascii=False)}"

    ai_reply, err = call_nvidia_ai_service(user_prompt, system_prompt, response_format={"type": "json_object"}, temperature=0.1, max_tokens=1500, timeout=25)
    if ai_reply:
        ai_reply = clean_tamil_text(ai_reply)
        parsed, json_err = validate_farmer_report_json(ai_reply)
        if parsed:
            is_valid, _ = validate_tamil_quality(json.dumps(parsed, ensure_ascii=False))
            if is_valid:
                return jsonify({
                    "success": True,
                    "language": "ta",
                    "provider": "nvidia_ai_translate",
                    "structured_report": parsed
                })

    # Step 3: Clean transliteration/offline fallback
    fallback_report = dict(english_report)
    fallback_report["diagnosis"] = f"{english_report.get('diagnosis', 'பயிர்')} (கள அறிக்கை)"
    fallback_report["farmer_advice"] = [
        "உள்ளூர் வேளாண்மைத் துறை அலுவலரை அணுகி முறையான வழிகாட்டுதலைப் பெறவும்.",
        "பரிந்துரைக்கப்பட்ட அளவுகளில் மட்டுமே பூஞ்சாணக்கொல்லி அல்லது இயற்கை மருந்துகளைப் பயன்படுத்தவும்."
    ]
    return jsonify({
        "success": True,
        "language": "ta",
        "provider": "offline_knowledge_base",
        "structured_report": fallback_report,
        "note": "English report with localized essential Tamil advisory."
    })


@ai_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_msg = data.get("question") or data.get("message") or data.get("prompt") or ""
    lang = data.get("lang") or data.get("language") or "en"
    disease_context = data.get("disease", "")
    is_ta = (lang == "ta")

    if not user_msg:
        return jsonify({"success": False, "error": "Question message required"}), 400

    disease_info = DISEASE_DATA.get(disease_context, {}) if disease_context else {}
    context_str = f"Context condition: {disease_context}. {disease_info.get('description', '')}" if disease_info else ""

    if is_ta:
        system_prompt = (
            "You are an agricultural AI doctor for Tamil Nadu farmers.\n"
            "Write helpful, safe, farmer-friendly advice in Tamil.\n"
            "Keep technical and scientific terms in English if needed, but explain in Tamil.\n"
            "Do not invent unsafe chemical dosages or unapproved pesticides.\n"
            "Always recommend consulting a local agricultural extension officer."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI Agronomic Doctor, an expert crop disease specialist.\n"
            "Provide helpful, concise, practical agricultural advice for plant health.\n"
            "Do not invent unapproved pesticide dosages or spray schedules.\n"
            "The model disease classification is authoritative. Recommend consulting a local agriculture officer."
        )

    # Tier 1: NVIDIA NIM
    ai_reply, err = call_nvidia_ai_service(f"{context_str}\n\nFarmer question: {user_msg}", system_prompt, temperature=0.2, max_tokens=600, timeout=20)
    if ai_reply:
        if is_ta:
            ai_reply = clean_tamil_text(ai_reply)
        return jsonify({
            "success": True,
            "provider": "nvidia_ai",
            "reply": ai_reply,
            "response": ai_reply
        })

    # Tier 2: Gemini Flash
    gemini_reply, g_err = call_gemini_ai_service(f"{context_str}\n\nFarmer question: {user_msg}", system_prompt, timeout=20)
    if gemini_reply:
        if is_ta:
            gemini_reply = clean_tamil_text(gemini_reply)
        return jsonify({
            "success": True,
            "provider": "gemini_ai",
            "reply": gemini_reply,
            "response": gemini_reply
        })

    # Tier 3: Curated Offline Agronomic FAQ
    if is_ta:
        offline_reply = (
            "பயிர்களில் இலைப்புள்ளி அல்லது அழுகல் தென்பட்டால், பாதிக்கப்பட்ட இலைகளை உடனே அப்புறப்படுத்தவும். "
            "இலைகளின் மேல் தண்ணீர் படாதவாறு வேர்ப்பகுதியில் பாசனம் செய்யவும். "
            "துல்லியமான மருந்து பரிந்துரைக்கு உங்கள் வட்டார வேளாண்மை உதவி இயக்குநரை (AO) தொடர்பு கொள்ளவும்."
        )
    else:
        offline_reply = (
            "For optimal crop recovery, immediately prune and safely destroy severely spotted or blighted leaves. "
            "Avoid overhead irrigation to keep the leaf canopy dry, and space plants to ensure good air circulation. "
            "Please consult your local Agriculture Extension Officer before applying any synthetic fungicide or pesticide."
        )

    return jsonify({
        "success": True,
        "provider": "offline_knowledge_base",
        "reply": offline_reply,
        "response": offline_reply
    })
