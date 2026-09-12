import json
import re
from flask import Blueprint, request, jsonify
from services.nvidia_service import call_nvidia_ai_service, call_gemini_fallback

ai_bp = Blueprint("ai_bp", __name__)

def parse_report_sections(text, is_ta):
    """
    Parses unstructured text into a structured dictionary with the 8 standard sections.
    """
    sections = {
        "diagnosis": "",
        "summary": "",
        "symptoms": [],
        "causes": [],
        "immediate_actions": [],
        "treatment": [],
        "prevention": [],
        "monitoring": []
    }
    
    # Try parsing JSON first if the output contains JSON block
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            if isinstance(parsed, dict) and "diagnosis" in parsed:
                return parsed
        except Exception:
            pass

    lines = text.split("\n")
    current_key = "summary"
    
    for line in lines:
        clean = line.strip()
        if not clean:
            continue
            
        lower_line = clean.lower()
        if "1." in clean or "கண்டறிதல்" in clean or "diagnosis" in lower_line:
            current_key = "diagnosis"
            sections[current_key] = clean.replace("1.", "").strip()
            continue
        elif "2." in clean or "சுருக்கம்" in clean or "summary" in lower_line:
            current_key = "summary"
            continue
        elif "3." in clean or "அறிகுறிகள்" in clean or "symptoms" in lower_line:
            current_key = "symptoms"
            continue
        elif "4." in clean or "காரணங்கள்" in clean or "causes" in lower_line:
            current_key = "causes"
            continue
        elif "5." in clean or "நடவடிக்கைகள்" in clean or "immediate" in lower_line:
            current_key = "immediate_actions"
            continue
        elif "6." in clean or "சிகிச்சை" in clean or "treatment" in lower_line or "management" in lower_line:
            current_key = "treatment"
            continue
        elif "7." in clean or "தடுப்பு" in clean or "prevention" in lower_line:
            current_key = "prevention"
            continue
        elif "8." in clean or "கண்காணிப்பு" in clean or "monitoring" in lower_line:
            current_key = "monitoring"
            continue

        if isinstance(sections[current_key], list):
            bullet = clean.lstrip("-*•123456789. ")
            if bullet:
                sections[current_key].append(bullet)
        else:
            sections[current_key] += (" " + clean if sections[current_key] else clean)

    return sections


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

    if is_ta:
        system_prompt = (
            "நீங்கள் விவசாயிகளுக்கு உதவும் ஒரு Agricultural AI Assistant.\n"
            "ஏற்கனவே உள்ள MobileNetV2 disease detection model கண்டறிந்த முடிவு:\n"
            f"பயிர்: {plant}\n"
            f"கண்டறியப்பட்ட நோய்: {disease}\n"
            f"நம்பகத்தன்மை: {confidence}%\n\n"
            "முக்கிய விதிகள்:\n"
            "1. நோயின் பெயரையோ, பயிர் பெயரையோ, 95% அல்லது குறிப்பிட்ட confidence-ஐயோ மாற்றக்கூடாது.\n"
            "2. வேறு நோயை கற்பனையாக கண்டறியக்கூடாது.\n"
            "3. Laboratory confirmation என்று கூறக்கூடாது.\n"
            "4. மருந்தின் குறிப்பிட்ட dosage-ஐ கற்பனை செய்து கூறக்கூடாது.\n"
            "5. பாதுகாப்பான மற்றும் நடைமுறை விவசாய மேலாண்மை ஆலோசனைகளை மட்டும் வழங்கவும்.\n"
            "6. முழு பதிலும் தமிழில் மட்டுமே இருக்க வேண்டும்.\n\n"
            "கீழ்கண்ட 8 பகுதிகளையும் தமிழில் வழங்கவும்:\n"
            "1. நோய் கண்டறிதல்\n"
            "2. சுருக்கம்\n"
            "3. அறிகுறிகள்\n"
            "4. காரணங்கள்\n"
            "5. உடனடி நடவடிக்கைகள்\n"
            "6. சிகிச்சை / மேலாண்மை\n"
            "7. தடுப்பு முறைகள்\n"
            "8. கண்காணிப்பு"
        )
        user_prompt = (
            f"பயிர்: {plant}, நோய்: {disease}, நம்பிக்கை: {confidence}%. "
            "இந்த நோய்க்கான விரிவான விவசாயி அறிக்கையை மேலே குறிப்பிடப்பட்டுள்ள 8 பிரிவுகளுடன் தமிழில் வழங்கவும்."
        )
    else:
        system_prompt = (
            "You are an expert Agricultural AI Assistant.\n"
            "The existing MobileNetV2 disease detection model classified this specimen:\n"
            f"Plant: {plant}\n"
            f"Diagnosed Condition: {disease}\n"
            f"CNN Confidence: {confidence}%\n\n"
            "STRICT RULES:\n"
            "1. NEVER alter or contradict the diagnosed condition, plant, or confidence.\n"
            "2. DO NOT diagnose a different disease.\n"
            "3. DO NOT claim laboratory confirmation.\n"
            "4. DO NOT invent specific chemical dosages or unsafe concentrations.\n"
            "5. Provide safe, actionable agronomic advice.\n"
            "6. Output must be entirely in simple, clear English.\n\n"
            "Include all 8 sections:\n"
            "1. Diagnosis\n"
            "2. Summary\n"
            "3. Symptoms\n"
            "4. Causes\n"
            "5. Immediate Actions\n"
            "6. Treatment & Management\n"
            "7. Prevention\n"
            "8. Monitoring"
        )
        user_prompt = (
            f"Crop: {plant}, Condition: {disease}, Confidence: {confidence}%. "
            "Generate a complete 8-section farmer advisory report in English."
        )

    # 1. Isolated NVIDIA AI Call
    ai_reply = call_nvidia_ai_service(user_prompt, system_prompt)
    provider = "nvidia_ai"

    # 2. Fallback to Gemini
    if not ai_reply:
        ai_reply = call_gemini_fallback(user_prompt, system_prompt)
        provider = "gemini_ai"

    # 3. Format response or return offline rules fallback
    if ai_reply:
        structured = parse_report_sections(ai_reply, is_ta)
        return jsonify({
            "success": True,
            "language": lang,
            "provider": provider,
            "report_text": ai_reply,
            "structured_report": structured
        })

    return jsonify({
        "success": False,
        "provider": "none",
        "error": "NVIDIA AI தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." if is_ta else "NVIDIA AI Farmer Advisory is currently unavailable. Please try again."
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
            "நீங்கள் LeafGuard AI விவசாய மருத்துவர் (Agronomic Specialist).\n"
            "விவசாயிகளின் பயிர் நோய்கள், தடுப்பு முறைகள் மற்றும் பயிர் பராமரிப்பு கேள்விகளுக்கு தெளிவான, சுருக்கமான பதில்களை தமிழில் வழங்கவும்.\n"
            "பாதுகாப்பற்ற வேதிப்பொருள் அளவுகளை கற்பனையாக குறிப்பிட வேண்டாம்."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI Agronomic Doctor, an expert crop disease specialist.\n"
            "Provide helpful, concise, practical agricultural advice for plant health and disease prevention questions.\n"
            "Do not invent unsafe chemical dosages."
        )

    # Call isolated NVIDIA AI service
    ai_reply = call_nvidia_ai_service(user_msg, system_prompt)
    provider = "nvidia_ai"

    if not ai_reply:
        ai_reply = call_gemini_fallback(user_msg, system_prompt)
        provider = "gemini_ai"

    if ai_reply:
        return jsonify({
            "success": True,
            "provider": provider,
            "reply": ai_reply,
            "response": ai_reply
        })

    return jsonify({
        "success": False,
        "provider": "none",
        "error": "NVIDIA AI தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." if is_ta else "NVIDIA AI Doctor is currently unavailable. Please try again."
    }), 503

