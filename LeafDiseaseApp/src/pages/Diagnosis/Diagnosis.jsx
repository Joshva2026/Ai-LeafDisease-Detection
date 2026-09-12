import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Bot, Loader2, Sprout, ShieldCheck, Camera, ImageOff } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
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

  const [origImgError, setOrigImgError] = useState(false);
  const [camImgError, setCamImgError] = useState(false);

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
          <p>{t("noDiagnosisData", lang)}</p>
          <button className="btn btn-primary" onClick={() => onViewChange("scan")} style={{ marginTop: "16px" }}>
            {t("goToScanPage", lang)}
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
          <span>{t("backToScan", lang)}</span>
        </button>
        <span className="reveal-tag">
          <Sprout size={14} />
          {t("plantDoctorReport", lang)}
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
              <span>{isHealthy ? t("healthy", lang) : t("diseaseDetected", lang)}</span>
            </span>
            <span className="reveal-confidence-pill">
              <Sparkles size={16} color="#fbbf24" />
              <span>{Math.round(prediction.confidence)}% {t("confidence", lang)}</span>
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
              <span>{t("originalImage", lang)}</span>
            </div>
            <div className="reveal-img-wrapper" onClick={() => !origImgError && setFullscreenImage(getMediaUrl(prediction.original_url))}>
              {origImgError ? (
                <div className="no-heatmap error-state">
                  <ImageOff size={24} color="#f87171" />
                  <span>{t("imageLoadFailed", lang)}</span>
                </div>
              ) : (
                <>
                  <img 
                    src={getMediaUrl(prediction.original_url)} 
                    alt="Original Leaf" 
                    onError={() => setOrigImgError(true)}
                  />
                  <button className="expand-btn"><Maximize2 size={16} /></button>
                </>
              )}
            </div>
          </div>

          {/* GRAD-CAM HEATMAP */}
          <div className="reveal-image-box heatmap-box">
            <div className="reveal-image-header">
              <Activity size={16} color="#fbbf24" />
              <span>{t("attentionMap", lang)}</span>
            </div>
            <div className="reveal-img-wrapper" onClick={() => prediction.gradcam_url && !camImgError && setFullscreenImage(getMediaUrl(prediction.gradcam_url))}>
              {!prediction.gradcam_url ? (
                <div className="no-heatmap">
                  <span>{t("mapUnavailable", lang)}</span>
                </div>
              ) : camImgError ? (
                <div className="no-heatmap error-state">
                  <ImageOff size={24} color="#f87171" />
                  <span>{t("imageLoadFailed", lang)}</span>
                </div>
              ) : (
                <>
                  <img 
                    src={getMediaUrl(prediction.gradcam_url)} 
                    alt="AI Heatmap" 
                    onError={() => setCamImgError(true)}
                  />
                  <button className="expand-btn"><Maximize2 size={16} /></button>
                </>
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
            <h2>{t("nvidiaFarmerAdvisory", lang)}</h2>
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
              <p>{t("generatingAiReport", lang)}</p>
            </div>
          ) : aiError ? (
            <div className="ai-report-error">
              <AlertTriangle size={32} color="#fca5a5" />
              <p>{t("aiUnavailable", lang)}</p>
              <button className="btn btn-secondary" onClick={() => fetchAiReport(reportLang)}>
                <RefreshCw size={16} />
                <span>{t("retry", lang)}</span>
              </button>
            </div>
          ) : aiStructured ? (
            <div className="structured-report">
              {aiStructured.diagnosis && (
                <div className="report-block highlight-block">
                  <h3>{t("diagnosis", lang)}</h3>
                  <p>{aiStructured.diagnosis}</p>
                </div>
              )}
              
              {aiStructured.summary && (
                <div className="report-block">
                  <h3>{t("summary", lang)}</h3>
                  <p>{aiStructured.summary}</p>
                </div>
              )}

              {aiStructured.immediate_actions && aiStructured.immediate_actions.length > 0 && (
                <div className="report-block action-block">
                  <h3><AlertTriangle size={18} color="#f87171" /> {t("immediateActions", lang)}</h3>
                  <ul>
                    {aiStructured.immediate_actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              )}

              <div className="report-grid-2">
                {aiStructured.symptoms && aiStructured.symptoms.length > 0 && (
                  <div className="report-block">
                    <h3>{t("symptoms", lang)}</h3>
                    <ul>{aiStructured.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {aiStructured.causes && aiStructured.causes.length > 0 && (
                  <div className="report-block">
                    <h3>{t("causes", lang)}</h3>
                    <ul>{aiStructured.causes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                )}
              </div>

              {aiStructured.treatment && aiStructured.treatment.length > 0 && (
                <div className="report-block treatment-block">
                  <h3>{t("treatmentManagement", lang)}</h3>
                  <ul>
                    {aiStructured.treatment.map((t_item, i) => <li key={i}>{t_item}</li>)}
                  </ul>
                </div>
              )}
              
              {aiStructured.prevention && aiStructured.prevention.length > 0 && (
                <div className="report-block prevention-block">
                  <h3><ShieldCheck size={18} color="#34d399" /> {t("prevention", lang)}</h3>
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
          <span>{t("scanAnother", lang)}</span>
        </button>
        <button 
          className={`btn action-btn ${saved ? 'btn-success' : 'btn-primary'}`} 
          onClick={handleSave} 
          disabled={saved}
        >
          {saved ? <BookmarkCheck size={18} /> : <BookmarkCheck size={18} />}
          <span>{saved ? t("savedToHistory", lang) : t("saveDiagnosis", lang)}</span>
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
