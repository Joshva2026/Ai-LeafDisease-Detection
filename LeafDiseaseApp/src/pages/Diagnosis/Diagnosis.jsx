import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Bot, Loader2, Sprout, ShieldCheck, Camera, ImageOff } from "lucide-react";
import ErrorBoundary from "../../components/ErrorBoundary/ErrorBoundary";
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
  
  // Explicit report state: "idle" | "loading" | "success" | "error"
  const [reportStatus, setReportStatus] = useState("idle");
  const [reportLang, setReportLang] = useState(lang || "ta");
  const [showReport, setShowReport] = useState(false);

  const [origImgError, setOrigImgError] = useState(false);
  const [camImgError, setCamImgError] = useState(false);

  // Guard to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (prediction && reportStatus === "idle") {
      fetchAiReport(lang);
    }
  }, [prediction, lang]);

  const fetchAiReport = async (targetLang) => {
    if (!prediction) return;
    
    setReportStatus("loading");
    const details = mapClassName(prediction.disease || "Unknown");
    
    console.log("[AI Report] Request started for:", prediction.disease, "Language:", targetLang);
    
    try {
      const res = await api.post("/api/ai/farmer-report", {
        disease: prediction.disease,
        plant: prediction.plant || details.plantName,
        confidence: prediction.confidence,
        language: targetLang,
        lang: targetLang
      });
      
      if (!isMounted.current) {
        console.log("[AI Report] Component unmounted before response, ignoring.");
        return;
      }

      if (res.data && res.data.success) {
        console.log("[AI Report] Request success.");
        setAiReport(res.data.report_text || res.data.report || null);
        setAiStructured(res.data.structured_report || null);
        setReportStatus("success");
      } else {
        console.warn("[AI Report] Request returned non-success data:", res.data);
        if (res.data && res.data.nvidia_debug_error) {
          console.error("[Backend NVIDIA Error]:", res.data.nvidia_debug_error);
        }
        setReportStatus("error");
      }
    } catch (e) {
      if (!isMounted.current) return;
      console.error("[AI Report] Request error:", e.message || e);
      if (e.response && e.response.data && e.response.data.nvidia_debug_error) {
        console.error("[Backend NVIDIA Error]:", e.response.data.nvidia_debug_error);
      }
      setReportStatus("error");
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
            {!isHealthy && details.severity && details.severity !== "None" && (
              <span className={`reveal-status-pill ${details.severity.toLowerCase() === 'high' ? 'danger' : 'warning'}`}>
                <Activity size={16} />
                <span>{t("severity", lang)}: {t(details.severity.toLowerCase(), lang) || details.severity}</span>
              </span>
            )}
            {!isHealthy && details.status && details.status !== "Healthy" && (
              <span className="reveal-crop-pill" style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-color)" }}>
                <Bot size={16} />
                <span>{t("status", lang)}: {t(details.status.toLowerCase(), lang) || details.status}</span>
              </span>
            )}
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
                    onLoad={() => console.log("[Image Load] Original OK")}
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
                    onLoad={() => console.log("[Image Load] Grad-CAM OK")}
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
        {!showReport ? (
          <div className="report-toggle-card glass-card" style={{ padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary ai-reveal-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowReport(true)}>
              <Bot size={20} />
              <span>{t("needFullAiReport", lang)}</span>
            </button>
          </div>
        ) : (
          <>
            <div className="report-header-banner">
              <div className="report-title">
                <Bot size={24} color="#34d399" />
                <h2>{t("nvidiaFarmerAdvisory", lang)}</h2>
              </div>
              <div className="report-lang-toggle" style={{ width: '100%', padding: '10px 0' }}>
                <div className="segmented-control" role="radiogroup" aria-label="Language Selector">
                  <button 
                    className={`segmented-btn ${reportLang === "ta" ? "active" : ""}`}
                    onClick={() => handleLangToggle("ta")}
                    disabled={reportStatus === "loading"}
                    role="radio"
                    aria-checked={reportLang === "ta"}
                    aria-label="தமிழ் அறிக்கை"
                  >தமிழ்</button>
                  <button 
                    className={`segmented-btn ${reportLang === "en" ? "active" : ""}`}
                    onClick={() => handleLangToggle("en")}
                    disabled={reportStatus === "loading"}
                    role="radio"
                    aria-checked={reportLang === "en"}
                    aria-label="English report"
                  >English</button>
                </div>
              </div>
            </div>

            <div className="report-content-body glass-card min-h-report">
              <ErrorBoundary 
                inline={true} 
                lang={lang} 
                customMessage={t("aiUnavailable", lang)} 
                onRetry={() => fetchAiReport(reportLang)}
              >
                {reportStatus === "loading" ? (
                  <div className="ai-report-loading">
                    <Loader2 size={32} className="spin-anim" color="#34d399" />
                    <p>{t("generatingAiReport", lang)}</p>
                  </div>
                ) : reportStatus === "error" ? (
                  <div className="ai-report-error">
                    <AlertTriangle size={32} color="#fca5a5" />
                    <p>{t("aiUnavailable", lang)}</p>
                    <button className="btn btn-secondary" onClick={() => fetchAiReport(reportLang)}>
                      <RefreshCw size={16} />
                      <span>{t("retry", lang)}</span>
                    </button>
                  </div>
                ) : reportStatus === "success" && aiStructured ? (
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

                    {Array.isArray(aiStructured.immediate_actions) && aiStructured.immediate_actions.length > 0 && (
                      <div className="report-block action-block">
                        <h3><AlertTriangle size={18} color="#f87171" /> {t("immediateActions", lang)}</h3>
                        <ul>
                          {aiStructured.immediate_actions.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="report-grid-2">
                      {Array.isArray(aiStructured.symptoms) && aiStructured.symptoms.length > 0 && (
                        <div className="report-block">
                          <h3>{t("symptoms", lang)}</h3>
                          <ul>{aiStructured.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                      )}
                      {Array.isArray(aiStructured.causes) && aiStructured.causes.length > 0 && (
                        <div className="report-block">
                          <h3>{t("causes", lang)}</h3>
                          <ul>{aiStructured.causes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                        </div>
                      )}
                    </div>

                    {Array.isArray(aiStructured.treatment) && aiStructured.treatment.length > 0 && (
                      <div className="report-block treatment-block">
                        <h3>{t("treatmentManagement", lang)}</h3>
                        <ul>
                          {aiStructured.treatment.map((t_item, i) => <li key={i}>{t_item}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {Array.isArray(aiStructured.prevention) && aiStructured.prevention.length > 0 && (
                      <div className="report-block prevention-block">
                        <h3><ShieldCheck size={18} color="#34d399" /> {t("prevention", lang)}</h3>
                        <ul>
                          {aiStructured.prevention.map((p_item, i) => <li key={i}>{p_item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : reportStatus === "success" && aiReport ? (
                  <div className="unstructured-report">
                    <div dangerouslySetInnerHTML={{ __html: String(aiReport).replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="ai-report-loading">
                    <p>Unknown State</p>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </>
        )}
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
