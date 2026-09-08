import { useState } from "react";
import { Camera, BrainCircuit, Eye, Sparkles, ShieldCheck, ArrowRight, X } from "lucide-react";
import "./OnboardingModal.css";

function OnboardingModal({ onComplete, lang }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: lang === "ta" ? "படம் எடுத்தல்" : "CAPTURE",
      heading: lang === "ta" ? "தெளிவான இலையின் படம் எடுக்கவும்" : "Take a clear photo of the leaf",
      description: lang === "ta" ? "உங்கள் கேமரா அல்லது கேலரியைப் பயன்படுத்தி இலையின் சேதமடைந்த பகுதியைப் படம் பிடிக்கவும்." : "Capture the affected area of your plant's leaf using your camera or gallery upload.",
      icon: Camera,
      badge: "Step 1 of 5"
    },
    {
      number: "02",
      title: lang === "ta" ? "பகுப்பாய்வு" : "ANALYZE",
      heading: lang === "ta" ? "AI நரம்பியல் வலைப்பின்னல் ஆய்வு" : "Our trained AI model examines the image",
      description: lang === "ta" ? "MobileNetV2 மாதிரி ஆயிரக்கணக்கான பயிர் மாதிரித் தரவுகளுடன் உங்கள் இலையை ஒப்பிடுகிறது." : "MobileNetV2 convolutional neural networks analyze subtle cellular and morphological patterns.",
      icon: BrainCircuit,
      badge: "Step 2 of 5"
    },
    {
      number: "03",
      title: lang === "ta" ? "காட்சிப்படுத்தல்" : "VISUALIZE",
      heading: lang === "ta" ? "Grad-CAM வெப்பப் படம்" : "AI heatmap highlights visual evidence",
      description: lang === "ta" ? "கண்டறிதலுக்குப் பயன்படுத்தப்பட்ட முக்கிய பகுதிகளை Grad-CAM வெப்பப் படம் தெளிவாகக் காட்டுகிறது." : "Grad-CAM technology highlights the exact visual regions that triggered the neural prediction.",
      icon: Eye,
      badge: "Step 3 of 5"
    },
    {
      number: "04",
      title: lang === "ta" ? "புரிந்துகொள்ளுதல்" : "UNDERSTAND",
      heading: lang === "ta" ? "நோய் மற்றும் நம்பிக்கை மதிப்பீடு" : "Review disease, confidence & symptoms",
      description: lang === "ta" ? "நோயின் பெயர், நம்பிக்கை சதவீதம் மற்றும் அறிகுறிகளை விரிவாக அறிந்து கொள்ளுங்கள்." : "Get an immediate condition analysis with percentage confidence and diagnostic breakdown.",
      icon: Sparkles,
      badge: "Step 4 of 5"
    },
    {
      number: "05",
      title: lang === "ta" ? "செயல்படுதல்" : "ACT",
      heading: lang === "ta" ? "பயிர் பராமரிப்பு மற்றும் தடுப்பு வழிமுறைகள்" : "Use treatment and prevention guidance",
      description: lang === "ta" ? "பாதிக்கப்பட்ட தாவரத்தைக் குணப்படுத்தவும் நோய் பரவுவதைத் தடுக்கவும் நடைமுறை ஆலோசனைகளைப் பெறுங்கள்." : "Receive actionable agronomic treatment steps, organic care tips, and future prevention advice.",
      icon: ShieldCheck,
      badge: "Step 5 of 5"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const activeStepObj = steps[currentStep];
  const IconComponent = activeStepObj.icon;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card glass-card">
        <button className="onboarding-skip-btn" onClick={onComplete} title="Skip introduction">
          <span>{lang === "ta" ? "தவிர்க்கவும்" : "Skip"}</span>
          <X size={16} />
        </button>

        <div className="onboarding-step-badge">
          {activeStepObj.badge}
        </div>

        <div className="onboarding-icon-wrapper">
          <div className="onboarding-icon-circle">
            <IconComponent size={32} />
          </div>
          <span className="onboarding-num">{activeStepObj.number}</span>
        </div>

        <div className="onboarding-content">
          <span className="onboarding-category">{activeStepObj.title}</span>
          <h3 className="onboarding-heading">{activeStepObj.heading}</h3>
          <p className="onboarding-description">{activeStepObj.description}</p>
        </div>

        {/* Progress indicator dots */}
        <div className="onboarding-dots">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`onboarding-dot ${idx === currentStep ? "active" : ""}`}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary onboarding-next-btn" onClick={handleNext}>
            <span>
              {currentStep === steps.length - 1
                ? (lang === "ta" ? "தொடங்கவும்" : "Begin Diagnosis")
                : (lang === "ta" ? "அடுத்தது" : "Next Step")}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
