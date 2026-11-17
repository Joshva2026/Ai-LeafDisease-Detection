import { useState } from "react";
import { Camera, BrainCircuit, Eye, Sparkles, ShieldCheck, ArrowRight, X } from "lucide-react";
import { t } from "../../data/translations";
import "./OnboardingModal.css";

function OnboardingModal({ onComplete, lang }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: t("takePhoto", lang),
      heading: t("takePhotoDesc", lang),
      description: t("tipVisible", lang) + " " + t("tipLighting", lang),
      icon: Camera,
      badge: "Step 1 of 5"
    },
    {
      number: "02",
      title: t("aiCheck", lang),
      heading: t("aiCheckDesc", lang),
      description: "MobileNetV2 மாதிரி உங்கள் இலையை ஆயிரக்கணக்கான பயிர் தரவுகளுடன் ஒப்பிடுகிறது.",
      icon: BrainCircuit,
      badge: "Step 2 of 5"
    },
    {
      number: "03",
      title: t("attentionMapHome", lang),
      heading: t("attentionMapHomeDesc", lang),
      description: "Grad-CAM தொழில்நுட்பம் நோய் இருப்பிடத்தைக் காண்பிக்கிறது.",
      icon: Eye,
      badge: "Step 3 of 5"
    },
    {
      number: "04",
      title: t("farmerReportHome", lang),
      heading: t("farmerReportHomeDesc", lang),
      description: "நோயின் பெயர், நம்பிக்கை சதவீதம் மற்றும் அறிகுறிகளை அறிந்து கொள்ளுங்கள்.",
      icon: Sparkles,
      badge: "Step 4 of 5"
    },
    {
      number: "05",
      title: "Act",
      heading: t("immediateActions", lang),
      description: "பாதிக்கப்பட்ட தாவரத்தைக் குணப்படுத்தவும் நோய் பரவுவதைத் தடுக்கவும் நடைமுறை ஆலோசனைகளைப் பெறுங்கள்.",
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
      <div className="onboarding-card glass-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <button className="onboarding-skip-btn" onClick={onComplete} title={lang === "ta" ? "தவிர்க்கவும்" : "Skip introduction"}>
          <span>{lang === "ta" ? "தவிர்க்கவும்" : "Skip"}</span>
          <X size={18} />
        </button>

        <div className="onboarding-step-badge">
          {activeStepObj.badge}
        </div>

        <div className="onboarding-icon-wrapper">
          <div className="onboarding-icon-circle">
            <IconComponent size={36} />
          </div>
          <span className="onboarding-num">{activeStepObj.number}</span>
        </div>

        <div className="onboarding-content">
          <span className="onboarding-category">{activeStepObj.title}</span>
          <h3 id="onboarding-title" className="onboarding-heading">{activeStepObj.heading}</h3>
          <p className="onboarding-description">{activeStepObj.description}</p>
        </div>

        {/* Progress indicator dots */}
        <div className="onboarding-dots">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`onboarding-dot ${idx === currentStep ? "active" : ""}`}
              onClick={() => setCurrentStep(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCurrentStep(idx); }}
              aria-label={`Step ${idx + 1}`}
              aria-current={idx === currentStep ? "step" : undefined}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-hero onboarding-next-btn" onClick={handleNext} style={{ width: "100%" }}>
            <span>
              {currentStep === steps.length - 1
                ? (lang === "ta" ? "தொடங்கவும்" : "Begin Diagnosis")
                : (lang === "ta" ? "அடுத்து" : "Next")}
            </span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;