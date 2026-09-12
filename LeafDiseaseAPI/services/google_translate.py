"""
Google Translate service for Tamil translation.
Uses the Google Translate web API directly via requests.
No external library dependency — avoids httpx conflicts.
"""
import requests
import json
import time
import urllib.parse


def google_translate(text, source_lang="en", target_lang="ta", max_retries=2):
    """
    Translate text using Google Translate API.
    Returns (translated_text, error_message).
    """
    if not text or not text.strip():
        return text, None

    url = "https://translate.googleapis.com/translate_a/single"
    
    for attempt in range(max_retries):
        try:
            params = {
                "client": "gtx",
                "sl": source_lang,
                "tl": target_lang,
                "dt": "t",
                "q": text
            }
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            resp = requests.get(url, params=params, headers=headers, timeout=10)
            
            if resp.status_code == 429:
                # Rate limited — wait and retry
                wait = 2 * (attempt + 1)
                time.sleep(wait)
                continue
            
            if resp.status_code != 200:
                return None, f"HTTP {resp.status_code}"
            
            # Parse the response — it's a nested JSON array
            data = resp.json()
            
            # Extract translated text from the nested array structure
            # Format: [[["translated text","original text",null,null,confidence],...],null,"en",...]
            translated_parts = []
            if data and isinstance(data, list) and data[0]:
                for part in data[0]:
                    if isinstance(part, list) and len(part) >= 1:
                        translated_parts.append(part[0])
            
            translated = "".join(translated_parts)
            
            if translated:
                return translated, None
            else:
                return None, "Empty translation result"
                
        except requests.exceptions.Timeout:
            continue
        except Exception as e:
            return None, f"{type(e).__name__}: {str(e)}"
    
    return None, "Max retries exceeded"


def translate_report_to_tamil(english_report):
    """
    Translate a complete 9-key English farmer report to Tamil using Google Translate.
    Returns (translated_report_dict, failed_keys_list, error_message).
    
    Translates each section individually to avoid rate limits and allow partial success.
    """
    if not english_report or not isinstance(english_report, dict):
        return None, [], "Invalid report"
    
    translated = {}
    failed_keys = []
    
    for key, value in english_report.items():
        if isinstance(value, list):
            translated_items = []
            for item in value:
                result, err = google_translate(str(item))
                if result:
                    translated_items.append(result)
                else:
                    # Fallback to English for this item
                    translated_items.append(str(item))
                    
                # Brief pause to avoid rate limiting
                time.sleep(0.2)
            
            translated[key] = translated_items
            
        else:
            result, err = google_translate(str(value))
            if result:
                translated[key] = result
            else:
                translated[key] = str(value)  # Fallback to English
                failed_keys.append(key)
            
            time.sleep(0.2)
    
    if len(failed_keys) > 4:
        return None, failed_keys, f"Too many sections failed: {failed_keys}"
    
    return translated, failed_keys, None
