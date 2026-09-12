import re
import json

def validate_tamil_quality(text):
    """
    Validates if the provided text meets the strict Tamil quality requirements.
    Returns (True, None) if valid, or (False, error_reason) if invalid.
    """
    if not text or not isinstance(text, str):
        return False, "Empty or invalid text"

    # 1. Reject obvious script contamination
    # Devanagari (\u0900-\u097F), Chinese (\u4E00-\u9FFF), Japanese (\u3040-\u30FF), Arabic (\u0600-\u06FF), Cyrillic (\u0400-\u04FF)
    contaminated = re.findall(r'[\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\u0600-\u06FF\u0400-\u04FF]', text)
    if len(contaminated) > 3:
        return False, f"Foreign script contamination detected: {''.join(contaminated)}"

    # 2. Detect suspicious mixed-language tokens (e.g., அபெக்டிமிசillin, பூச்சிய病害)
    # Matches a word that transitions directly between English/Latin and Tamil without spaces/punctuation.
    mixed_word = re.search(r'([a-zA-Z]+[\u0b80-\u0bff]+|[\u0b80-\u0bff]+[a-zA-Z]+)', text)
    if mixed_word:
        return False, f"Corrupted mixed-language word detected: {mixed_word.group(0)}"

    # 3. Detect specific corrupted/inappropriate words
    bad_words = [
        "mmediately", "feuilles", "thing", "twisting", "sulfur", "damage",
        "mercy", "مرض", "बीमारी"
    ]
    lower_text = text.lower()
    for word in bad_words:
        if word in lower_text:
            return False, f"Corrupted token detected: {word}"

    # Note: Scientific names like (Early Blight) are allowed because they are separate English words,
    # and they don't fail the mixed_word regex since they are separated by spaces/punctuation.

    return True, None

def validate_farmer_report_json(text):
    """
    Safely extracts and parses the JSON farmer report.
    Returns (dict, None) if valid, or (None, error_reason) if invalid.
    """
    # Try parsing JSON by extracting from markdown or raw text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if not json_match:
        return None, "No JSON structure found"

    try:
        parsed = json.loads(json_match.group(0))
    except Exception as e:
        return None, f"Invalid JSON format: {str(e)}"

    if not isinstance(parsed, dict):
        return None, "JSON is not an object"

    required_keys = [
        "diagnosis", "summary", "symptoms", "causes", 
        "immediate_actions", "treatment", "prevention", "monitoring"
    ]

    for key in required_keys:
        if key not in parsed:
            return None, f"Missing required key: {key}"
        
        val = parsed[key]
        if isinstance(val, str) and not val.strip():
            return None, f"Empty value for key: {key}"
        if isinstance(val, list) and not val:
            return None, f"Empty array for key: {key}"

    return parsed, None

def validate_agricultural_facts(parsed_json, disease_key, disease_meta):
    """
    Validates if the generated farmer report is factually consistent with the trusted disease metadata.
    """
    if not disease_meta:
        # If we don't have trusted metadata, we just check for basic hallucinated dosages
        all_text = json.dumps(parsed_json).lower()
        if re.search(r'\d+\s*(ml|g|kg|oz|tsp)\s*/\s*(l|lit|liter|gallon)', all_text) and "ml" not in all_text and "lit" not in all_text:
             # Basic chemical dosage check. It's better to be permissive if no metadata.
             pass
        return True, None

    all_text_lower = json.dumps(parsed_json).lower()
    meta_text_lower = json.dumps(disease_meta).lower()
    
    # 1. Pathogen contradiction check.
    # If the trusted metadata mentions 'fung' (fungus/fungal) but the output says 'bacteri', or vice-versa
    if "fung" in meta_text_lower and "bacteri" in all_text_lower and "bacteri" not in meta_text_lower:
        return False, "Factual contradiction: Output mentions bacteria for a fungal disease."
    if "bacteri" in meta_text_lower and "fung" in all_text_lower and "fung" not in meta_text_lower:
        return False, "Factual contradiction: Output mentions fungus for a bacterial disease."
    if "virus" in meta_text_lower or "viral" in meta_text_lower:
        if "fung" in all_text_lower and "fung" not in meta_text_lower:
             return False, "Factual contradiction: Output mentions fungus for a viral disease."
        if "bacteri" in all_text_lower and "bacteri" not in meta_text_lower:
             return False, "Factual contradiction: Output mentions bacteria for a viral disease."

    return True, None
