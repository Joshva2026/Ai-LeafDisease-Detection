import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Layers, Bot, Loader2, Sprout } from "lucide-react";
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

  const isTa = lang === "ta";

  useEffect(() => {
    if (prediction && !aiReport && !loadingAiReport) {
      fetchAiReport(lang);
    }
  }, [prediction, lang]);

  const fetchAiReport = async (targetLang) => {
    setLoadingAiReport(true);
    setAiError(false);
    const details = mapClassName(prediction.disease || "Unknown");
    
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
          <p>{isTa ? "பகுப்பாய்வு தரவு எதுவும் இல்லை. முதலில் ஒரு இலையை ஸ்கேன் செய்யவும்." : "No diagnosis data available. Please scan a leaf first."}</p>
          <button className="btn btn-primary" onClick={() => onViewChange("scan")} style={{ marginTop: "16px" }}>
            {isTa ? "ஸ்கேன் பக்கத்திற்குச் செல்க" : "Go to Scan Page"}
          </button>
        </div>
      </div>
    );
  }

  const details = mapClassName(prediction.disease || "Unknown");
  const isHealthy = details.isHealthy;
  
  const handleSave = () => setSaved(true);

  return (
    <div className="disease-reveal-container fade-in-section">
      
      {/* Top Header Navigation */}
      <div className="reveal-top-bar">
        <button className="btn-back-scan" onClick={() => onViewChange("scan")}>
          <ArrowLeft size={18} />
          <span>{isTa ? "மீண்டும் பரிசோதிக்க" : "Back to Scan"}</span>
        </button>
        <span className="reveal-tag">
          <Sprout size={14} />
          {isTa ? "பயிர் மருத்துவ அறிக்கை" : "PLANT DOCTOR REPORT"}
        </span>
      </div>

      {/* HERO REVEAL SECTION */}
      <section className="reveal-hero-section glass-card">
        <div className="hero-reveal-header">
          <h1 className="reveal-disease-title">
            {prediction.disease_formatted || details.displayName}
          </h1>

          <div className="reveal-meta-row">
            <span className={`reveal-status-pill ${isHealthy ? 'healthy' : 'danger'}`}>
              {isHealthy ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{isHealthy ? (isTa ? "ஆரோக்கியமானது" : "Healthy") : (isTa ? "நோய் பாதிப்பு" : "Disease Detected")}</span>
            </span>
            <span className="reveal-confidence-pill">
              <Sparkles size={16} color="#fbbf24" />
              <span>{Math.round(prediction.confidence)}% {isTa ? "உறுதி" : "Confidence"}</span>
            </span>
            <span className="reveal-crop-pill">
              {details.plantName}
            </span>
          </div>
        </div>

        <div className="reveal-visual-grid">
          {/* ORIGINAL IMAGE */}
          <div className="reveal-image-box">
            <div className="reveal-image-header">
              <Eye size={16} />
              <span>{isTa ? "பதிவேற்றிய படம்" : "Original Image"}</span>
            </div>
            <div className="reveal-img-wrapper" onClick={() => setFullscreenImage(getMediaUrl(prediction.original_url))}>
              <img src={getMediaUrl(prediction.original_url)} alt="Original Leaf" />
              <button className="expand-btn"><Maximize2 size={16} /></button>
            </div>
          </div>

          {/* GRAD-CAM HEATMAP */}
          <div className="reveal-image-box heatmap-box">
            <div className="reveal-image-header">
              <Activity size={16} color="#fbbf24" />
              <span>{isTa ? "கவன வரைபடம் (Grad-CAM)" : "Attention Map (Grad-CAM)"}</span>
            </div>
            <div className="reveal-img-wrapper" onClick={() => prediction.gradcam_url && setFullscreenImage(getMediaUrl(prediction.gradcam_url))}>
              {prediction.gradcam_url ? (
                <>
                  <img src={getMediaUrl(prediction.gradcam_url)} alt="AI Heatmap" />
                  <button className="expand-btn"><Maximize2 size={16} /></button>
                </>
              ) : (
                <div className="no-heatmap">
                  <span>{isTa ? "வரைபடம் இல்லை" : "Map Unavailable"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FARMER AI REPORT SECTION */}
      <section className="farmer-report-section fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="report-header-banner">
          <div className="report-title">
            <Bot size={24} color="#34d399" />
            <h2>{isTa ? "NVIDIA AI விவசாயி அறிக்கை" : "NVIDIA AI Farmer Advisory"}</h2>
          </div>
          <div className="report-lang-toggle">
            <button 
              className={reportLang === "ta" ? "active" : ""} 
              onClick={() => handleLangToggle("ta")}
              disabled={loadingAiReport}
            >தமிழ்</button>
            <button 
              className={reportLang === "en" ? "active" : ""} 
              onClick={() => handleLangToggle("en")}
              disabled={loadingAiReport}
            >English</button>
          </div>
        </div>

        <div className="report-content-body glass-card">
          {loadingAiReport ? (
            <div className="ai-report-loading">
              <Loader2 size={32} className="spin-anim" color="#34d399" />
              <p>{isTa ? "AI மருத்துவ அறிக்கையைத் தயார் செய்கிறது..." : "NVIDIA AI is generating your agronomic report..."}</p>
            </div>
          ) : aiError ? (
            <div className="ai-report-error">
              <AlertTriangle size={32} color="#fca5a5" />
              <p>{isTa ? "NVIDIA AI தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." : "AI Advisor is currently unavailable. Please try again."}</p>
              <button className="btn btn-secondary" onClick={() => fetchAiReport(reportLang)}>
                <RefreshCw size={16} />
                <span>{isTa ? "மீண்டும் முயற்சிக்க" : "Retry"}</span>
              </button>
            </div>
          ) : aiStructured ? (
            <div className="structured-report">
              {aiStructured.diagnosis && (
                <div className="report-block highlight-block">
                  <h3>{isTa ? "கண்டறிதல்" : "Diagnosis"}</h3>
                  <p>{aiStructured.diagnosis}</p>
                </div>
              )}
              
              {aiStructured.summary && (
                <div className="report-block">
                  <h3>{isTa ? "சுருக்கம்" : "Summary"}</h3>
                  <p>{aiStructured.summary}</p>
                </div>
              )}

              {aiStructured.immediate_actions && aiStructured.immediate_actions.length > 0 && (
                <div className="report-block action-block">
                  <h3><AlertTriangle size={18} color="#f87171" /> {isTa ? "உடனடி நடவடிக்கைகள்" : "Immediate Actions"}</h3>
                  <ul>
                    {aiStructured.immediate_actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              )}

              <div className="report-grid-2">
                {aiStructured.symptoms && aiStructured.symptoms.length > 0 && (
                  <div className="report-block">
                    <h3>{isTa ? "அறிகுறிகள்" : "Symptoms"}</h3>
                    <ul>{aiStructured.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {aiStructured.causes && aiStructured.causes.length > 0 && (
                  <div className="report-block">
                    <h3>{isTa ? "காரணங்கள்" : "Causes"}</h3>
                    <ul>{aiStructured.causes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                )}
              </div>

              {aiStructured.treatment && aiStructured.treatment.length > 0 && (
                <div className="report-block treatment-block">
                  <h3>{isTa ? "சிகிச்சை / மேலாண்மை" : "Treatment & Management"}</h3>
                  <ul>
                    {aiStructured.treatment.map((t_item, i) => <li key={i}>{t_item}</li>)}
                  </ul>
                </div>
              )}
              
              {aiStructured.prevention && aiStructured.prevention.length > 0 && (
                <div className="report-block prevention-block">
                  <h3><ShieldCheck size={18} color="#34d399" /> {isTa ? "தடுப்பு முறைகள்" : "Prevention"}</h3>
                  <ul>
                    {aiStructured.prevention.map((p_item, i) => <li key={i}>{p_item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : aiReport ? (
            <div className="unstructured-report">
              <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>') }} />
            </div>
          ) : null}
        </div>
      </section>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="reveal-bottom-actions glass-panel">
        <button className="btn btn-secondary action-btn" onClick={() => onViewChange("scan")}>
          <Camera size={18} />
          <span>{isTa ? "மற்றொரு இலையை சோதிக்க" : "Scan Another Leaf"}</span>
        </button>
        <button 
          className={`btn action-btn ${saved ? 'btn-success' : 'btn-primary'}`} 
          onClick={handleSave} 
          disabled={saved}
        >
          {saved ? <BookmarkCheck size={18} /> : <BookmarkCheck size={18} />}
          <span>{saved ? (isTa ? "வரலாற்றில் சேமிக்கப்பட்டது" : "Saved to History") : (isTa ? "முடிவைச் சேமிக்கவும்" : "Save Diagnosis")}</span>
        </button>
      </div>

      {fullscreenImage && (
        <div className="fullscreen-image-modal" onClick={() => setFullscreenImage(null)}>
          <button className="close-fs-btn" onClick={() => setFullscreenImage(null)}>
            <X size={24} />
          </button>
          <img src={fullscreenImage} alt="Fullscreen View" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default Diagnosis;
