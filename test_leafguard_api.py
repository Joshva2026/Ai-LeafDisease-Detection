#!/usr/bin/env python3
"""
Automated API tests for LeafGuard AI backend.
Tests chatbot and disease report endpoints.
"""

import json
import time
import sys
import os
import subprocess
import requests
from typing import Dict, List, Any
from dataclasses import dataclass
import json as json_module

# Test configuration
BASE_URL = "http://localhost:10000"
HEALTH_ENDPOINT = f"{BASE_URL}/health"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
REPORT_ENDPOINT = f"{BASE_URL}/api/ai/farmer-report"

# Test questions for chatbot
CHAT_QUESTIONS = [
    "What are the symptoms of early blight on tomatoes?",
    "How do I treat bacterial spot on peppers?",
    "How can I prevent late blight on potatoes?",
    "What causes tomato yellow leaf curl virus?",
    "How does late blight spread between plants?",
    "Can I use neem oil for spider mites on tomatoes?",
    "What's the difference between early blight and late blight on tomatoes?",
    "How often should I water my tomato plants to prevent disease?",
    "Is copper fungicide approved for organic farming?",
    "My tomato plant has yellow leaves with brown spots - what could it be?",
]

# Disease classes to test (5 different categories)
DISEASE_TESTS = [
    {
        "name": "Bacterial Disease",
        "disease": "Tomato___Bacterial_spot",
        "plant": "Tomato",
        "confidence": 92.5
    },
    {
        "name": "Fungal Disease",
        "disease": "Tomato___Late_blight",
        "plant": "Tomato",
        "confidence": 94.2
    },
    {
        "name": "Viral Disease",
        "disease": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "plant": "Tomato",
        "confidence": 89.7
    },
    {
        "name": "Healthy Leaf",
        "disease": "Tomato___healthy",
        "plant": "Tomato",
        "confidence": 98.1
    },
    {
        "name": "Mite/Pest Disease",
        "disease": "Tomato___Spider_mites Two-spotted_spider_mite",
        "plant": "Tomato",
        "confidence": 87.3
    },
]

# Report sections to compare
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
    response_preview: str = ""

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.server_process = None
        self.session = requests.Session()
        self.results: List[TestResult] = []
       
    def start_server(self) -> bool:
        """Start the Flask backend server."""
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
   
    def test_health(self) -> TestResult:
        try:
            resp = self.session.get(HEALTH_ENDPOINT, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                model_loaded = data.get("model_loaded", False)
                # Model is lazily loaded, so this is expected to be False until first prediction
                return TestResult(
                    name="Health Check",
                    passed=True,  # Server is healthy even if model not loaded yet
                    details=f"Server healthy, model loaded: {model_loaded} (lazy loading)",
                    http_status=resp.status_code,
                    response_preview=str(data)[:200]
                )
            else:
                return TestResult("Health Check", False, f"Status: {resp.status_code}", resp.status_code)
        except Exception as e:
            return TestResult("Health Check", False, f"Error: {e}", 0)
   
    def test_chatbot(self) -> List[TestResult]:
        results = []
        conversation_history = []
       
        for i, question in enumerate(CHAT_QUESTIONS):
            print(f"  Chat Q{i+1}: {question[:50]}...")
           
            payload = {
                "message": question,
                "context": "Tomato___Early_blight",
                "history": conversation_history,
                "diseaseInfo": "Detected disease: Tomato -> Early blight"
            }
           
            try:
                resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
                http_status = resp.status_code
               
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data.get("reply", "")
                    provider = data.get("provider", "unknown")
                   
                    # Check if response is meaningful
                    is_generic = len(reply) < 50 or "generic" in reply.lower()
                    is_fallback = provider == "offline_knowledge_base"
                   
                    # Check for repetition with previous answers
                    is_repetitive = False
                    if len(results) > 0:
                        prev_reply = results[-1].response_preview
                        # Simple similarity check
                        if len(reply) > 20 and len(prev_reply) > 20:
                            common_words = set(reply.lower().split()) & set(prev_reply.lower().split())
                            if len(common_words) / max(len(set(reply.lower().split())), 1) > 0.7:
                                is_repetitive = True
                   
                    passed = len(reply) > 50 and not is_repetitive
                   
                    # Add to conversation history
                    conversation_history.append({"role": "user", "content": question})
                    conversation_history.append({"role": "assistant", "content": reply})
                   
                    results.append(TestResult(
                        name=f"Chat Q{len(results)+1}: {question[:40]}...",
                        passed=passed,
                        details=f"Provider: {provider}, Fallback: {is_fallback}, Repetitive: {is_repetitive}",
                        http_status=http_status,
                        provider=provider,
                        response_preview=reply[:200]
                    ))
                else:
                    results.append(TestResult(
                        name=f"Chat Q{len(results)+1}",
                        passed=False,
                        details=f"HTTP {http_status}: {resp.text[:200]}",
                        http_status=http_status
                    ))
            except Exception as e:
                results.append(TestResult(
                    name=f"Chat Q{i+1}",
                    passed=False,
                    details=f"Exception: {e}",
                    http_status=0
                ))
       
        # Test conversation history - ask a plant-related follow-up
        print("  Testing conversation history...")
        followup_payload = {
            "message": "What treatment did you recommend for early blight?",
            "context": "Tomato___Early_blight",
            "history": conversation_history,
            "diseaseInfo": "Detected disease: Tomato -> Early blight"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=followup_payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                # Check if it references early blight treatment
                remembers = "early blight" in reply.lower() or "fungicide" in reply.lower() or "treatment" in reply.lower()
                self.results.append(TestResult(
                    name="Chat Context Test",
                    passed=remembers,
                    details=f"Remembers first question context: {remembers}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                self.results.append(TestResult("Chat Context Test", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            self.results.append(TestResult("Chat Context Test", False, f"Exception: {e}", 0))
       
        return results
    
    def test_context_priority(self) -> List[TestResult]:
        """Test the context priority logic for disease resolution."""
        results = []
        
        print("\n4. Context Priority Tests...")
        
        # Test 1: Early Blight scan + bacterial spot question
        print("  Test 1: Early Blight scan + 'How do I treat bacterial spot?'")
        payload = {
            "message": "How do I treat bacterial spot on tomatoes?",
            "context": "Tomato___Early_blight",
            "history": [],
            "diseaseInfo": "Detected disease: Tomato -> Early blight"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                context_source = data.get("context_source", "")
                resolved_disease = data.get("resolved_disease", "")
                
                # Should use bacterial spot from question, not early blight from scan
                uses_bacterial = "bacterial" in reply.lower() and "copper" in reply.lower()
                correct_source = context_source == "question"
                correct_disease = "Bacterial_spot" in resolved_disease
                
                passed = uses_bacterial and correct_source and correct_disease
                results.append(TestResult(
                    name="Context Priority: Scan=Early Blight, Question=Bacterial Spot",
                    passed=passed,
                    details=f"Source: {context_source}, Disease: {resolved_disease}, UsesBacterial: {uses_bacterial}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                results.append(TestResult("Context Priority: Scan=Early Blight, Question=Bacterial Spot", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            results.append(TestResult("Context Priority: Scan=Early Blight, Question=Bacterial Spot", False, f"Exception: {e}", 0))
        
        # Test 2: Bacterial Spot scan + viral disease question
        print("  Test 2: Bacterial Spot scan + 'What causes tomato yellow leaf curl virus?'")
        payload = {
            "message": "What causes tomato yellow leaf curl virus?",
            "context": "Tomato___Bacterial_spot",
            "history": [],
            "diseaseInfo": "Detected disease: Tomato -> Bacterial spot"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                context_source = data.get("context_source", "")
                resolved_disease = data.get("resolved_disease", "")
                
                # Should use viral disease from question
                uses_viral = "virus" in reply.lower() or "whitefly" in reply.lower() or "vector" in reply.lower()
                correct_source = context_source == "question"
                correct_disease = "Yellow_Leaf_Curl_Virus" in resolved_disease
                
                passed = uses_viral and correct_source and correct_disease
                results.append(TestResult(
                    name="Context Priority: Scan=Bacterial Spot, Question=Viral",
                    passed=passed,
                    details=f"Source: {context_source}, Disease: {resolved_disease}, UsesViral: {uses_viral}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                results.append(TestResult("Context Priority: Scan=Bacterial Spot, Question=Viral", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            results.append(TestResult("Context Priority: Scan=Bacterial Spot, Question=Viral", False, f"Exception: {e}", 0))
        
        # Test 3: Early Blight scan + "How do I treat this disease?"
        print("  Test 3: Early Blight scan + 'How do I treat this disease?'")
        payload = {
            "message": "How do I treat this disease?",
            "context": "Tomato___Early_blight",
            "history": [],
            "diseaseInfo": "Detected disease: Tomato -> Early blight"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                context_source = data.get("context_source", "")
                resolved_disease = data.get("resolved_disease", "")
                
                # Should use scan context because of "this disease" reference
                uses_scan = "early blight" in reply.lower() or "fungicide" in reply.lower()
                correct_source = context_source == "scan"
                correct_disease = "Early_blight" in resolved_disease
                
                passed = uses_scan and correct_source and correct_disease
                results.append(TestResult(
                    name="Context Priority: Scan=Early Blight, Self-Reference",
                    passed=passed,
                    details=f"Source: {context_source}, Disease: {resolved_disease}, UsesScan: {uses_scan}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                results.append(TestResult("Context Priority: Scan=Early Blight, Self-Reference", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            results.append(TestResult("Context Priority: Scan=Early Blight, Self-Reference", False, f"Exception: {e}", 0))
        
        # Test 4: No scan context + explicit disease question
        print("  Test 4: No scan context + 'What are symptoms of late blight?'")
        payload = {
            "message": "What are the symptoms of late blight on potatoes?",
            "context": "",
            "history": [],
            "diseaseInfo": "No disease detected"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                context_source = data.get("context_source", "")
                resolved_disease = data.get("resolved_disease", "")
                
                # Should use late blight from question
                uses_late_blight = "late blight" in reply.lower() or "water-soaked" in reply.lower()
                correct_source = context_source == "question"
                correct_disease = "Late_blight" in resolved_disease
                
                passed = uses_late_blight and correct_source and correct_disease
                results.append(TestResult(
                    name="Context Priority: No Scan, Question=Late Blight",
                    passed=passed,
                    details=f"Source: {context_source}, Disease: {resolved_disease}, UsesLateBlight: {uses_late_blight}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                results.append(TestResult("Context Priority: No Scan, Question=Late Blight", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            results.append(TestResult("Context Priority: No Scan, Question=Late Blight", False, f"Exception: {e}", 0))
        
        # Test 5: Follow-up question referring to previous disease
        print("  Test 5: Follow-up referring to previous disease in history")
        conversation_history = [
            {"role": "user", "content": "What are the symptoms of early blight on tomatoes?"},
            {"role": "assistant", "content": "Symptoms of Tomato -> Early blight on Tomato: Brown or black spots with target-like concentric rings on lower leaves; Yellowing of surrounding leaf tissue."}
        ]
        payload = {
            "message": "How do I treat it?",
            "context": "Tomato___Late_blight",  # Different scan context
            "history": conversation_history,
            "diseaseInfo": "Detected disease: Tomato -> Late blight"
        }
        try:
            resp = self.session.post(CHAT_ENDPOINT, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                context_source = data.get("context_source", "")
                resolved_disease = data.get("resolved_disease", "")
                
                # Should use early blight from history, not late blight from scan
                uses_early_blight = "early blight" in reply.lower() or "fungicide" in reply.lower()
                correct_source = context_source == "history"
                correct_disease = "Early_blight" in resolved_disease
                
                passed = uses_early_blight and correct_source and correct_disease
                results.append(TestResult(
                    name="Context Priority: History=Early Blight, Scan=Late Blight, Follow-up",
                    passed=passed,
                    details=f"Source: {context_source}, Disease: {resolved_disease}, UsesEarlyBlight: {uses_early_blight}",
                    http_status=resp.status_code,
                    provider=data.get("provider", "unknown"),
                    response_preview=reply[:200]
                ))
            else:
                results.append(TestResult("Context Priority: History=Early Blight, Scan=Late Blight, Follow-up", False, f"HTTP {resp.status_code}", resp.status_code))
        except Exception as e:
            results.append(TestResult("Context Priority: History=Early Blight, Scan=Late Blight, Follow-up", False, f"Exception: {e}", 0))
        
        return results
   
    def test_disease_reports(self) -> List[TestResult]:
        results = []
       
        for disease_test in DISEASE_TESTS:
            print(f"  Testing report for: {disease_test['name']}")
           
            payload = {
                "plant": disease_test["plant"],
                "disease": disease_test["disease"],
                "confidence": disease_test["confidence"]
            }
           
            try:
                resp = self.session.post(REPORT_ENDPOINT, json=payload, timeout=60)
                http_status = resp.status_code
               
                if resp.status_code == 200:
                    data = resp.json()
                    structured_report = data.get("structured_report", {})
                    provider = data.get("provider", "unknown")
                   
                    # Extract report sections
                    report_data = {}
                    for section in REPORT_SECTIONS:
                        report_data[section] = structured_report.get(section, [])
                   
                    # Check if content is disease-specific
                    diagnosis = structured_report.get("diagnosis", "")
                    summary = structured_report.get("summary", "")
                    symptoms = structured_report.get("symptoms", [])
                    causes = structured_report.get("causes", [])
                    immediate_actions = structured_report.get("immediate_actions", [])
                    treatment = structured_report.get("treatment", [])
                    prevention = structured_report.get("prevention", [])
                    monitoring = structured_report.get("monitoring", [])
                    farmer_advice = structured_report.get("farmer_advice", [])
                   
                    # Check that diagnosis contains the disease name (handle various formats)
                    disease_display_arrow = disease_test["disease"].replace("___", " -> ").replace("_", " ")
                    disease_display_emdash = disease_test["disease"].replace("___", " \u2014 ").replace("_", " ")
                    disease_display_space = disease_test["disease"].replace("___", " ").replace("_", " ")
                    # NVIDIA may return formats like "Tomato Bacterial Spot", "Late blight", "Tomato Yellow Leaf Curl Virus (TYLCV)", etc.
                    diagnosis_correct = (disease_display_arrow.lower() in diagnosis.lower() or 
                                         disease_display_emdash.lower() in diagnosis.lower() or
                                         disease_display_space.lower() in diagnosis.lower() or
                                         disease_test["disease"].replace("___", " ").replace("_", " ").split(" ")[-1].lower() in diagnosis.lower())
                   
                    # For healthy plants, check no disease treatment is given
                    is_healthy = "healthy" in disease_test["disease"].lower()
                    if is_healthy:
                        healthy_correct = (
                            "none required" in str(treatment).lower() or 
                            "healthy" in str(summary).lower() or
                            "continue" in str(immediate_actions).lower()
                        )
                        passed = http_status == 200 and diagnosis_correct and healthy_correct
                        details = f"Provider: {provider}, Diagnosis: {diagnosis[:50]}, HealthyCorrect: {healthy_correct}"
                    else:
                        # For diseased plants, check all sections have content
                        has_symptoms = len(symptoms) > 0 and not (len(symptoms) == 1 and "none" in str(symptoms[0]).lower())
                        has_causes = len(causes) > 0
                        has_actions = len(immediate_actions) > 0
                        has_treatment = len(treatment) > 0
                        has_prevention = len(prevention) > 0
                        has_monitoring = len(monitoring) > 0
                       
                        all_sections_present = all([
                            has_symptoms, has_causes, has_actions, 
                            has_treatment, has_prevention, has_monitoring
                        ])
                       
                        passed = http_status == 200 and diagnosis_correct and all_sections_present
                        details = f"Provider: {provider}, Diagnosis: {diagnosis[:50]}, AllSections: {all_sections_present}"
                   
                    results.append(TestResult(
                        name=f"Report: {disease_test['name']}",
                        passed=passed,
                        details=details,
                        http_status=http_status,
                        provider=provider,
                        response_preview=json_module.dumps(structured_report, indent=2)[:500]
                    ))
                else:
                    results.append(TestResult(
                        name=f"Report: {disease_test['name']}",
                        passed=False,
                        details=f"HTTP {http_status}: {resp.text[:200]}",
                        http_status=http_status
                    ))
            except Exception as e:
                results.append(TestResult(
                    name=f"Report: {disease_test['name']}",
                    passed=False,
                    details=f"Exception: {e}",
                    http_status=0
                ))
       
        # Compare reports for uniqueness
        self._compare_reports(results)
       
        return results
   
    def _compare_reports(self, report_results):
        """Compare the 5 disease reports for content uniqueness"""
        if len(report_results) < 2:
            return
       
        # Compare summaries for similarity
        summaries = []
        for r in report_results:
            if r.response_preview:
                try:
                    report = json_module.loads(r.response_preview)
                    summary = report.get("summary", "")
                    summaries.append(summary.lower())
                except:
                    summaries.append("")
        
        for i in range(len(summaries)):
            for j in range(i+1, len(summaries)):
                if summaries[i] and summaries[j]:
                    words_i = set(summaries[i].split())
                    words_j = set(summaries[j].split())
                    if len(words_i) > 0 and len(words_j) > 0:
                        similarity = len(words_i & words_j) / max(len(words_i), len(words_j))
                        if similarity > 0.5:
                            self.results.append(TestResult(
                                name=f"Uniqueness Check: Report {i+1} vs {j+1}",
                                passed=False,
                                details=f"High similarity ({similarity:.1%}) between reports",
                                http_status=0
                            ))
   
    def run_all_tests(self):
        print("=" * 60)
        print("LeafGuard AI - Automated API Test Suite")
        print("=" * 60)
       
        # Start server
        if not self.start_server():
            print("FAILED: Could not start server")
            return False
       
        try:
            # Test 1: Health check
            print("\n1. Health Check...")
            health_result = self.test_health()
            self.results.append(health_result)
            print(f"   {'PASS' if health_result.passed else 'FAIL'}: {health_result.details}")
           
            # Test 2: Chatbot
            print("\n2. Chatbot Tests (10 questions)...")
            chat_results = self.test_chatbot()
            self.results.extend(chat_results)
            for r in chat_results:
                print(f"   {'PASS' if r.passed else 'FAIL'}: {r.name} - {r.details}")
           
            # Test 3: Disease Reports
            print("\n3. Disease Report Tests (5 classes)...")
            report_results = self.test_disease_reports()
            self.results.extend(report_results)
            for r in report_results:
                print(f"   {'PASS' if r.passed else 'FAIL'}: {r.name} - {r.details}")
            
            # Test 4: Context Priority Tests
            context_results = self.test_context_priority()
            self.results.extend(context_results)
            for r in context_results:
                print(f"   {'PASS' if r.passed else 'FAIL'}: {r.name} - {r.details}")
           
        finally:
            self.stop_server()
       
        return self.generate_report()
   
    def generate_report(self):
        print("\n" + "=" * 60)
        print("TEST REPORT")
        print("=" * 60)
       
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
       
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {passed/total*100:.1f}%")
        print()
       
        print("Detailed Results:")
        print("-" * 60)
        for r in self.results:
            status = "[PASS]" if r.passed else "[FAIL]"
            print(f"{status} | {r.name}")
            print(f"       HTTP: {r.http_status} | Provider: {r.provider}")
            print(f"       Details: {r.details}")
            if r.response_preview:
                # Handle Unicode for Windows console
                preview = r.response_preview[:300].replace('\u2192', '->')
                print(f"       Response: {preview}...")
            print()
       
        # Provider summary
        providers = {}
        for r in self.results:
            if r.provider:
                providers[r.provider] = providers.get(r.provider, 0) + 1
       
        if providers:
            print("Provider Usage:")
            for prov, count in providers.items():
                print(f"  {prov}: {count} responses")
       
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "results": [
                {
                    "name": r.name,
                    "passed": r.passed,
                    "details": r.details,
                    "http_status": r.http_status,
                    "provider": r.provider,
                    "response_preview": r.response_preview
                }
                for r in self.results
            ]
        }


def main():
    # Check if we're in the right directory
    if not os.path.exists("D:/Leaf Disease Prediction/LeafDiseaseAPI/app.py"):
        print("Error: Please run from the project root directory")
        sys.exit(1)
   
    tester = APITester()
    report = tester.run_all_tests()
   
    # Save report to file
    with open("test_report.json", "w", encoding="utf-8") as f:
        json_module.dump(report, f, indent=2, ensure_ascii=False)
    print("\nReport saved to test_report.json")
   
    # Exit with appropriate code
    sys.exit(0 if report["failed"] == 0 else 1)


if __name__ == "__main__":
    main()