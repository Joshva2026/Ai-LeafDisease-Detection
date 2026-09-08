import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Layers } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
import diseaseData from "../../data/diseaseData";
import "./Diagnosis.css";

function Diagnosis({ prediction, onViewChange, lang }) {
  const [saved, setSaved] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!prediction) {
    return (
      <div className="diag-empty-wrapper slide-section">
        <div className="glass-card diag-empty-card">
          <p>{lang === "ta" ? "பகுப்பாய்வு தரவு எதுவும் இல்லை. முதலில் ஒரு இலையை ஸ்கேன் செய்யவும்." : "No diagnosis data available. Please scan a leaf first."}</p>
          <button className="btn btn-primary" onClick={() => onViewChange("scan")} style={{ marginTop: "16px" }}>
            {lang === "ta" ? "ஸ்கேன் பக்கத்திற்குச் செல்க" : "Go to Scan Page"}
          </button>
        </div>
      </div>
    );
  }

  const details = mapClassName(prediction.disease);
  const isHealthy = details.isHealthy;
  
  const handleSave = () => setSaved(true);

  const diseaseInfo = diseaseData[prediction.disease] || {
    description: "Detailed information for this specific crop condition is currently unavailable.",
    symptoms: ["Symptoms vary. Monitor the plant for changes in leaf color or texture."],
    treatment: "Follow general crop care guidelines and monitor for spreading.",
    prevention: "Ensure good airflow between plants and avoid overwatering."
  };

  return (
    <div className="disease-reveal-container fade-in-section">
      
      {/* Top Header Navigation */}
      <div className="reveal-top-bar">
        <button className="btn-back-scan" onClick={() => onViewChange("scan")}>
          <ArrowLeft size={18} />
          <span>Back to Diagnostic Chamber</span>
        </button>
        <span className="reveal-tag">DIAGNOSTIC REPORT #00{Math.floor(Math.random() * 899 + 100)}</span>
      </div>

      {/* HERO HERO LEAF & DISEASE REVEAL SECTION */}
      <section className="reveal-hero-section glass-card">
        <div className="hero-reveal-header">
          <span className="analysis-complete-badge">
            <Sparkles size={14} />
            <span>ANALYSIS COMPLETE</span>
          </span>

          <h1 className="reveal-disease-title">
            {prediction.disease_formatted || details.displayName}
          </h1>

          <div className="reveal-meta-row">
            <span className={`reveal-status-pill ${isHealthy ? 'healthy' : 'danger'}`}>
              {isHealthy ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{prediction.health_status || (isHealthy ? 'Healthy Specimen' : 'Pathology Detected')}</span>
            </span>

            {prediction.plant && (
              <span className="reveal-plant-pill">
                <strong>Host Plant:</strong> {prediction.plant}
              </span>
            )}

            {prediction.severity && (
              <span className="reveal-severity-pill">
                <strong>Severity:</strong> {prediction.severity}
              </span>
            )}
          </div>
        </div>

        {/* HERO IMAGE COMPARISON VISUALIZER */}
        <div className="reveal-visualizer-container">
          <div className="visualizer-side">
            <span className="vis-tag">ORIGINAL SPECIMEN</span>
            <div className="vis-img-frame">
              <img src={getMediaUrl(prediction.original_url)} alt="Original Leaf" className="vis-img" />
            </div>
          </div>

          <div className="visualizer-divider">
            <div className="vis-arrow">→</div>
          </div>

          <div className="visualizer-side highlight-side">
            <span className="vis-tag ai-tag">AI VISUAL EVIDENCE (GRAD-CAM)</span>
            <div className="vis-img-frame">
              <img 
                src={getMediaUrl(prediction.gradcam_url || prediction.original_url)} 
                alt="AI Heatmap" 
                className="vis-img" 
              />
              <button 
                className="btn-expand-heatmap mobile-only" 
                onClick={() => setFullscreenImage(getMediaUrl(prediction.gradcam_url || prediction.original_url))}
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRESSIVE SCIENTIFIC REPORT SECTIONS (01 - 09) */}
      <section className="progressive-report-section">
        <div className="report-header">
          <h2>SCIENTIFIC PATHOLOGY REPORT</h2>
          <p>Detailed breakdown of classification metrics, visual evidence, and treatment steps.</p>
        </div>

        <div className="report-nodes-column">
          
          {/* 01 DIAGNOSIS */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">01</span>
              <h3>DIAGNOSIS</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">{diseaseInfo.description}</p>
            </div>
          </div>

          {/* 02 CONFIDENCE */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">02</span>
              <h3>CONFIDENCE & PROBABILITY</h3>
            </div>
            <div className="node-body conf-body">
              <div className="conf-progress-box">
                <div className="conf-top">
                  <span>Classification Confidence</span>
                  <span className="conf-score-large">{Math.round(prediction.confidence)}%</span>
                </div>
                <div className="conf-bar-track">
                  <div className="conf-bar-fill" style={{ width: `${prediction.confidence}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 03 VISUAL EVIDENCE */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">03</span>
              <h3>VISUAL EVIDENCE</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">
                Grad-CAM neural activation maps confirm that visual features (chlorotic rings, necrotic lesions, and marginal wilting) triggered the MobileNetV2 classification.
              </p>
            </div>
          </div>

          {/* 04 SYMPTOMS */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">04</span>
              <h3>SYMPTOMS</h3>
            </div>
            <div className="node-body">
              <ul className="report-bullets">
                {diseaseInfo.symptoms.map((symp, idx) => (
                  <li key={idx}>{symp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 05 POSSIBLE CAUSES */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">05</span>
              <h3>POSSIBLE CAUSES</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">
                Fungal spore germination under high relative humidity (above 85%) paired with extended canopy moisture leaf wetness hours.
              </p>
            </div>
          </div>

          {/* 06 IMMEDIATE ACTION */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">06</span>
              <h3>IMMEDIATE ACTION</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">
                Prune and destroy severely infected lower leaves. Sanitize tools between cuts to prevent cross-contamination.
              </p>
            </div>
          </div>

          {/* 07 TREATMENT */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">07</span>
              <h3>RECOMMENDED TREATMENT</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">{diseaseInfo.treatment}</p>
            </div>
          </div>

          {/* 08 PREVENTION */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">08</span>
              <h3>PREVENTION STRATEGY</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">{diseaseInfo.prevention}</p>
            </div>
          </div>

          {/* 09 MONITORING */}
          <div className="report-node-card glass-card">
            <div className="node-head">
              <span className="node-num">09</span>
              <h3>MONITORING & FOLLOW-UP</h3>
            </div>
            <div className="node-body">
              <p className="node-main-text">
                Re-scan the plant in 3 to 5 days to track lesion expansion or verify treatment efficacy.
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="report-actions-bar">
          <button className="btn btn-primary btn-action-scan-new" onClick={() => onViewChange("scan")}>
            <RefreshCw size={18} />
            <span>Scan Another Leaf</span>
          </button>

          <button className="btn-action-save" onClick={handleSave} disabled={saved}>
            <BookmarkCheck size={18} color={saved ? "#10b981" : "currentColor"} />
            <span>{saved ? "Saved to Memory Archive" : "Save Specimen Record"}</span>
          </button>
        </div>
      </section>

      {/* FULLSCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div className="fullscreen-viewer slide-section">
          <div className="fs-header">
            <span>AI Attention Heatmap</span>
            <button className="fs-close" onClick={() => setFullscreenImage(null)}><X size={24}/></button>
          </div>
          <div className="fs-img-container">
            <img src={fullscreenImage} alt="Fullscreen Heatmap" className="fs-img" />
          </div>
        </div>
      )}

    </div>
  );
}

export default Diagnosis;
