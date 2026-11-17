"""
Intent classifier for chatbot questions to provide relevant offline responses.
Uses keyword matching to determine question intent without external dependencies.
"""

import re
from typing import Dict, List, Optional, Tuple

# All 38 disease classes from the model
DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# Build a mapping of common names to disease classes for easier matching
DISEASE_ALIASES = {}
for disease in DISEASE_CLASSES:
    # Add the full disease name
    DISEASE_ALIASES[disease.lower()] = disease
    # Add plant + disease parts
    parts = disease.split("___")
    if len(parts) == 2:
        plant = parts[0].replace("_", " ").lower()
        condition = parts[1].replace("_", " ").lower()
        DISEASE_ALIASES[condition] = disease
        DISEASE_ALIASES[f"{plant} {condition}"] = disease
        DISEASE_ALIASES[f"{condition} {plant}"] = disease

# Intent keywords mapping
INTENT_KEYWORDS = {
    "symptoms": [
        "symptom", "sign", "look like", "appear", "identify", "recognize", "spot",
        "lesion", "discolor", "yellow", "brown", "black", "white", "powder",
        "stipple", "curl", "wilt", "drop", "mottle", "mosaic", "stunt"
    ],
    "treatment": [
        "treat", "cure", "heal", "fix", "medicine", "spray", "apply", "fungicide",
        "bactericide", "pesticide", "insecticide", "miticide", "copper", "neem",
        "chemical", "organic", "biological", "control", "manage", "remedy"
    ],
    "prevention": [
        "prevent", "avoid", "stop", "protect", "resist", "rotation", "sanitation",
        "clean", "remove", "destroy", "mulch", "stake", "space", "airflow",
        "circulation", "drainage", "resistant", "variety", "certified", "seed"
    ],
    "causes": [
        "cause", "why", "how", "spread", "transmit", "vector", "insect", "whitefly",
        "aphid", "psyllid", "wind", "rain", "splash", "water", "humidity",
        "contaminated", "tool", "seed", "soil", "overwinter", "origin"
    ],
    "identification": [
        "what is", "what could", "identify", "diagnose", "detect", "disease",
        "problem", "wrong", "issue", "condition", "type", "kind", "my plant",
        "has", "showing", "yellow leaves", "brown spots", "white powder"
    ],
    "watering": [
        "water", "irrigation", "drip", "overhead", "wet", "dry", "moist",
        "frequency", "often", "schedule", "amount", "how much", "when to water"
    ],
    "pest_management": [
        "pest", "insect", "bug", "mite", "spider", "aphid", "whitefly", "thrip",
        "caterpillar", "worm", "borer", "beetle", "fly", "mosquito", "beneficial",
        "predator", "ladybug", "parasitic", "wasp", "nematode", "soap", "oil"
    ],
    "organic_farming": [
        "organic", "natural", "biological", "eco", "sustainable", "permaculture",
        "compost", "manure", "cover crop", "green manure", "crop rotation",
        "intercrop", "companion", "mulch", "vermicompost", "biofertilizer"
    ],
    "fertilizer_nutrition": [
        "fertilizer", "nutrient", "nitrogen", "phosphorus", "potassium", "npk",
        "deficiency", "feed", "fertilize", "soil test", "ph", "acidic", "alkaline",
        "lime", "gypsum", "micronutrient", "zinc", "iron", "magnesium", "calcium"
    ],
    "general_care": [
        "care", "grow", "plant", "harvest", "prune", "train", "support", "stake",
        "weed", "mulch", "season", "planting", "transplant", "seedling", "mature",
        "yield", "quality", "storage", "post harvest"
    ]
}

def classify_intent(question: str) -> List[str]:
    """
    Classify the intent(s) of a question based on keyword matching.
    Returns a list of matched intents, sorted by relevance.
    """
    question_lower = question.lower()
    matched_intents = []
    
    for intent, keywords in INTENT_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword in question_lower:
                # Longer keywords get higher weight
                score += len(keyword)
        if score > 0:
            matched_intents.append((intent, score))
    
    # Sort by score descending
    matched_intents.sort(key=lambda x: x[1], reverse=True)
    return [intent for intent, _ in matched_intents]

def is_plant_related(question: str) -> bool:
    """Check if question is related to plants/agriculture."""
    question_lower = question.lower()
    plant_keywords = [
        # English keywords
        "plant", "crop", "leaf", "leaves", "tree", "fruit", "vegetable",
        "tomato", "potato", "pepper", "apple", "corn", "grape", "strawberry",
        "soybean", "blueberry", "cherry", "peach", "orange", "raspberry",
        "squash", "wheat", "rice", "cotton", "flower", "garden", "farm",
        "field", "orchard", "vineyard", "nursery", "greenhouse", "seed",
        "transplant", "seedling", "grow", "cultivate", "harvest", "disease",
        "fungus", "bacteria", "virus", "pest", "insect", "mite", "mold",
        "blight", "spot", "rot", "wilt", "mildew", "rust", "scab", "canker",
        "water", "soil", "fertilizer", "nutrient", "compost", "organic",
        "spray", "treat", "prevent", "control", "manage", "copper", "neem",
        # Tamil keywords (transliterated and common terms)
        "தக்காளி", "இலை", "இலைகள்", "நோய்", "நோய்கள்", "பூச்சி", "பூச்சிகள்",
        "வேளாண்மை", "விதை", "நீர்", "உரம்", "பூஞ்சை", "வைரஸ்", "பாக்டீரியா",
        "சிகிச்சை", "தடுப்பு", "காரணம்", "அறிகுறிகள்", "எப்படி", "என்ன",
        "மஞ்சள்", "பச்சை", "சிவப்பு", "கறுப்பு", "வெள்ளை", "மூலிகை",
        "வேப்பம்", "நீர் கொடுதல்", "செடி", "மரம்", "காய்கறி", "பழம்",
        "கிழங்கு", "தோட்டம்", "நாட்டுப்புறம்", "விவசாயம்", "கೃಷி"
    ]
    return any(keyword in question_lower for keyword in plant_keywords)

def get_disease_type(disease: str) -> str:
    """Determine disease type from disease name."""
    if not disease:
        return "unknown"
    disease_lower = disease.lower()
    if "healthy" in disease_lower:
        return "healthy"
    if "bacterial" in disease_lower or "bacterial_spot" in disease_lower:
        return "bacterial"
    if "virus" in disease_lower or "mosaic" in disease_lower or "curl" in disease_lower:
        return "viral"
    if "mite" in disease_lower or "spider" in disease_lower:
        return "mite"
    return "fungal"

def generate_contextual_response(
    question: str,
    disease: str,
    disease_info: Dict,
    intents: List[str],
    conversation_history: List[Dict],
    is_tamil: bool = False
) -> str:
    """
    Generate a context-aware response based on question intent, disease context,
    and conversation history.
    """
    disease_type = get_disease_type(disease)
    plant = disease.split("___")[0].replace("_", " ") if "___" in disease else "your plant"
    disease_name = disease.replace("___", " → ").replace("_", " ") if disease else "unknown"
    
    # Get disease-specific data from DISEASE_DATA
    symptoms = disease_info.get("symptoms", [])
    treatment = disease_info.get("treatment", "")
    prevention = disease_info.get("prevention", "")
    description = disease_info.get("description", "")
    
    # Check if this is a follow-up question
    is_followup = len(conversation_history) > 0
    
    # Build response based on primary intent
    primary_intent = intents[0] if intents else "general_care"
    
    if disease_type == "healthy":
        return generate_healthy_response(question, plant, intents, is_tamil, is_followup)
    
    # Disease-specific responses by intent
    if primary_intent == "symptoms":
        return generate_symptoms_response(question, plant, disease_name, disease_type, symptoms, description, is_tamil)
    
    elif primary_intent == "treatment":
        return generate_treatment_response(question, plant, disease_name, disease_type, treatment, is_tamil)
    
    elif primary_intent == "prevention":
        return generate_prevention_response(question, plant, disease_name, disease_type, prevention, is_tamil)
    
    elif primary_intent == "causes":
        return generate_causes_response(question, plant, disease_name, disease_type, description, is_tamil)
    
    elif primary_intent == "identification":
        return generate_identification_response(question, plant, disease_name, disease_type, symptoms, description, is_tamil)
    
    elif primary_intent == "watering":
        return generate_watering_response(question, plant, disease_type, is_tamil)
    
    elif primary_intent == "pest_management":
        return generate_pest_response(question, plant, disease_type, is_tamil)
    
    elif primary_intent == "organic_farming":
        return generate_organic_response(question, plant, disease_type, is_tamil)
    
    elif primary_intent == "fertilizer_nutrition":
        return generate_nutrition_response(question, plant, disease_type, is_tamil)
    
    else:
        return generate_general_response(question, plant, disease_name, disease_type, description, is_tamil)

def generate_healthy_response(question: str, plant: str, intents: List[str], is_tamil: bool, is_followup: bool) -> str:
    """Response for healthy plants."""
    if is_tamil:
        return f"உங்கள் {plant} ஆரோக்கியமானது! தொடர்ந்து சரியான பராமரிப்பு செய்யவும். மேலும் கேள்விகள் இருப்பின் கேட்கவும்."
    return f"Your {plant} appears healthy! Continue with proper watering, fertilization, and regular monitoring. Feel free to ask about preventive care or general growing tips."

def generate_symptoms_response(question: str, plant: str, disease_name: str, disease_type: str, symptoms: List, description: str, is_tamil: bool) -> str:
    """Response about disease symptoms."""
    if is_tamil:
        symptom_text = " ".join(symptoms[:3]) if symptoms else f"{disease_name} நோய் அறிகுறிகள்"
        return f"{plant} இல் {disease_name} நோயின் முக்கிய அறிகுறிகள்: {symptom_text}. மேலும் விவரங்களுக்கு உங்கள் வட்டார வேளாண்மை அலுவலரை அணுகவும்."
    symptom_text = "; ".join(symptoms[:4]) if symptoms else f"Typical symptoms of {disease_name}"
    return f"Symptoms of {disease_name} on {plant}: {symptom_text}. {description} Consult your local extension officer for field confirmation."

def generate_treatment_response(question: str, plant: str, disease_name: str, disease_type: str, treatment: str, is_tamil: bool) -> str:
    """Response about disease treatment."""
    if disease_type == "viral":
        if is_tamil:
            return f"{disease_name} என்பது வைரஸ் நோய். இதற்கு மருந்து இல்லை. பாதிக்கப்பட்ட தாவரங்களை உடனே நீக்கி அழிக்கவும். վكتور்களை கட்டுப்படுத்தவும்."
        return f"{disease_name} is a viral disease - there is NO CURE. Immediately remove and destroy infected plants. Focus on vector control (aphids/whiteflies). Contact your extension officer."
    
    elif disease_type == "bacterial":
        if is_tamil:
            return f"{disease_name} பாக்டீரியா நோய். 1) கடிகரம británicos மூலம் பரவுகிறது. 2) कॉப்பர் அடிப்படை பாக்டீரியாசைட் பயன்படுத்தவும். 3) கருவிகளை துப்பக்கிய செய்யவும்."
        return f"For {disease_name} (bacterial): 1) Apply copper-based bactericides preventatively. 2) Switch to drip irrigation to avoid water splash. 3) Sanitize tools with 10% bleach between plants. 4) Remove severely infected parts. Contact extension officer for specific product recommendations."
    
    elif disease_type == "mite":
        if is_tamil:
            return f"சிலந்தி மைட்: 1) தாவரங்களுக்கு சுற்று ஈரப்பதம் அதிகரிக்கவும். 2) வலுவான தண்ணீரின் வழியாக அகற்றவும். 3) வேப்ப எண்ணெய் அல்லது קிடிசிடல் சோப்பு பயன்படுத்தவும்."
        return f"For spider mites on {plant}: 1) Increase humidity - mites thrive in dry conditions. 2) Strong water spray to dislodge mites. 3) Apply neem oil or insecticidal soap. 4) Encourage predatory mites/ladybugs. Contact extension officer for miticide options."
    
    else:  # fungal
        if is_tamil:
            return f"{disease_name} பூஞ்சை நோய்: 1) பாதிக்கப்பட்ட இலைகளை நீக்கவும். 2) வேர்ப்பகுதியில் நீர் கொடுங்கள். 3) பொருத்தமான பூஞ்சணக் கொல்லி பயன்படுத்தவும். உங்கள் வேளாண்மை அலுவலரை அணுகவும்."
        return f"For {disease_name} (fungal): 1) Remove and destroy infected leaves. 2) Water at base - avoid overhead irrigation. 3) Apply appropriate fungicide (consult extension officer for approved products). 4) Improve air circulation through pruning/spacing. 5) Mulch to prevent soil splash."

def generate_prevention_response(question: str, plant: str, disease_name: str, disease_type: str, prevention: str, is_tamil: bool) -> str:
    """Response about disease prevention."""
    if is_tamil:
        return f"{disease_name} தடுப்பு: {prevention} மேலும், சரியான செடி விதைகள், Tamil Nadu வேளாண்மை துறை பரிந்துரைகளைப் பின்பற்றவும்."
    return f"Prevention for {disease_name}: {prevention} Key strategies: Use certified disease-free seeds/transplants, rotate crops, maintain proper spacing for airflow, avoid overhead watering, sanitize tools, and follow local extension service recommendations."

def generate_causes_response(question: str, plant: str, disease_name: str, disease_type: str, description: str, is_tamil: bool) -> str:
    """Response about disease causes."""
    if disease_type == "viral":
        if is_tamil:
            return f"{disease_name} ஒரு வைரஸ் நோய். இது வெயில்கள் (whiteflies) அல்லது அஃபிட்கள் மூலம் பரவுகிறது. மாந்துகளின் மூலமும் பரவலாம்."
        return f"{disease_name} is caused by a virus transmitted primarily by insect vectors (whiteflies, aphids) and mechanical transmission (contaminated tools, hands)."
    
    elif disease_type == "bacterial":
        if is_tamil:
            return f"{disease_name} பாக்டீரியா காரணமாகவே. நீர் ஸ்பிளாஷ், காற்று, மாவு மூலம் பரவுகிறது. ஈரமான வாதாவரம் இதை முன்னேற்றுகிறது."
        return f"{disease_name} is caused by bacteria spread through water splash, wind-driven rain, contaminated tools, and infected seeds. Warm, humid conditions favor bacterial multiplication."
    
    elif disease_type == "mite":
        if is_tamil:
            return f"சிலந்தி மைட் வீற்று, உலர்ந்த விதவ ủyர்வில் வளர்கின்றன. தூசி மற்றும் நீர் ಒழிப்புகள் உணர்திறனை அதிகரிக்கின்றன."
        return f"Spider mites thrive in hot, dry, dusty conditions. Water-stressed plants are more susceptible. They spread via wind, equipment, and plant-to-plant contact."
    
    else:  # fungal
        if is_tamil:
            return f"{disease_name} பூஞ்சைக் கொடிகளால் உண்டாகும். காற்று, மழை ஸ்பிளாஷ், மாவு கருவிகள் மூலம் பரவுகிறது. அதிக ஈரப்பதம், குறைந்த காற்று பரப்பல்-help."
        return f"{disease_name} is caused by fungal spores spread via wind, rain splash, contaminated tools, and infected plant debris. High humidity, poor air circulation, and leaf wetness favor fungal growth."

def generate_identification_response(question: str, plant: str, disease_name: str, disease_type: str, symptoms: List, description: str, is_tamil: bool) -> str:
    """Response for disease identification help."""
    if is_tamil:
        return f"உங்கள் {plant} இல் {disease_name} கண்டறியப்பட்டது. முக்கிய அறிகுறிகள்: {', '.join(symptoms[:3]) if symptoms else description}. துல்லியமான تشخیصக்காக உங்கள் வட்டார வேளாண்மை அலுவலரை அணுகவும்."
    return f"Based on the detection, your {plant} has {disease_name}. Key identifying features: {', '.join(symptoms[:3]) if symptoms else description}. For definitive field diagnosis, consult your local agriculture extension officer."

def generate_watering_response(question: str, plant: str, disease_type: str, is_tamil: bool) -> str:
    """Response about watering."""
    if disease_type == "healthy":
        if is_tamil:
            return f"உங்கள் {plant} ஆரோக்கியமானது. செடி அடிப்பகுதியில் மிதமானంతு நீர் கொடுங்கள். மிதமpless ஈரப்பதம் வாய்ந்த தொடர் பராமரிக்கவும்."
        return f"Your {plant} is healthy. Water at the base (drip irrigation preferred) to keep foliage dry. Maintain consistent soil moisture - avoid both drought stress and waterlogging."
    
    if is_tamil:
        return f"நோய் உள்ள {plant} க்கு: ஓவர் ஹெட் ஈரிகেশন தவிர்க்கவும். ட்ரிப் ஈரிகेशन பயன்படுத்தவும். இலைப்பகுதி உலர்ந்திருக்க வேண்டும். மிதமான ஈரப்பதம் பராமரிக்கவும்."
    return f"For diseased {plant}: AVOID overhead irrigation. Use drip irrigation at soil level to keep foliage dry. Water early morning so leaves dry quickly. Maintain consistent moisture - don't let soil dry out completely or become waterlogged."

def generate_pest_response(question: str, plant: str, disease_type: str, is_tamil: bool) -> str:
    """Response about pest management."""
    if is_tamil:
        return f"பூச்சி மேலாண்மை: 1) நிஜcomedian பூச்சிகளை ஊக்குவிக்கவும் (ladybugs, praying mantis). 2) வேப்ப எண்ணெய், insecticidal soap பயன்படுத்தவும். 3) பழமையான synthetic பூச்சிக்கொல்லிகள் மறைவதற்காக மட்டுமே பயன்படுத்தவும். உங்கள் வேளாண்மை அலுவலரை அணுகவும்."
    return f"Integrated Pest Management for {plant}: 1) Encourage beneficial insects (ladybugs, lacewings, predatory mites). 2) Use neem oil, insecticidal soap, or horticultural oils first. 3) Apply synthetic pesticides only as last resort per extension officer guidance. 4) Monitor regularly with sticky traps. 5) Practice crop rotation and sanitation."

def generate_organic_response(question: str, plant: str, disease_type: str, is_tamil: bool) -> str:
    """Response about organic farming."""
    if is_tamil:
        return f"இயற்கை வேளாண்மை: 1) கரையோடு உரம், பunjukூள உரம் பயன்படுத்தவும். 2) பயிர் சுழலாற்று, இணைப்பயிர் முறைகள் பின்பற்றவும். 3) வேப்ப தைல், கhibang் lure, neem cake பயன்படுத்தவும். 4) தாவர قادرலை தொடர்ந்து மondheim போட்டு ஆரோக்கியத்தைப் பற்றாக்குங்கள். உங்கள் தொப்புல் organic certification மூலம் சரிபார்க்கவும்."
    return f"Organic practices for {plant}: 1) Build soil health with compost, vermicompost, green manure. 2) Practice crop rotation and intercropping. 3) Use neem oil, neem cake, garlic/chili sprays, copper-based products (OMRI-listed). 4) Encourage biodiversity and beneficial insects. 5) Consult your certifier before applying any product. Contact local organic farming association for region-specific guidance."

def generate_nutrition_response(question: str, plant: str, disease_type: str, is_tamil: bool) -> str:
    """Response about fertilizer and nutrition."""
    if is_tamil:
        return f"உரம் மற்றும் ஊட்டச்சத்து: 1) மண் சோதனை செய்து pH மற்றும் ஊட்டச்சத்து நிலைகளை அறியவும். 2) சமநிலையான NPK உரம் பயன்படுத்தவும். 3) நைட்ரஜன் அளவு அதிகமா இருந்தால் நோய் tarix peaking வரும். 4) மைக்ரோநூட்ரியண்டுகள் (Zn, Fe, Mg) தேவையானதில் தவறாதിരுக்கவும். உங்கள் வட்டார வேளாண்மை அலுவலரிடம் குறிப்பிட்ட பரிந்துரைகளைக் கேட்கவும்."
    return f"Nutrition for {plant}: 1) Test soil for pH and nutrient levels. 2) Apply balanced NPK based on soil test - excess nitrogen increases disease susceptibility. 3) Ensure adequate micronutrients (Zn, Fe, Mg, Ca, B). 4) Use organic matter to improve soil structure and nutrient retention. 5) Consult your extension officer for crop-specific fertilizer schedules."

def generate_general_response(question: str, plant: str, disease_name: str, disease_type: str, description: str, is_tamil: bool) -> str:
    """General plant care response."""
    if is_tamil:
        return f"உங்கள் {plant} பற்றிய கேள்விக்கு: {description} பொதுவாக, சரியான நீர் கொடுதல், நிலை பராமரிப்பு, மற்றும் வழிகாட்டுத் துறையின் விஷயங்களை பின்பற்றுங்கள். மேலும் குறிப்பிட்ட கேள்விகள் இருப்பினால் கேட்கவும்."
    return f"Regarding your {plant} ({disease_name}): {description} General care: Maintain proper watering (base only), good air circulation, regular scouting, and follow extension service recommendations. For specific advice, please ask about symptoms, treatment, prevention, or any other aspect."


def extract_disease_from_text(text: str) -> Optional[str]:
    """
    Extract a disease class from text by matching against known disease names and aliases.
    Returns the matched disease class or None.
    """
    if not text:
        return None
    text_lower = text.lower()
    
    # Check for exact disease class matches first (most specific)
    for disease in DISEASE_CLASSES:
        disease_lower = disease.lower()
        if disease_lower in text_lower:
            return disease
    
    # Check aliases
    for alias, disease in DISEASE_ALIASES.items():
        if alias in text_lower:
            return disease
    
    # Check for partial matches (e.g., "bacterial spot" without plant)
    # But be careful not to match too broadly
    return None


def extract_diseases_from_history(conversation_history: List[Dict]) -> List[str]:
    """
    Extract diseases mentioned in conversation history.
    Returns list of disease classes found, most recent first.
    """
    diseases = []
    for msg in reversed(conversation_history):  # Most recent first
        content = msg.get("content", "")
        disease = extract_disease_from_text(content)
        if disease and disease not in diseases:
            diseases.append(disease)
    return diseases


def resolve_disease_context(
    user_question: str,
    conversation_history: List[Dict],
    scan_disease_context: str
) -> Tuple[str, str, bool]:
    """
    Resolve the disease context based on priority:
    1. Explicit disease mentioned in the current user question.
    2. Explicit plant/disease mentioned in recent conversation history.
    3. Current scan disease context.
    4. General plant-care knowledge (None).
    
    Returns: (resolved_disease, source, is_self_reference)
    - source: "question", "history", "scan", or "none"
    - is_self_reference: True if user refers to "this disease", "my detected disease", etc.
    """
    question_lower = user_question.lower()
    
    # Check for self-reference phrases that indicate using scan context
    self_reference_phrases = [
        "this disease", "my detected disease", "the detected disease",
        "my disease", "the disease detected", "current disease",
        "scan result", "detected condition", "my plant's disease",
        "this condition", "the condition", "my scan"
    ]
    is_self_reference = any(phrase in question_lower for phrase in self_reference_phrases)
    
    # Priority 1: Explicit disease in current question
    question_disease = extract_disease_from_text(user_question)
    if question_disease:
        # If user explicitly mentions a disease, use it
        # UNLESS they're using a self-reference phrase
        if not is_self_reference:
            return question_disease, "question", False
    
    # Priority 2: Explicit disease in conversation history
    history_diseases = extract_diseases_from_history(conversation_history)
    if history_diseases:
        return history_diseases[0], "history", False
    
    # Priority 3: Current scan disease context
    if scan_disease_context:
        if is_self_reference:
            return scan_disease_context, "scan", True
        # If no explicit disease mentioned and no self-reference,
        # but the question is about treatment/symptoms/causes, 
        # we should still check if they meant the scan disease
        # For ambiguous cases, we'll use scan context but flag it
        return scan_disease_context, "scan", False
    
    # Priority 4: No disease context available
    return "", "none", False


def normalize_disease_display(disease: str) -> str:
    """Convert disease class to human-readable display name."""
    if not disease:
        return "No disease detected"
    return disease.replace("___", " → ").replace("_", " ")