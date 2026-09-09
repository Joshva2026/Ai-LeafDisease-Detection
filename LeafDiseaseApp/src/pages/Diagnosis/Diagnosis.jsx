import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Layers, Bot, Loader2 } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
import diseaseData from "../../data/diseaseData";
import api from "../../api/api";
import "./Diagnosis.css";

function Diagnosis({ prediction, onViewChange, lang }) {
  const [saved, setSaved] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiStructured, setAiStructured] = useState(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [reportLang, setReportLang] = useState(lang || "ta");

  const fetchAiReport = async (targetLang = reportLang) => {
    setLoadingAiReport(true);
    setAiError(false);
    try {
      const res = await api.post("/api/ai/farmer-report", {
        disease: prediction.disease,
        plant: prediction.plant || details.plantName,
        confidence: prediction.confidence,
        language: targetLang,
        lang: targetLang
      });
      if (res.data && res.data.success) {
        setAiReport(res.data.report_text || res.data.report);
        setAiStructured(res.data.structured_report || null);
      } else {
        setAiError(true);
      }
    } catch (e) {
      console.error("AI Report fetch error:", e);
      setAiError(true);
    } finally {
      setLoadingAiReport(false);
    }
  };

  const handleLangToggle = (newLang) => {
    setReportLang(newLang);
    fetchAiReport(newLang);
  };

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

          {/* OPTIONAL NVIDIA AI FARMER DOCTOR REPORT BLOCK */}
          <div className="report-node-card glass-card nvidia-ai-report-card" style={{ border: "1px solid rgba(52, 211, 153, 0.4)", background: "linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)", padding: "24px" }}>
            <div className="node-head nvidia-head" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "16px" }}>
              <div className="nvidia-title-group" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Bot size={26} style={{ color: "#34d399" }} />
                <div>
                  <h3 style={{ margin: 0, color: "#ffffff", fontSize: "17px", fontWeight: "700" }}>
                    {reportLang === "ta" ? "NVIDIA AI விவசாயி அறிக்கை" : "NVIDIA AI Farmer Advisory Report"}
                  </h3>
                  <span className="nvidia-sub" style={{ fontSize: "12px", color: "#a7f3d0" }}>
                    {reportLang === "ta" ? "அதிநவீன NVIDIA Nemotron LLM விவசாய வழிகாட்டுதல்" : "Deep agronomic report powered by NVIDIA AI"}
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="nvidia-lang-toggle" style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "20px", border: "1px solid rgba(52, 211, 153, 0.2)" }}>
                <button
                  type="button"
                  onClick={() => handleLangToggle("ta")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    border: "none",
                    background: reportLang === "ta" ? "#10b981" : "transparent",
                    color: reportLang === "ta" ? "#ffffff" : "#9ca3af",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => handleLangToggle("en")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    border: "none",
                    background: reportLang === "en" ? "#10b981" : "transparent",
                    color: reportLang === "en" ? "#ffffff" : "#9ca3af",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  English
                </button>
              </div>
            </div>

            <div className="node-body nvidia-body" style={{ marginTop: "16px" }}>
              {/* Generate CTA Button */}
              {!aiReport && !loadingAiReport && !aiError && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p className="ai-placeholder-text" style={{ color: "#9ca3af", fontStyle: "italic", marginBottom: "16px", fontSize: "14px" }}>
                    {reportLang === "ta" 
                      ? "உங்கள் பயிரின் பாதிப்பு, காரணங்கள் மற்றும் தடுப்பு முறைகளுக்கான பிரத்யேக NVIDIA AI அறிக்கையைப் பெற கீழே கிளிக் செய்யவும்." 
                      : "Click below to request a personalized 8-section agronomic report generated by NVIDIA AI."}
                  </p>
                  <button 
                    type="button"
                    className="btn btn-primary btn-ai-generate" 
                    onClick={() => fetchAiReport(reportLang)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "20px" }}
                  >
                    <Sparkles size={16} />
                    <span>{reportLang === "ta" ? "AI விவசாயி அறிக்கையை உருவாக்கு" : "Generate AI Farmer Report"}</span>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loadingAiReport && (
                <div className="ai-loading-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#34d399", padding: "24px 0" }}>
                  <Loader2 className="animate-spin" size={28} />
                  <span style={{ fontWeight: "600" }}>
                    {reportLang === "ta" ? "AI விவசாயி அறிக்கையை உருவாக்குகிறது..." : "Generating AI Farmer Report..."}
                  </span>
                </div>
              )}

              {/* Error State with Retry */}
              {aiError && !loadingAiReport && (
                <div className="ai-error-box" style={{ textAlign: "center", padding: "20px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                  <p style={{ color: "#fca5a5", margin: "0 0 12px 0", fontSize: "14px" }}>
                    {reportLang === "ta" ? "AI விவசாயி அறிக்கை தற்போது கிடைக்கவில்லை." : "AI Farmer Report is currently unavailable."}
                  </p>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-ai-retry" 
                    onClick={() => fetchAiReport(reportLang)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "16px", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    <RefreshCw size={14} />
                    <span>{reportLang === "ta" ? "மீண்டும் முயற்சிக்கவும்" : "Try Again"}</span>
                  </button>
                </div>
              )}

              {/* Success Report Output */}
              {aiReport && !loadingAiReport && (
                <div className="ai-report-content" style={{ color: "#e5e7eb", lineHeight: "1.6", fontSize: "14px" }}>
                  <div className="ai-report-text">
                    {aiReport.split("\n").map((line, idx) => {
                      if (line.startsWith("**") || line.startsWith("🌾") || line.startsWith("#") || line.match(/^[1-8]\./)) {
                        return <h4 key={idx} style={{ color: "#34d399", marginTop: "16px", marginBottom: "8px", fontSize: "15px", fontWeight: "700" }}>{line.replace(/\*\*/g, "").replace(/#/g, "")}</h4>;
                      }
                      if (line.trim() === "") return <br key={idx} />;
                      return <p key={idx} style={{ margin: "4px 0" }}>{line}</p>;
                    })}
                  </div>
                </div>
              )}
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
