#!/usr/bin/env python3
"""
Comprehensive NVIDIA AI Integration Test for LeafGuard AI
Tests chatbot (English + Tamil) and disease reports (English + Tamil)
"""

import json
import time
import sys
import os
import subprocess
import requests
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
import json as json_module

# Load environment first
from dotenv import load_dotenv
load_dotenv()

# Test configuration
BASE_URL = "http://localhost:10000"
HEALTH_ENDPOINT = f"{BASE_URL}/health"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
REPORT_ENDPOINT = f"{BASE_URL}/api/ai/farmer-report"
TRANSLATE_ENDPOINT = f"{BASE_URL}/api/ai/translate-report"

# Chatbot English questions
CHAT_EN_QUESTIONS = [
    "What are the symptoms of early blight in tomatoes?",
    "How do I treat bacterial spot?",
    "How can I prevent late blight?",
    "What causes tomato yellow leaf curl virus?",
    "Can I use neem oil for spider mites?",
]

# Chatbot Tamil questions
CHAT_TA_QUESTIONS = [
    "தக்காளி செடியில் Early Blight நோயின் அறிகுறிகள் என்ன?",
    "Bacterial Spot நோயை எப்படி குணப்படுத்துவது?",
    "Late Blight நோய் வராமல் எப்படி தடுப்பது?",
    "தக்காளி செடியில் மஞ்சள் இலைகள் வருவதற்கு என்ன காரணம்?",
    "சிலந்திப் பூச்சிகளை இயற்கையான முறையில் எப்படி கட்டுப்படுத்துவது?",
]

# Disease classes for report testing
DISEASE_TESTS = [
    {"name": "Bacterial Disease", "disease": "Tomato___Bacterial_spot", "plant": "Tomato", "confidence": 92.5, "diagnosis_expected": "Tomato Bacterial Spot"},
    {"name": "Fungal Disease", "disease": "Tomato___Late_blight", "plant": "Tomato", "confidence": 94.2, "diagnosis_expected": "Tomato Late Blight"},
    {"name": "Viral Disease", "disease": "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "plant": "Tomato", "confidence": 89.7, "diagnosis_expected": "Tomato Yellow Leaf Curl Virus"},
    {"name": "Healthy Leaf", "disease": "Tomato___healthy", "plant": "Tomato", "confidence": 98.1, "diagnosis_expected": "Tomato Healthy"},
    {"name": "Mite/Pest Disease", "disease": "Tomato___Spider_mites Two-spotted_spider_mite", "plant": "Tomato", "confidence": 87.3, "diagnosis_expected": "Spider mite"},
]

REPORT_SECTIONS = [
    "diagnosis", "summary", "symptoms", "causes", 
    "immediate_actions", "treatment", "prevention", 
    "monitoring", "farmer_advice"
]

@dataclass
class TestResult:
    name: str
    passed: bool
    details: str
    http_status: int = 0
    provider: str = ""
    model: str = ""
    language: str = ""
    response_time: float = 0.0
    response_preview: str = ""
    error: str = ""

class NVIDIATester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.server_process = None
        self.session = requests.Session()
        self.results: List[TestResult] = []
        self.nvidia_model = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
       
    def start_server(self) -> bool:
        """Start the Flask backend server with .env loaded."""
        print("Starting Flask backend server...")
        env = os.environ.copy()
        env["TF_CPP_MIN_LOG_LEVEL"] = "2"
        env["TF_ENABLE_ONEDNN_OPTS"] = "0"
        env["CUDA_VISIBLE_DEVICES"] = "-1"
       
        self.server_process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd="D:/Leaf Disease Prediction/LeafDiseaseAPI",
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
       
        # Wait for server to be ready
        for i in range(30):
            try:
                resp = self.session.get(HEALTH_ENDPOINT, timeout=2)
                if resp.status_code == 200:
                    health_data = resp.json()
                    print(f"Server healthy: {health_data}")
                    return True
            except Exception as e:
                time.sleep(1)
       
        print("Server failed to start")
        self.stop_server()
        return False
   
    def stop_server(self):
        if self.server_process:
            self.server_process.terminate()
            try:
                self.server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server_process.kill()
            self.server_process = None
   
    def make_chat_request(self, message: str, lang: str, context: str = "Tomato___Early_blight", history: List = None) -> tuple:
        """Make a chat request and return (data, response_time)."""
        payload = {
            "message": message,
            "context": context,
            "history": history or [],
            "lang": lang,
            "diseaseInfo": f"Detected disease: {context.replace('___', ' -> ').replace('_', ' ')}"
        }
        
        start_time = time.time()
        resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=60)
        response_time = time.time() - start_time
        
        return resp, response_time
    
    def make_report_request(self, plant: str, disease: str, confidence: float, lang: str = "en") -> tuple:
        """Make a farmer report request and return (data, response_time)."""
        payload = {
            "plant": plant,
            "disease": disease,
            "confidence": confidence
        }
        
        start_time = time.time()
        resp = self.session.post(REPORT_ENDPOINT, json=payload, timeout=120)
        response_time = time.time() - start_time
        
        return resp, response_time
    
    def make_translate_request(self, english_report: dict, target_lang: str = "ta") -> tuple:
        """Translate a report to Tamil."""
        payload = {
            "english_report": english_report,
            "target_language": target_lang
        }
        
        start_time = time.time()
        resp = self.session.post(TRANSLATE_ENDPOINT, json=payload, timeout=60)
        response_time = time.time() - start_time
        
        return resp, response_time
    
    def analyze_response(self, resp, expected_lang: str, test_name: str) -> TestResult:
        """Analyze response for provider, language, content quality."""
        http_status = resp.status_code
        
        if http_status != 200:
            return TestResult(
                name=test_name,
                passed=False,
                details=f"HTTP {http_status}: {resp.text[:200]}",
                http_status=http_status,
                error=f"HTTP {http_status}"
            )
        
        data = resp.json()
        provider = data.get("provider", "unknown")
        reply = data.get("reply") or data.get("response") or json_module.dumps(data.get("structured_report", {}))
        model = data.get("model", "")
        context_source = data.get("context_source", "")
        resolved_disease = data.get("resolved_disease", "")
        
        # Check if response is from NVIDIA
        is_nvidia = "nvidia" in provider.lower()
        is_gemini = "gemini" in provider.lower()
        is_offline = "offline" in provider.lower()
        
        # Basic content checks
        reply_str = str(reply)
        content_ok = len(reply_str) > 50
        
        # Language check (basic)
        lang_ok = True
        if expected_lang == "ta":
            # Check for Tamil characters
            has_tamil = any('\u0b80' <= c <= '\u0bff' for c in reply_str)
            if not has_tamil and len(reply_str) > 100:
                lang_ok = False
        
        passed = http_status == 200 and content_ok and lang_ok
        
        details = f"Provider: {provider}, Model: {model}, ContentOK: {content_ok}, LangOK: {lang_ok}"
        if context_source:
            details += f", ContextSource: {context_source}"
        if resolved_disease:
            details += f", ResolvedDisease: {resolved_disease}"
        
        return TestResult(
            name=test_name,
            passed=passed,
            details=details,
            http_status=http_status,
            provider=provider,
            model=model,
            language=expected_lang,
            response_time=0.0,  # Will be set by caller
            response_preview=reply_str[:300],
            error="" if passed else f"Provider: {provider}, ContentOK: {content_ok}, LangOK: {lang_ok}"
        )
    
    def test_chat_english(self) -> List[TestResult]:
        """Test chatbot with English questions."""
        print("\n2. Chatbot English Tests...")
        results = []
        
        for i, question in enumerate(CHAT_EN_QUESTIONS):
            print(f"  Q{i+1}: {question[:50]}...")
            resp, rt = self.make_chat_request(question, "en")
            result = self.analyze_response(resp, "en", f"Chat EN Q{i+1}: {question[:40]}...")
            result.response_time = rt
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(f"    {status} - Provider: {result.provider}, Time: {rt:.2f}s")
            if not result.passed:
                print(f"      Error: {result.error}")
                print(f"      Response: {result.response_preview[:200]}")
        
        return results
    
    def test_chat_tamil(self) -> List[TestResult]:
        """Test chatbot with Tamil questions."""
        print("\n3. Chatbot Tamil Tests...")
        results = []
        
        for i, question in enumerate(CHAT_TA_QUESTIONS):
            # Print question without Tamil chars for Windows console
            q_display = question.encode('ascii', 'replace').decode('ascii')
            print(f"  Q{i+1}: {q_display[:50]}...")
            resp, rt = self.make_chat_request(question, "ta")
            result = self.analyze_response(resp, "ta", f"Chat TA Q{i+1}: {q_display[:40]}...")
            result.response_time = rt
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(f"    {status} - Provider: {result.provider}, Time: {rt:.2f}s")
            if not result.passed:
                print(f"      Error: {result.error}")
                print(f"      Response: {result.response_preview[:200]}")
        
        return results
    
    def test_reports_english(self) -> List[TestResult]:
        """Test disease reports in English."""
        print("\n4. Disease Reports English Tests...")
        results = []
        
        for disease_test in DISEASE_TESTS:
            print(f"  Testing: {disease_test['name']}...")
            resp, rt = self.make_report_request(
                disease_test["plant"], 
                disease_test["disease"], 
                disease_test["confidence"],
                "en"
            )
            
            http_status = resp.status_code
            if http_status == 200:
                data = resp.json()
                provider = data.get("provider", "unknown")
                model = data.get("model", "")
                structured_report = data.get("structured_report", {})
                
                # Check all 9 sections
                sections_present = []
                for section in REPORT_SECTIONS:
                    val = structured_report.get(section, [])
                    if val and (isinstance(val, list) and len(val) > 0 or isinstance(val, str) and val.strip()):
                        sections_present.append(section)
                
                all_sections = len(sections_present) == 9
                
                # Check disease-specific content
                diagnosis = structured_report.get("diagnosis", "")
                diagnosis_expected = disease_test.get("diagnosis_expected", "")
                diagnosis_correct = diagnosis_expected.lower() in diagnosis.lower()
                
                # Healthy check
                is_healthy = "healthy" in disease_test["disease"].lower()
                healthy_ok = True
                if is_healthy:
                    treatment = structured_report.get("treatment", [])
                    healthy_ok = "none required" in str(treatment).lower() or "healthy" in str(structured_report.get("summary", "")).lower()
                
                passed = all_sections and diagnosis_correct and healthy_ok
                
                result = TestResult(
                    name=f"Report EN: {disease_test['name']}",
                    passed=passed,
                    details=f"Provider: {provider}, Model: {model}, Sections: {len(sections_present)}/9, DiagnosisOK: {diagnosis_correct}, HealthyOK: {healthy_ok}",
                    http_status=http_status,
                    provider=provider,
                    model=model,
                    language="en",
                    response_time=rt,
                    response_preview=json_module.dumps(structured_report, indent=2)[:500]
                )
            else:
                result = TestResult(
                    name=f"Report EN: {disease_test['name']}",
                    passed=False,
                    details=f"HTTP {http_status}: {resp.text[:200]}",
                    http_status=http_status,
                    language="en",
                    response_time=rt,
                    error=f"HTTP {http_status}"
                )
            
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(f"    {status} - Provider: {result.provider}, Time: {rt:.2f}s, Sections: {result.details}")
        
        return results
    
    def test_reports_tamil(self) -> List[TestResult]:
        """Test disease reports in Tamil via translation."""
        print("\n5. Disease Reports Tamil Tests...")
        results = []
        
        for disease_test in DISEASE_TESTS:
            print(f"  Testing: {disease_test['name']} (EN -> TA)...")
            
            # First get English report
            resp_en, _ = self.make_report_request(
                disease_test["plant"], 
                disease_test["disease"], 
                disease_test["confidence"],
                "en"
            )
            
            if resp_en.status_code != 200:
                result = TestResult(
                    name=f"Report TA: {disease_test['name']}",
                    passed=False,
                    details=f"English report failed: HTTP {resp_en.status_code}",
                    http_status=resp_en.status_code,
                    language="ta",
                    error="English report failed"
                )
                results.append(result)
                continue
            
            english_report = resp_en.json().get("structured_report", {})
            
            # Translate to Tamil
            resp_ta, rt = self.make_translate_request(english_report, "ta")
            
            http_status = resp_ta.status_code
            if http_status == 200:
                data = resp_ta.json()
                provider = data.get("provider", "unknown")
                model = data.get("model", "")
                structured_report = data.get("structured_report", {})
                
                # Check all 9 sections in Tamil
                sections_present = []
                for section in REPORT_SECTIONS:
                    val = structured_report.get(section, [])
                    if val and (isinstance(val, list) and len(val) > 0 or isinstance(val, str) and val.strip()):
                        sections_present.append(section)
                
                all_sections = len(sections_present) == 9
                
                # Check Tamil content
                tamil_ok = True
                report_str = json_module.dumps(structured_report, ensure_ascii=False)
                # Check for Tamil characters in at least some fields
                has_tamil_chars = any('\u0b80' <= c <= '\u0bff' for c in report_str)
                if not has_tamil_chars and len(report_str) > 100:
                    tamil_ok = False
                
                passed = all_sections and tamil_ok
                
                result = TestResult(
                    name=f"Report TA: {disease_test['name']}",
                    passed=passed,
                    details=f"Provider: {provider}, Model: {model}, Sections: {len(sections_present)}/9, TamilOK: {tamil_ok}",
                    http_status=http_status,
                    provider=provider,
                    model=model,
                    language="ta",
                    response_time=rt,
                    response_preview=json_module.dumps(structured_report, indent=2, ensure_ascii=False)[:500]
                )
            else:
                result = TestResult(
                    name=f"Report TA: {disease_test['name']}",
                    passed=False,
                    details=f"HTTP {http_status}: {resp_ta.text[:200]}",
                    http_status=http_status,
                    language="ta",
                    response_time=rt,
                    error=f"HTTP {http_status}"
                )
            
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(f"    {status} - Provider: {result.provider}, Time: {rt:.2f}s")
            if not result.passed:
                print(f"      Error: {result.error}")
        
        return results
    
    def run_all_tests(self):
        print("=" * 70)
        print("LeafGuard AI - NVIDIA Integration Test Suite")
        print("=" * 70)
        print(f"NVIDIA Model: {self.nvidia_model}")
        print(f"NVIDIA API Key: {'SET' if os.getenv('NVIDIA_API_KEY') else 'NOT SET'}")
        print(f"GEMINI API Key: {'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
        
        # Start server
        if not self.start_server():
            print("FAILED: Could not start server")
            return False
        
        try:
            # Test 1: Health check
            print("\n1. Health Check...")
            resp = self.session.get(HEALTH_ENDPOINT, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                result = TestResult(
                    name="Health Check",
                    passed=True,
                    details=f"Server healthy, model loaded: {data.get('model_loaded', False)}",
                    http_status=200,
                    response_preview=str(data)
                )
                self.results.append(result)
                print(f"   PASS: {result.details}")
            else:
                result = TestResult("Health Check", False, f"Status: {resp.status_code}", resp.status_code)
                self.results.append(result)
                print(f"   FAIL: {result.details}")
            
            # Test 2: Chatbot English
            chat_en_results = self.test_chat_english()
            self.results.extend(chat_en_results)
            
            # Test 3: Chatbot Tamil
            chat_ta_results = self.test_chat_tamil()
            self.results.extend(chat_ta_results)
            
            # Test 4: Disease Reports English
            report_en_results = self.test_reports_english()
            self.results.extend(report_en_results)
            
            # Test 5: Disease Reports Tamil
            report_ta_results = self.test_reports_tamil()
            self.results.extend(report_ta_results)
            
        finally:
            self.stop_server()
        
        return self.generate_report()
    
    def generate_report(self):
        print("\n" + "=" * 70)
        print("NVIDIA INTEGRATION TEST REPORT")
        print("=" * 70)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {passed/total*100:.1f}%")
        print()
        
        # Provider summary
        providers = {}
        models = {}
        for r in self.results:
            if r.provider:
                providers[r.provider] = providers.get(r.provider, 0) + 1
            if r.model:
                models[r.model] = models.get(r.model, 0) + 1
        
        print("Provider Usage:")
        for prov, count in sorted(providers.items()):
            print(f"  {prov}: {count} responses")
        
        print("\nModels Used:")
        for model, count in sorted(models.items()):
            print(f"  {model}: {count} responses")
        
        def safe_print(text):
            """Safely print text handling encoding issues."""
            try:
                print(text)
            except UnicodeEncodeError:
                print(text.encode('ascii', 'replace').decode('ascii'))
        
        print("\nDetailed Results:")
        print("-" * 70)
        for r in self.results:
            status = "[PASS]" if r.passed else "[FAIL]"
            safe_print(f"{status} | {r.name}")
            safe_print(f"       HTTP: {r.http_status} | Provider: {r.provider} | Model: {r.model} | Lang: {r.language} | Time: {r.response_time:.2f}s")
            safe_print(f"       Details: {r.details}")
            if r.response_preview:
                preview = r.response_preview[:300].replace('\u2192', '->')
                safe_print(f"       Response: {preview}...")
            if r.error:
                safe_print(f"       ERROR: {r.error}")
            print()
        
        # Summary table
        print("\n" + "=" * 70)
        print("SUMMARY TABLE")
        print("=" * 70)
        
        # Categorize results
        chat_en = [r for r in self.results if r.name.startswith("Chat EN")]
        chat_ta = [r for r in self.results if r.name.startswith("Chat TA")]
        report_en = [r for r in self.results if r.name.startswith("Report EN")]
        report_ta = [r for r in self.results if r.name.startswith("Report TA")]
        
        def check_category(results, check_provider=True):
            if not results:
                return "N/A"
            all_passed = all(r.passed for r in results)
            if check_provider:
                all_nvidia = all("nvidia" in r.provider.lower() for r in results)
                return "PASS" if all_passed and all_nvidia else "FAIL"
            return "PASS" if all_passed else "FAIL"
        
        print(f"| {'Feature':<30} | {'English':<12} | {'Tamil':<12} |")
        print(f"| {'-'*30} | {'-'*12} | {'-'*12} |")
        print(f"| {'NVIDIA Chatbot':<30} | {check_category(chat_en):<12} | {check_category(chat_ta):<12} |")
        print(f"| {'Disease Reports':<30} | {check_category(report_en):<12} | {check_category(report_ta):<12} |")
        print(f"| {'Correct Provider (NVIDIA)':<30} | {check_category(chat_en + report_en):<12} | {check_category(chat_ta + report_ta):<12} |")
        print(f"| {'Correct Language':<30} | {check_category(chat_en, False):<12} | {check_category(chat_ta, False):<12} |")
        print(f"| {'Disease-Specific Content':<30} | {check_category(report_en, False):<12} | {check_category(report_ta, False):<12} |")
        
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "results": [asdict(r) for r in self.results]
        }


def main():
    if not os.path.exists("D:/Leaf Disease Prediction/LeafDiseaseAPI/app.py"):
        print("Error: Please run from the project root directory")
        sys.exit(1)
    
    tester = NVIDIATester()
    report = tester.run_all_tests()
    
    # Save report
    with open("nvidia_integration_test_report.json", "w", encoding="utf-8") as f:
        json_module.dump(report, f, indent=2, ensure_ascii=False)
    print("\nReport saved to nvidia_integration_test_report.json")
    
    sys.exit(0 if report["failed"] == 0 else 1)


if __name__ == "__main__":
    main()