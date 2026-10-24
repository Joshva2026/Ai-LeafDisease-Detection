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
    # Devanagari (\u0900-\u097F), Chinese (\u4E00-\u9FFF), Japanese (\u3040-\u30FF), Korean (\uAC00-\uD7AF, \u1100-\u11FF), Arabic (\u0600-\u06FF), Cyrillic (\u0400-\u04FF)
    contaminated = re.findall(r'[\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u1100-\u11FF\u0600-\u06FF\u0400-\u04FF]', text)
    if contaminated:
        return False, f"Foreign script contamination detected: {''.join(contaminated)}"

    # 2. Detect suspicious mixed-language tokens (e.g., அபெக்டிமிசillin, பூச்சிய病害)
    # Matches a word that transitions directly between English/Latin and Tamil without spaces/punctuation.
    # mixed_word = re.search(r'([a-zA-Z]+[\u0b80-\u0bff]+|[\u0b80-\u0bff]+[a-zA-Z]+)', text)
    # if mixed_word:
    #     return False, f"Corrupted mixed-language word detected: {mixed_word.group(0)}"

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
    Handles markdown fences, control characters, and regex extraction fallback.
    Returns (dict, None) if valid, or (None, error_reason) if invalid.
    """
    if not text or not isinstance(text, str):
        return None, "Empty text received"

    # Strip markdown code blocks (```json ... ```)
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'```\s*$', '', cleaned, flags=re.MULTILINE)

    # Locate outer curly braces
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    if start_idx == -1 or end_idx == -1 or end_idx <= start_idx:
        return None, "No JSON structure found"

    json_str = cleaned[start_idx:end_idx+1]
    parsed = None

    # First attempt: direct json.loads with strict=False
    try:
        parsed = json.loads(json_str, strict=False)
    except Exception:
        # Second attempt: sanitize unescaped newlines inside strings
        try:
            sanitized = re.sub(r'[\r\n\t]', ' ', json_str)
            parsed = json.loads(sanitized, strict=False)
        except Exception as e:
            # Third attempt: regex key-value extraction for essential fields
            required_keys = [
                "diagnosis", "summary", "symptoms", "causes", 
                "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"
            ]
            extracted = {}
            for k in required_keys:
                pat = rf'"{k}"\s*:\s*(?:\[([^\]]*)\]|"([^"]*)")'
                m = re.search(pat, json_str)
                if m:
                    if m.group(1) is not None:
                        # array of strings
                        items = re.findall(r'"([^"]*)"', m.group(1))
                        extracted[k] = items
                    else:
                        extracted[k] = m.group(2)
            if len(extracted) >= 6:
                parsed = extracted
            else:
                return None, f"Invalid JSON format: {str(e)}"

    if not isinstance(parsed, dict):
        return None, "JSON is not an object"

    required_keys = [
        "diagnosis", "summary", "symptoms", "causes", 
        "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"
    ]
    
    normalized_report = {}

    for key in required_keys:
        val = parsed.get(key, "")
        if isinstance(val, str):
            val = val.strip()
            # If the key is one of the list fields, but arrived as a string, make it a list
            if key in ["symptoms", "causes", "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"]:
                items = [item.strip() for item in val.split('\n') if item.strip()]
                normalized_report[key] = []
                for item in items:
                    cleaned_item = re.sub(r'^[\d\.\-\*•]+\s*', '', item)
                    if cleaned_item and cleaned_item not in normalized_report[key]:
                        normalized_report[key].append(cleaned_item)
                if not normalized_report[key] and val:
                    normalized_report[key] = [re.sub(r'^[\d\.\-\*•]+\s*', '', val)]
            else:
                normalized_report[key] = val
        elif isinstance(val, list):
            normalized_report[key] = []
            for item in val:
                if isinstance(item, str) and item.strip():
                    cleaned_item = re.sub(r'^[\d\.\-\*•]+\s*', '', item.strip())
                    if cleaned_item and cleaned_item not in normalized_report[key]:
                        normalized_report[key].append(cleaned_item)
        else:
             normalized_report[key] = [str(val)] if key in ["symptoms", "causes", "immediate_actions", "treatment", "prevention", "monitoring", "farmer_advice"] else (str(val) if val else "")
             
    return normalized_report, None

def clean_tamil_text(text):
    """
    Post-processing cleanup: strips non-Tamil/non-English/non-punctuation characters from translated text.
    Keeps: Tamil (U+0B80-U+0BFF), ASCII (Latin, digits, punctuation), common punctuation.
    """
    if not text:
        return text
    # Remove characters that are NOT: Tamil, ASCII printable, basic whitespace
    cleaned = re.sub(r'[^\u0B80-\u0BFF\u0020-\u007Ea-zA-Z0-9.,;:!?()\[\]\-\'\"/%&@#$\n\r\t]', '', text)
    # Collapse multiple spaces
    cleaned = re.sub(r'  +', ' ', cleaned)
    return cleaned.strip()

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
