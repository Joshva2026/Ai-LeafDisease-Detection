import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BookmarkCheck, Maximize2, X } from "lucide-react";
import { mapClassName, getSeverityStyle } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import diseaseData from "../../data/diseaseData";
import "./Diagnosis.css";

function Diagnosis({ prediction, onViewChange, lang }) {
  const [saved, setSaved] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); // URL of image to show in fullscreen

  if (!prediction) {
    return (
      <div className="diag-empty-wrapper slide-section">
        <div className="glass-card diag-empty-card">
          <p>{lang === "ta" ? "பகுப்பாய்வு தரவு எதுவும் இல்லை. முதலில் ஒரு இலையை ஸ்கேன் செய்யவும்." : "No diagnosis data available. Please scan a leaf first."}</p>
          <button className="btn-primary" onClick={() => onViewChange("scan")} style={{ marginTop: "16px" }}>
            {lang === "ta" ? "ஸ்கேன் பக்கத்திற்குச் செல்க" : "Go to Scan Page"}
          </button>
        </div>
      </div>
    );
  }

  const details = mapClassName(prediction.disease);
  const isHealthy = details.isHealthy;
  
  // Circular gauge logic
  const radius = 24;
  const circum = 2 * Math.PI * radius;
  const strokeDashoffset = circum - (circum * prediction.confidence) / 100;

  const handleSave = () => setSaved(true);

  const diseaseInfo = diseaseData[prediction.disease] || {
    description: "Detailed information for this specific crop condition is currently unavailable.",
    symptoms: ["Symptoms vary. Monitor the plant for changes in leaf color or texture."],
    treatment: "Follow general crop care guidelines and monitor for spreading.",
    prevention: "Ensure good airflow between plants and avoid overwatering."
  };

  const treatmentCards = isHealthy ? [
    { title: "Routine Watering", text: "Maintain regular watering according to crop needs." },
    { title: "Weekly Inspections", text: "Regularly check leaf undersides for signs of pests or disease." },
    { title: "Soil Health", text: "Verify that nutrients are balanced and soil drainage is healthy." }
  ] : [
    { title: "Recommended Treatment", text: diseaseInfo.treatment },
    { title: "Monitoring", text: "Monitor the crop closely over the next few days." }
  ];

  return (
    <>
      <div className="diag-page-wrapper slide-section">
        
        {/* Mobile App Header */}
        <div className="m-diag-header mobile-only">
          <button className="m-back-btn" onClick={() => onViewChange("scan")}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="m-header-title">{t("leafDiagnosis", lang)}</h2>
          <div style={{width: 32}}></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="d-diag-header desktop-only">
          <button className="d-back-btn" onClick={() => onViewChange("scan")}>
            <ArrowLeft size={16} /> Back to Scanner
          </button>
          <h2 className="d-header-title">Diagnostic Results</h2>
        </div>

        <div className="diag-layout">
          {/* =======================================
              LEFT COLUMN (Visual Assets)
              ======================================= */}
          <div className="diag-visual-col">
            <div className="diag-images-card glass-card">
              
              <div className="img-compare-container">
                <div className="img-box">
                  <img src={prediction.original_url} alt="Original Leaf" className="diag-img" />
                  <span className="img-badge">Original</span>
                </div>
                
                <div className="img-box heatmap-box">
                  <img src={prediction.gradcam_url || prediction.original_url} alt="AI Heatmap" className="diag-img" />
                  <span className="img-badge ai-badge">AI Focus</span>
                  {/* Mobile tap-to-fullscreen button overlay */}
                  <button className="btn-fullscreen mobile-only" onClick={() => setFullscreenImage(prediction.gradcam_url || prediction.original_url)}>
                    <Maximize2 size={16}/>
                  </button>
                </div>
              </div>

              {prediction.gradcam_url && (
                <div className="heatmap-explainer">
                  <strong>Grad-CAM Activation:</strong> Warm colors (red/yellow) indicate the exact morphological features the neural network used to identify the condition.
                </div>
              )}
            </div>
          </div>

          {/* =======================================
              RIGHT COLUMN (Data & Agronomy)
              ======================================= */}
          <div className="diag-data-col">
            
            {/* Status & Confidence Card */}
            <div className="diag-status-card glass-card">
              <div className="ds-header">
                <div className={`ds-icon ${isHealthy ? 'healthy' : 'danger'}`}>
                  {isHealthy ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div className="ds-title-area">
                  <span className={`ds-badge ${isHealthy ? 'healthy' : 'danger'}`}>
                    {isHealthy ? 'Healthy Leaf' : 'Condition Detected'}
                  </span>
                  <h1 className="ds-disease-name">{details.displayName}</h1>
                </div>
              </div>

              <div className="ds-confidence-row">
                <div className="ds-conf-text">
                  <span className="ds-conf-label">AI Confidence Score</span>
                  <span className="ds-conf-desc">Probability of accurate classification based on visual features.</span>
                </div>
                <div className="ds-gauge">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="5" />
                    <circle
                      cx="30" cy="30" r={radius} fill="transparent"
                      stroke={isHealthy ? "var(--color-healthy)" : "var(--color-danger)"}
                      strokeWidth="5" strokeDasharray={circum} strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" transform="rotate(-90 30 30)"
                      style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                    />
                  </svg>
                  <div className="ds-gauge-val">{Math.round(prediction.confidence)}%</div>
                </div>
              </div>
            </div>

            {/* Disease Information */}
            <div className="diag-info-card glass-card">
              <h3 className="section-title">About Condition</h3>
              <p className="info-p">{diseaseInfo.description}</p>

              {!isHealthy && diseaseInfo.symptoms && (
                <>
                  <h3 className="section-title mt">Common Symptoms</h3>
                  <ul className="symptoms-list">
                    {diseaseInfo.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </>
              )}
            </div>

            {/* Treatment Information */}
            <div className="diag-treatment-card glass-card">
              <h3 className="section-title">Recommended Actions</h3>
              <div className="treatment-steps">
                {treatmentCards.map((card, idx) => (
                  <div key={idx} className="t-step">
                    <div className="t-step-num">{idx + 1}</div>
                    <div className="t-step-content">
                      <h4>{card.title}</h4>
                      <p>{card.text}</p>
                    </div>
                  </div>
                ))}
                
                <div className="t-step prevention-step">
                  <div className="t-step-num"><ShieldCheck size={16}/></div>
                  <div className="t-step-content">
                    <h4>Prevention Strategy</h4>
                    <p>{diseaseInfo.prevention}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="diag-actions">
              <button className="btn-primary flex-1" onClick={() => onViewChange("scan")}>
                <RefreshCw size={18} /> Scan Another
              </button>
              <button className="btn-secondary flex-1" onClick={handleSave} disabled={saved}>
                <BookmarkCheck size={18} color={saved ? "var(--color-healthy)" : "inherit"} />
                {saved ? "Saved to History" : "Save Diagnosis"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* =======================================
          FULLSCREEN HEATMAP VIEWER (Mobile)
          ======================================= */}
      {fullscreenImage && (
        <div className="fullscreen-viewer slide-section">
          <div className="fs-header">
            <span>AI Attention Map</span>
            <button className="fs-close" onClick={() => setFullscreenImage(null)}><X size={24}/></button>
          </div>
          <div className="fs-img-container">
            <img src={fullscreenImage} alt="Fullscreen Heatmap" className="fs-img" />
          </div>
          <div className="fs-footer">
            Pinch to zoom and inspect the localized visual features.
          </div>
        </div>
      )}
    </>
  );
}

export default Diagnosis;
