import json
import re
import os
import time
from flask import Blueprint, request, jsonify
from services.nvidia_service import call_nvidia_ai_service
from services.gemini_service import call_gemini_ai_service
from services.google_translate import google_translate, translate_report_to_tamil
from services.intent_classifier import (
    classify_intent, is_plant_related, generate_contextual_response,
    resolve_disease_context, normalize_disease_display
)
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

    # Disease-specific causes based on pathogen type
    disease_lower = disease.lower()
    if "bacterial" in disease_lower or "bacterial_spot" in disease_lower:
        causes = ["Bacterial infection spread through water splash, wind, or contaminated tools.", "Warm, humid conditions favor bacterial multiplication."]
    elif "virus" in disease_lower or "mosaic" in disease_lower or "curl" in disease_lower:
        causes = ["Viral infection transmitted by insect vectors (whiteflies, aphids).", "Contaminated tools, seeds, or mechanical transmission."]
    elif "mite" in disease_lower or "spider" in disease_lower:
        causes = ["Spider mite infestation favored by hot, dry conditions.", "Dust and water stress increase susceptibility."]
    elif "healthy" in disease_lower:
        causes = ["Normal biological growth under suitable agronomic conditions."]
    else:
        # Default fungal
        causes = [
            "Fungal spores spread via wind, rain splash, or contaminated tools.",
            "High humidity, poor air circulation, and leaf wetness favor fungal growth.",
            "Nutrient imbalance can increase susceptibility."
        ]

    # Disease-specific immediate actions
    if is_healthy:
        immediate_actions = [
            "Continue regular crop scouting and balanced watering.",
            "Maintain good field sanitation and crop rotation."
        ]
    elif "bacterial" in disease_lower:
        immediate_actions = [
            "Immediately remove and destroy infected plant parts to prevent spread.",
            "Avoid overhead irrigation - use drip irrigation at soil level.",
            "Sanitize all tools with 10% bleach solution between plants."
        ]
    elif "virus" in disease_lower:
        immediate_actions = [
            "Remove and destroy infected plants immediately to prevent vector spread.",
            "Control insect vectors (aphids, whiteflies) with appropriate measures.",
            "Disinfect tools and avoid mechanical transmission between plants."
        ]
    elif "mite" in disease_lower:
        immediate_actions = [
            "Increase humidity around plants - spider mites thrive in dry conditions.",
            "Spray plants with strong water stream to dislodge mites.",
            "Apply neem oil or insecticidal soap to affected areas."
        ]
    else:
        # Fungal diseases
        immediate_actions = [
            "Remove and destroy heavily infected leaves to restrict further spread.",
            "Water at the base of plants - avoid overhead irrigation.",
            "Improve air circulation through proper spacing and pruning."
        ]

    treatment = meta.get("treatment", "Consult a local agricultural extension office or university horticultural agent for site-specific treatment.")
    prevention = meta.get("prevention", "Maintain balanced irrigation, proper canopy airflow through pruning, and regular sanitation of field equipment.")

    treatment_list = [treatment] if isinstance(treatment, str) else treatment
    prevention_list = [prevention] if isinstance(prevention, str) else prevention

    # Disease-specific monitoring
    if "virus" in disease_lower:
        monitoring = [
            "Watch for new symptom development on nearby plants weekly.",
            "Monitor insect vector populations (aphids, whiteflies) regularly."
        ]
    elif "mite" in disease_lower:
        monitoring = [
            "Check leaf undersides daily for mite activity and webbing.",
            "Monitor for bronzing or stippling on new growth."
        ]
    else:
        monitoring = [
            "Inspect the underside of leaves weekly during humid or rainy weather.",
            "Monitor surrounding plants for early localized disease hotspots."
        ]

    return {
        "diagnosis": f"{plant_clean} — {cond_clean}",
        "summary": desc,
        "symptoms": symptoms,
        "causes": causes,
        "immediate_actions": immediate_actions,
        "treatment": treatment_list,
        "prevention": prevention_list,
        "monitoring": monitoring,
        "farmer_advice": [
            "Always consult your district Agriculture Department or extension officer before purchasing chemical controls.",
            "Verify label instructions for approved crop safety and pre-harvest intervals.",
            "Consider integrated pest management (IPM) combining cultural, biological, and chemical methods."
        ]
    }


def generate_disease_specific_offline_reply(disease, disease_info, is_tamil=False):
    """Generate disease-specific offline chat reply"""
    is_healthy = "healthy" in disease.lower() if disease else False
    disease_lower = disease.lower() if disease else ""
    
    if is_healthy:
        if is_tamil:
            return "உங்கள் தாவரம் ஆரோக்கியமானது! தொடர்ந்து சரியான நீர் கொடுதல், உரம் மற்றும் தூய்மையுடன் பராமரிக்கவும். விரும்பினால், உங்கள் வட்டார வேளாண்மை அலுவலரிடம் கொள்ளலாம்."
        else:
            return "Your plant is healthy! Continue with proper watering, fertilization, and sanitation. Consult your local extension officer for preventive guidance."
    
    disease_lower = disease.lower()
    if "bacterial" in disease_lower:
        if is_tamil:
            return "பாக்டீரியா நோய் கண்டறியப்பட்டது. உடனடியாக: 1) பாதிக்கப்பட்ட இலைகளை நீக்கி அழிக்கவும். 2) ஓவர் ஹெட் ஈரிகেশন தவிர்த்து டிரிப் ஈரிகেশন பயன்படுத்தவும். 3) கருவிகளை 10% ப்ளீச் படர 아무도 mês마다 정화하십시오. துல்லியமான மருந்து பரிந்துரைக்கு உங்கள் வட்டார வேளாண்மை அலுவலரை தொடர்பு கொள்ளவும்."
        else:
            return "Bacterial disease detected. Immediately: 1) Remove and destroy infected plant parts. 2) Switch from overhead to drip irrigation. 3) Sanitize tools with 10% bleach solution. Contact your local extension officer for specific bactericide recommendations."
    
    if "virus" in disease_lower or "mosaic" in disease_lower or "curl" in disease_lower:
        if is_tamil:
            return "வைரஸ் நோய் கண்டறியப்பட்டது. உடனடி நடவடிக்கைகள்: 1) பாதிக்கப்பட்ட தாவரங்களை உடனே நீக்கி அழிக்கவும். 2) வெயில்கள், அఫிட்கள் போன்ற powierzchிகள் கட்டுப்படுத்தவும். 3) கருவிகளை துப்பக்கிய செய்து மறுப்பரவும். துல்லியமான மருந்து பரிந்துரைக்கு உங்கள் வட்டார வேளாண்மை உதவி இயக்குநரை அணுகவும்."
        else:
            return "Viral disease detected. Immediate actions: 1) Remove and destroy infected plants immediately. 2) Control vectors (aphids, whiteflies). 3) Disinfect tools to prevent mechanical spread. Contact your local extension officer for vector management."
    
    if "mite" in disease_lower or "spider" in disease_lower:
        if is_tamil:
            return "சிலந்தி மைட் கண்டறியப்பட்டது. உடனடி: 1) தாவரங்களுக்கும் சுற்று ஈரப்பதம் அதிகரிக்கவும். 2) வலுவான தண்ணீரின் sıra 타고 குட்டிகள் அகற்றவும். 3) வேப்ப எண்ணெய் அல்லது קיטிசிடல் சோப்பு பயன்படுத்தவும். துல்லியமான மருந்து பரிந்துரைக்கு வேளாண்மை அலுவலரை அணுகவும்."
        else:
            return "Spider mites detected. Immediate: 1) Increase humidity around plants. 2) Spray strong water stream to dislodge mites. 3) Apply neem oil or insecticidal soap. Contact extension officer for miticide options."
    
    # Default fungal
    if is_tamil:
        return f"பூஞ்சை நோய் கண்டறியப்பட்டது ({disease.replace('___', ' → ').replace('_', ' ')}). உடனடி: 1) பாதிக்கப்பட்ட இலைகளை நீக்கி அழிக்கவும். 2) இலைப்பகுதியில் தண்ணீர் விழாதவாறு வேர்ப்பகுதியில் ஈரிகেশন. 3) பூஞ்சணக் கொல்லி பரிந்துரைக்கு வேளாண்மை அலுவலரை அணுகவும்."
    else:
        return f"Fungal disease detected ({disease.replace('___', ' → ').replace('_', ' ')}). Immediate: 1) Remove and destroy infected leaves. 2) Water at base - avoid overhead irrigation. 3) Apply appropriate fungicide per extension officer guidance."


@ai_bp.route("/api/ai/farmer-report", methods=["POST"])
def farmer_report():
    data = request.json or {}
    plant = data.get("plant", "Crop")
    disease = data.get("disease", "")
    confidence = data.get("confidence", 0)

    if not disease:
        return jsonify({"success": False, "error": "Disease identification required"}), 400

    disease_meta = DISEASE_DATA.get(disease, {})
    disease_display = disease.replace('___', ' → ').replace('_', ' ')
    is_healthy = "healthy" in disease.lower()
    disease_lower = disease.lower()

    # Build disease-specific context
    disease_context = ""
    if disease_meta:
        disease_context = (
            f"\nTRUSTED DISEASE KNOWLEDGE:\n"
            f"Disease: {disease_display}\n"
            f"Plant: {plant}\n"
            f"Description: {disease_meta.get('description', '')}\n"
            f"Symptoms: {', '.join(disease_meta.get('symptoms', []))}\n"
            f"Treatment: {disease_meta.get('treatment', '')}\n"
            f"Prevention: {disease_meta.get('prevention', '')}\n\n"
        )
    else:
        disease_context = f"\nDISEASE: {disease_display}\nPlant: {plant}\n"

    # Disease-type specific guidance
    if "bacterial" in disease.lower():
        disease_context += "PATHOGEN TYPE: Bacterial. Treatments should focus on bactericides (copper-based), sanitation, and avoiding water splash.\n"
    elif "virus" in disease.lower() or "mosaic" in disease.lower() or "curl" in disease.lower():
        disease_context += "PATHOGEN TYPE: Viral. No chemical cure. Focus on vector control (aphids, whiteflies), removal of infected plants, and prevention.\n"
    elif "mite" in disease.lower() or "spider" in disease.lower():
        disease_context += "PEST TYPE: Spider mites. Focus on humidity management, miticides, and predator insects.\n"
    elif is_healthy:
        disease_context += "STATUS: Healthy plant. Focus on preventive care and monitoring.\n"
    else:
        disease_context += "PATHOGEN TYPE: Fungal (default). Focus on fungicides, air circulation, and moisture management.\n"

    disease_context += "\nUse this trusted information as your factual basis. Do not contradict it."

    system_prompt = (
        "You are an expert Agricultural AI Assistant generating farmer advisory reports.\n"
        "STRICT RULES:\n"
        "1. NEVER alter or contradict the diagnosed condition, plant, or confidence.\n"
        "2. DO NOT diagnose a different disease.\n"
        "3. DO NOT invent unapproved pesticide names or chemical dosages.\n"
        "4. Output must be entirely in simple, clear English.\n"
        "5. Output must be STRICTLY valid JSON with EXACTLY these 9 keys:\n"
        '   "diagnosis", "summary", "symptoms", "causes", "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"\n'
        "6. ALL list fields MUST be JSON arrays of strings.\n"
        "7. Return ONLY the JSON object, with no markdown code fences or conversational text.\n"
        "8. Make every section SPECIFIC to the diagnosed disease - do not use generic templates."
    )
    user_prompt = (
        f"Crop: {plant}\nCondition: {disease}\nConfidence: {confidence}%\n{disease_context}\n"
        "Generate a complete 9-section farmer advisory report in JSON format. Make every section SPECIFIC to this exact disease."
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
    # Accept both "disease" and "context" for backwards compatibility
    scan_disease_context = data.get("disease") or data.get("context") or ""
    conversation_history = data.get("history", [])  # Array of {role, content}
    is_ta = (lang == "ta")

    if not user_msg:
        return jsonify({"success": False, "error": "Question message required"}), 400

    # Resolve disease context based on priority:
    # 1. Explicit disease in current question
    # 2. Explicit disease in conversation history
    # 3. Current scan disease context
    # 4. None (general knowledge)
    resolved_disease, context_source, is_self_reference = resolve_disease_context(
        user_msg, conversation_history, scan_disease_context
    )
    
    # Get disease info for the resolved disease
    disease_info = DISEASE_DATA.get(resolved_disease, {}) if resolved_disease else {}
    disease_display = normalize_disease_display(resolved_disease)
    scan_disease_display = normalize_disease_display(scan_disease_context)
    
    # Build conversation context for the AI
    conversation_context = ""
    if conversation_history:
        conversation_context = "\n\nCONVERSATION HISTORY:\n"
        for msg in conversation_history[-8:]:  # Last 8 messages for context
            role = "Farmer" if msg.get("role") == "user" else "AI Doctor"
            conversation_context += f"{role}: {msg.get('content', '')}\n"

    disease_context_str = f"DISEASE CONTEXT: {resolved_disease}\n" if resolved_disease else "DISEASE CONTEXT: No disease detected yet.\n"
    if disease_info:
        disease_context_str += f"Disease info: {disease_info.get('description', '')}\n"
        disease_context_str += f"Key symptoms: {', '.join(disease_info.get('symptoms', []))}\n"
        disease_context_str += f"Recommended treatment: {disease_info.get('treatment', '')}\n"
        disease_context_str += f"Prevention: {disease_info.get('prevention', '')}\n"
    
    # Add context source info for transparency
    if context_source == "question" and scan_disease_context and resolved_disease != scan_disease_context:
        disease_context_str += f"\n[Note: User asked about {normalize_disease_display(resolved_disease)} (different from scan: {scan_disease_display})]\n"
    elif context_source == "scan" and is_self_reference:
        disease_context_str += f"\n[Note: User referred to scan context ({scan_disease_display})]\n"
    elif context_source == "history":
        disease_context_str += f"\n[Note: Using disease from conversation history: {disease_display}]\n"

    # Check if question is plant-related
    if not is_plant_related(user_msg):
        non_plant_reply = "I'm an agricultural AI assistant focused on plant health, diseases, and farming. Please ask me about crop diseases, treatments, prevention, watering, pests, fertilizers, or general plant care."
        if is_ta:
            non_plant_reply = "நான் ஒரு விவசாய AI உதவியாளர், தாவர ஆரோக்கியம், நோய்கள், மற்றும் விவசாயம் பற்றி மட்டுமே பதிலளிக்கிறேன். பயிர் நோய்கள், சிகிச்சை, தடுப்பு, நீர் கொடுதல், பூச்சிகள், உரங்கள், அல்லது பொது தாவர பராமரிப்பு பற்றி கேட்கவும்."
        return jsonify({
            "success": True,
            "provider": "offline_knowledge_base",
            "reply": non_plant_reply,
            "response": non_plant_reply,
            "context_source": context_source,
            "resolved_disease": resolved_disease
        })

    if is_ta:
        system_prompt = (
            "You are an agricultural AI doctor for Tamil Nadu farmers.\n"
            "Write helpful, safe, farmer-friendly advice in Tamil.\n"
            "Keep technical and scientific terms in English if needed, but explain in Tamil.\n"
            "Do not invent unsafe chemical dosages or unapproved pesticides.\n"
            "Always recommend consulting a local agricultural extension officer.\n"
            "Use conversation history to maintain context and avoid repeating answers.\n"
            "Be specific to the farmer's actual question - do not give generic responses.\n"
            "If the user asks about a specific disease, answer about THAT disease, not the scan context."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI Agronomic Doctor, an expert crop disease specialist.\n"
            "Provide helpful, concise, practical agricultural advice for plant health.\n"
            "Do not invent unapproved pesticide dosages or spray schedules.\n"
            "The model disease classification is authoritative. Recommend consulting a local agriculture officer.\n"
            "Use conversation history to maintain context and avoid repeating answers.\n"
            "Be specific to the farmer's actual question - do not give generic responses.\n"
            "If the user asks about a specific disease, answer about THAT disease, not the scan context."
        )

    context_str = f"{disease_context_str}\n{conversation_context}\n\nFarmer question: {user_msg}"

    # Tier 1: NVIDIA NIM
    print(f"[DEBUG] Calling NVIDIA for lang={'ta' if is_ta else 'en'}, context_source={context_source}, resolved_disease={resolved_disease}")
    ai_reply, err = call_nvidia_ai_service(context_str, system_prompt, temperature=0.3, max_tokens=800, timeout=30)
    print(f"[DEBUG] NVIDIA result: reply={'YES' if ai_reply else 'NO'}, error={err}")
    if ai_reply:
        if is_ta:
            ai_reply = clean_tamil_text(ai_reply)
        return jsonify({
            "success": True,
            "provider": "nvidia_ai",
            "reply": ai_reply,
            "response": ai_reply,
            "context_source": context_source,
            "resolved_disease": resolved_disease
        })

    # Tier 2: Gemini Flash
    gemini_reply, g_err = call_gemini_ai_service(context_str, system_prompt, timeout=20)
    if gemini_reply:
        if is_ta:
            gemini_reply = clean_tamil_text(gemini_reply)
        return jsonify({
            "success": True,
            "provider": "gemini_ai",
            "reply": gemini_reply,
            "response": gemini_reply,
            "context_source": context_source,
            "resolved_disease": resolved_disease
        })

    # Tier 3: Intent-based Offline Response
    intents = classify_intent(user_msg)
    offline_reply = generate_contextual_response(
        user_msg, 
        resolved_disease,  # Use resolved disease, not scan context
        disease_info, 
        intents, 
        conversation_history,
        is_ta
    )

    return jsonify({
        "success": True,
        "provider": "offline_knowledge_base",
        "reply": offline_reply,
        "response": offline_reply,
        "context_source": context_source,
        "resolved_disease": resolved_disease
    })
