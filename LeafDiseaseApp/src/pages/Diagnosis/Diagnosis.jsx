import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BookmarkCheck } from "lucide-react";
import { mapClassName, getSeverityStyle } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import diseaseData from "../../data/diseaseData";
import { useState } from "react";
import "./Diagnosis.css";

function Diagnosis({ prediction, onViewChange, lang }) {
  const [saved, setSaved] = useState(false);

  if (!prediction) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p>{lang === "ta" ? "பகுப்பாய்வு தரவு எதுவும் இல்லை. முதலில் ஒரு இலையை ஸ்கேன் செய்யவும்." : "No diagnosis data available. Please scan a leaf first."}</p>
        <button className="btn btn-primary" onClick={() => onViewChange("scan")} style={{ marginTop: "12px" }}>
          {lang === "ta" ? "ஸ்கேன் பக்கத்திற்குச் செல்க" : "Go to Scan Page"}
        </button>
      </div>
    );
  }

  const details = mapClassName(prediction.disease);
  const isHealthy = details.isHealthy;
  const severityStyle = getSeverityStyle(details.severity);

  // Circular gauge config: r = 20 -> circum = 2 * PI * r = 125.6
  const radius = 20;
  const circum = 2 * Math.PI * radius;
  const strokeDashoffset = circum - (circum * prediction.confidence) / 100;

  const handleSave = () => {
    setSaved(true);
  };

  const diseaseInfo = diseaseData[prediction.disease] || {
    description: lang === "ta" ? "இந்த பயிரின் நிலைக்கான விரிவான தகவல் தற்போது இல்லை." : "Detailed information for this specific crop condition is currently unavailable.",
    symptoms: lang === "ta" ? ["தெரியாத அறிகுறிகள்"] : ["Symptoms vary. Please monitor the plant for changes in leaf color or texture."],
    treatment: lang === "ta" ? "பொதுவான பயிர் பராமரிப்பு வழிகாட்டுதல்களைப் பின்பற்றவும்." : "Follow general crop care guidelines and monitor for spreading.",
    prevention: lang === "ta" ? "பயிர்களுக்கு இடையே நல்ல காற்று ஓட்டத்தை உறுதி செய்யவும்." : "Ensure good airflow between plants and avoid overwatering."
  };

  const getTreatmentCards = () => {
    if (isHealthy) {
      return [
        { 
          title: lang === "ta" ? "வழக்கமான நீர்ப்பாசனம்" : "Routine Watering", 
          text: lang === "ta" ? "பயிரின் தேவைகளுக்கு ஏற்ப வழக்கமாக நீர்ப்பாசனம் செய்யுங்கள்." : "Maintain regular watering according to crop needs." 
        },
        { 
          title: lang === "ta" ? "வாராந்திர ஆய்வுகள்" : "Weekly Inspections", 
          text: lang === "ta" ? "பூச்சிகள் அல்லது நோய் அறிகுறிகள் ஏதேனும் உள்ளதா என்று வாரந்தோறும் இலைகளைச் சரிபார்க்கவும்." : "Regularly check leaf undersides for signs of pests or disease." 
        },
        { 
          title: lang === "ta" ? "மண் வளம்" : "Soil Health", 
          text: lang === "ta" ? "மண்ணின் ஊட்டச்சத்துக்கள் சமநிலையில் இருப்பதையும் வடிகால் வசதியையும் உறுதிப்படுத்தவும்." : "Verify that nutrients are balanced and soil drainage is healthy." 
        }
      ];
    }

    return [
      { 
        title: lang === "ta" ? "சிகிச்சை மற்றும் பரிந்துரை" : "Recommended Treatment", 
        text: diseaseInfo.treatment 
      },
      { 
        title: lang === "ta" ? "கண்காணிப்பு" : "Monitoring", 
        text: lang === "ta" ? "மேலும் பரவாமல் இருக்க அடுத்த சில நாட்களுக்கு பயிர்களைத் தொடர்ந்து கண்காணிக்கவும்." : "Monitor the crop closely over the next few days to ensure the condition does not spread." 
      }
    ];
  };

  const treatmentCards = getTreatmentCards();

  return (
    <div className="page-wrapper slide-section">
      {/* Header (visible on mobile only) */}
      <div className="diag-header">
        <button className="back-btn" onClick={() => onViewChange("scan")} title="Back to Scan">
          <ArrowLeft size={20} />
        </button>
        <h2 className="diag-title">{t("leafDiagnosis", lang)}</h2>
      </div>

      <div className="diag-desktop-grid">
        {/* Left Column: Visual Assets */}
        <div className="diag-left-col fade-in-section">
          {/* Heatmap / Image Card */}
          <div className="diag-image-card">
            <div className="diag-images-grid">
              <div className="diag-img-box">
                <img 
                  src={prediction.original_url} 
                  alt="Original scan" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=300";
                  }}
                />
                <div className="diag-img-label">{t("originalImage", lang)}</div>
              </div>
              <div className="diag-img-box">
                <img 
                  src={prediction.gradcam_url || prediction.original_url} 
                  alt="Gradcam heatmap" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=300";
                  }}
                />
                <div className="diag-img-label">
                  {prediction.gradcam_url ? t("attentionMap", lang) : (lang === "ta" ? "வரைபடம் இல்லை" : "No heatmap")}
                </div>
              </div>
            </div>
            {prediction.gradcam_url && (
              <div style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", borderTop: "var(--border-style)", textAlign: "center", lineHeight: "1.5" }}>
                {t("attentionExplanation", lang)}
              </div>
            )}
          </div>

          {/* Predictions Chart */}
          {prediction.top_predictions && prediction.top_predictions.length > 1 && (
            <div className="bar-chart-card">
              <h4 className="chart-header">{t("topPredictions", lang)}</h4>
              {prediction.top_predictions.map((p, idx) => {
                const pDetails = mapClassName(p.disease);
                return (
                  <div key={idx} className="chart-row">
                    <div className="chart-label-row">
                      <span>{pDetails.displayName}</span>
                      <span style={{ fontWeight: "700" }}>{Math.round(p.confidence)}%</span>
                    </div>
                    <div className="chart-bar-container">
                      <div 
                        className={`chart-bar-fill ${idx === 0 ? "active" : ""}`} 
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Agronomic Advice */}
        <div className="diag-right-col fade-in-section">
          {/* Health Status Card */}
          <div className="status-card">
            <div className={`status-icon-wrap ${isHealthy ? "healthy" : "diseased"}`}>
              {isHealthy ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            
            <div className="status-info">
              <span className={`status-badge ${isHealthy ? "healthy" : "diseased"}`}>
                {isHealthy ? (lang === "ta" ? "ஆரோக்கியமான இலை" : "Healthy Leaf") : (lang === "ta" ? "பாதிப்பு கண்டறியப்பட்டுள்ளது" : "Condition Detected")}
              </span>
              <span className="status-name">{details.displayName}</span>
            </div>

            {/* Confidence Gauge */}
            <div className="confidence-gauge-box">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r={radius} fill="transparent" stroke="rgba(110, 142, 126, 0.08)" strokeWidth="4" />
                <circle
                  cx="25"
                  cy="25"
                  r={radius}
                  fill="transparent"
                  stroke={isHealthy ? "var(--color-healthy)" : "var(--color-danger)"}
                  strokeWidth="4"
                  strokeDasharray={circum}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                  style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div className="confidence-gauge-text">
                {Math.round(prediction.confidence)}%
              </div>
            </div>
          </div>

          {/* About description */}
          <h3 className="info-section-title">{t("aboutCondition", lang)}</h3>
          <div className="info-desc-card">
            {diseaseInfo.description}
          </div>

          {/* Symptoms List */}
          {!isHealthy && diseaseInfo.symptoms && (
            <>
              <h3 className="info-section-title">{t("commonSymptoms", lang)}</h3>
              <div className="symptoms-list">
                {diseaseInfo.symptoms.map((symptom, i) => (
                  <div key={i} className="symptom-item">
                    <div className="symptom-bullet"></div>
                    <div>{symptom}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Recommended Actions */}
          <h3 className="info-section-title">{t("recommendedActions", lang)}</h3>
          <div className="treatment-steps">
            {treatmentCards.map((card, idx) => (
              <div key={idx} className="treatment-card">
                <div className="treatment-num">{idx + 1}</div>
                <div className="treatment-info">
                  <span className="treatment-title">{card.title}</span>
                  <p className="treatment-text">{card.text}</p>
                </div>
              </div>
            ))}
            <div className="treatment-card">
              <div className="treatment-num">
                <ShieldCheck size={14} color="var(--primary-dark)" />
              </div>
              <div className="treatment-info">
                <span className="treatment-title">{t("preventionTips", lang)}</span>
                <p className="treatment-text">{diseaseInfo.prevention}</p>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="action-btn-row">
            <button className="btn btn-primary" onClick={() => onViewChange("scan")}>
              <RefreshCw size={16} />
              {t("scanAnother", lang)}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleSave}
              disabled={saved}
              style={{ gap: "6px" }}
            >
              <BookmarkCheck size={16} color={saved ? "var(--color-healthy)" : "inherit"} />
              {saved ? t("savedToHistory", lang) : t("saveDiagnosis", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diagnosis;
