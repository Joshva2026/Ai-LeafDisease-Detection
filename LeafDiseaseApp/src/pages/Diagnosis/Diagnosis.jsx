import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, BookmarkCheck, Maximize2, X, Eye, Activity, Sparkles, Bot, Loader2, Sprout, ShieldCheck, Camera, ImageOff, Volume2, VolumeX, Pause, Play, Sliders, Columns } from "lucide-react";
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
  
  // Cache the normalized JSON reports to allow instant switching
  const [cachedReports, setCachedReports] = useState({ en: null, ta: null });
  
  // Explicit report state: "idle" | "loading" | "success" | "error"
  const [reportStatus, setReportStatus] = useState("idle");
  const [reportLang, setReportLang] = useState(lang || "ta");
  const [showReport, setShowReport] = useState(false);

  const [origImgError, setOrigImgError] = useState(false);
  const [camImgError, setCamImgError] = useState(false);

  // Phase 3C: Interactive Grad-CAM Slider State
  const [viewMode, setViewMode] = useState("slider"); // "slider" | "grid"
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  // Phase 3D: Audio TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLang, setAudioLang] = useState(lang || "ta");
  const [ttsNotice, setTtsNotice] = useState("");

  // Guard to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (prediction && reportStatus === "idle") {
      fetchAiReport(lang);
    }
  }, [prediction, lang]);

  const fetchAiReport = async (targetLang) => {
    if (!prediction) return;

    if (cachedReports[targetLang]) {
      console.log(`[AI Report] Using cached ${targetLang} report.`);
      setReportStatus("success");
      return;
    }

    setReportStatus("loading");
    const details = mapClassName(prediction.disease || "Unknown");

    try {
      let englishReport = cachedReports.en;
      
      // Step 1: Ensure English report
      if (!englishReport) {
        console.log("[AI Report] Generating English source report...");
        const res = await api.post("/api/ai/farmer-report", {
          disease: prediction.disease,
          plant: prediction.plant || details.plantName,
          confidence: prediction.confidence
        });

        if (!isMounted.current) return;

        if (res.data && res.data.success && res.data.structured_report) {
          englishReport = normalizeStructuredReport(res.data.structured_report);
          setCachedReports(prev => ({ ...prev, en: englishReport }));
        } else {
          console.warn("[AI Report] English generation failed:", res.data);
          setReportStatus("error");
          return;
        }
      }

      if (targetLang === "en") {
        setReportStatus("success");
        return;
      }

      // Step 2: Translate to Tamil
      if (targetLang === "ta" && englishReport) {
        console.log("[AI Report] Translating English report to Tamil...");
        const res = await api.post("/api/ai/translate-report", {
          english_report: englishReport,
          target_language: "ta"
        });

        if (!isMounted.current) return;

        if (res.data && res.data.success && res.data.structured_report) {
          const tamilReport = normalizeStructuredReport(res.data.structured_report);
          setCachedReports(prev => ({ ...prev, ta: tamilReport }));
          setReportStatus("success");
        } else {
          console.warn("[AI Report] Tamil translation failed, using English cache:", res.data);
          setCachedReports(prev => ({ ...prev, ta: englishReport }));
          setReportStatus("success");
        }
      }
    } catch (e) {
      if (!isMounted.current) return;
      console.error("[AI Report] Request error:", e.message || e);
      // Fallback: don't leave farmer hanging if offline
      setReportStatus("error");
    }
  };

  const normalizeStructuredReport = (structured) => {
    if (!structured) return null;
    const result = { ...structured };
    const arrayFields = ['symptoms', 'causes', 'immediate_actions', 'treatment', 'prevention', 'monitoring', 'farmer_advice'];
    arrayFields.forEach(f => {
      if (typeof result[f] === 'string') {
        result[f] = result[f].split('\n').filter(s => s.trim().length > 0).map(s => s.replace(/^[-*•\d.]+\s*/, '').trim());
      } else if (!Array.isArray(result[f]) && result[f]) {
        result[f] = [String(result[f])];
      } else if (!result[f]) {
        result[f] = [];
      }
    });
    return result;
  };

  const aiStructured = cachedReports[reportLang];

  const handleLangToggle = (newLang) => {
    setReportLang(newLang);
    setAudioLang(newLang);
    fetchAiReport(newLang);
  };

  // --- GRAD-CAM SLIDER DRAG HANDLERS ---
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((offsetX / rect.width) * 100);
    setSliderPos(percent);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // --- TEXT-TO-SPEECH (TTS) AUDIO READOUT ---
  const getSpeechScript = (targetLang) => {
    const details = mapClassName(prediction?.disease || "Unknown");
    const active = cachedReports[targetLang] || aiStructured;

    if (targetLang === "ta") {
      const title = prediction?.disease_formatted || details.displayName || "தாவர இலை நோய்";
      const summary = active?.summary || "இலை பரிசோதனை அறிக்கை முடிவுகள் தயார்.";
      const actions = Array.isArray(active?.immediate_actions) && active.immediate_actions.length > 0
        ? `முக்கிய நடவடிக்கைகள்: ${active.immediate_actions.slice(0, 3).join('. ')}`
        : "";
      return `${title}. ${summary}. ${actions}`;
    } else {
      const title = prediction?.disease_formatted || details.displayName || "Crop Foliage Diagnosis";
      const summary = active?.summary || "Foliar pathology analysis complete.";
      const actions = Array.isArray(active?.immediate_actions) && active.immediate_actions.length > 0
        ? `Immediate action checklist: ${active.immediate_actions.slice(0, 3).join('. ')}`
        : "";
      return `${title}. ${summary}. ${actions}`;
    }
  };

  const handlePlayTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setTtsNotice("Text-to-Speech is not supported on this device/browser.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    setTtsNotice("");

    const text = getSpeechScript(audioLang);
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (audioLang === "ta") {
      selectedVoice = voices.find(v => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil"));
      if (!selectedVoice) {
        setTtsNotice("Tamil voice not installed on this device. Reading in English instead.");
        selectedVoice = voices.find(v => v.lang.startsWith("en-IN") || v.lang.startsWith("en"));
      }
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith("en-IN") || v.lang.startsWith("en-US") || v.lang.startsWith("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.95; // Slightly slower for clarity in rural fields
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
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
  const originalUrl = getMediaUrl(prediction.original_url);
  const gradcamUrl = prediction.gradcam_url ? getMediaUrl(prediction.gradcam_url) : null;
  
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
          </div>
        </div>

        {/* AUDIO READOUT ACCESSIBILITY TOOLBAR (Phase 3D) */}
        <div className="tts-accessibility-bar glass-card">
          <div className="tts-title-info">
            <Volume2 size={18} color="#34d399" />
            <span className="tts-label">
              {lang === "ta" ? "குரல் வழிகாட்டல் (TTS)" : "Voice Audio Advisory"}
            </span>
          </div>

          <div className="tts-controls">
            <div className="tts-lang-buttons">
              <button 
                className={`tts-lang-btn ${audioLang === "ta" ? "active" : ""}`}
                onClick={() => { setAudioLang("ta"); handleStopTTS(); }}
              >
                தமிழ்
              </button>
              <button 
                className={`tts-lang-btn ${audioLang === "en" ? "active" : ""}`}
                onClick={() => { setAudioLang("en"); handleStopTTS(); }}
              >
                English
              </button>
            </div>

            {!isSpeaking ? (
              <button className="tts-action-btn play" onClick={handlePlayTTS} title="Play Audio">
                <Play size={16} />
                <span>{lang === "ta" ? "கேட்கவும்" : "Listen"}</span>
              </button>
            ) : (
              <>
                <button className="tts-action-btn pause" onClick={handlePauseTTS} title="Pause Audio">
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
                <button className="tts-action-btn stop" onClick={handleStopTTS} title="Stop Audio">
                  <VolumeX size={16} />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
        </div>

        {ttsNotice && (
          <div className="tts-notice-pill">
            <span>{ttsNotice}</span>
          </div>
        )}

        {/* VISUAL INSPECTION VIEW SWITCHER */}
        <div className="visualizer-mode-toggle">
          <span className="mode-label">
            {lang === "ta" ? "காட்சி முறை:" : "View Mode:"}
          </span>
          <div className="segmented-control mini">
            <button 
              className={`segmented-btn ${viewMode === "slider" ? "active" : ""}`}
              onClick={() => setViewMode("slider")}
            >
              <Sliders size={14} />
              <span>{lang === "ta" ? "ஒப்பீட்டு ஸ்லைடர்" : "Interactive Split"}</span>
            </button>
            <button 
              className={`segmented-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Columns size={14} />
              <span>{lang === "ta" ? "பக்கவாட்டு பார்வை" : "Side by Side"}</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE GRAD-CAM SPLIT COMPARISON SLIDER (Phase 3C) */}
        {viewMode === "slider" && gradcamUrl && !origImgError && !camImgError ? (
          <div className="interactive-slider-container">
            <div 
              className="split-slider-viewport"
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchMove={handleTouchMove}
            >
              {/* Bottom Image: Original Leaf */}
              <img 
                src={originalUrl} 
                alt="Original Leaf" 
                className="slider-base-img"
                onError={() => setOrigImgError(true)}
              />

              {/* Top Layer: Clipped Grad-CAM Heatmap */}
              <div 
                className="slider-reveal-layer"
                style={{ width: `${sliderPos}%` }}
              >
                <img 
                  src={gradcamUrl} 
                  alt="Grad-CAM Heatmap" 
                  className="slider-reveal-img"
                  onError={() => setCamImgError(true)}
                />
              </div>

              {/* Vertical Divider Line with Drag Handle */}
              <div 
                className="slider-divider-line"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="slider-handle-knob">
                  <span className="slider-arrow left">‹</span>
                  <span className="slider-arrow right">›</span>
                </div>
              </div>

              {/* Floating badges */}
              <div className="slider-badge left">
                <span>{lang === "ta" ? "AI கவன வரைபடம்" : "AI Attention"}</span>
              </div>
              <div className="slider-badge right">
                <span>{lang === "ta" ? "அசல் இலை" : "Original Leaf"}</span>
              </div>
            </div>

            {/* Accessible Range Input Control */}
            <div className="accessible-range-bar">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Grad-CAM comparison percentage"
              />
              <span className="range-val">{sliderPos}%</span>
            </div>

            {/* Scientific AI Attention Explanatory Label */}
            <div className="gradcam-scientific-disclaimer">
              <Activity size={14} color="#34d399" />
              <span>
                {lang === "ta"
                  ? "குறிப்பு: வண்ண வரைபடம் AI மாதிரியின் கவனப் பகுதிகளை (Grad-CAM) மட்டுமே காட்டுகிறது; இது உயிரியல் காரணத்திற்கான நேரடி ஆதாரம் அல்ல."
                  : "Note: Heatmap highlights model attention regions (Grad-CAM) and does not prove biological causation."}
              </span>
            </div>
          </div>
        ) : (
          /* VIEW 2: STANDARD SIDE-BY-SIDE GRID */
          <div className="reveal-visual-grid">
            {/* ORIGINAL IMAGE */}
            <div className="reveal-image-box">
              <div className="reveal-image-header">
                <Eye size={16} />
                <span>{t("originalImage", lang)}</span>
              </div>
              <div className="reveal-img-wrapper" onClick={() => !origImgError && setFullscreenImage(originalUrl)}>
                {origImgError ? (
                  <div className="no-heatmap error-state">
                    <ImageOff size={24} color="#f87171" />
                    <span>{t("imageLoadFailed", lang)}</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={originalUrl} 
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
              <div className="reveal-img-wrapper" onClick={() => gradcamUrl && !camImgError && setFullscreenImage(gradcamUrl)}>
                {!gradcamUrl ? (
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
                      src={gradcamUrl} 
                      alt="AI Heatmap" 
                      onError={() => setCamImgError(true)}
                    />
                    <button className="expand-btn"><Maximize2 size={16} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FARMER AI ADVISORY REPORT SECTION */}
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
                  >தமிழ்</button>
                  <button 
                    className={`segmented-btn ${reportLang === "en" ? "active" : ""}`}
                    onClick={() => handleLangToggle("en")}
                    disabled={reportStatus === "loading"}
                    role="radio"
                    aria-checked={reportLang === "en"}
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
                    {/* 1. Diagnosis */}
                    {aiStructured.diagnosis && (
                      <div className="report-block highlight-block">
                        <h3>{t("diagnosis", lang)}</h3>
                        <p>{aiStructured.diagnosis}</p>
                      </div>
                    )}
                    
                    {/* 2. Summary */}
                    {aiStructured.summary && (
                      <div className="report-block">
                        <h3>{t("summary", lang)}</h3>
                        <p>{aiStructured.summary}</p>
                      </div>
                    )}

                    {/* 3. Symptoms */}
                    {Array.isArray(aiStructured.symptoms) && aiStructured.symptoms.length > 0 && (
                      <div className="report-block">
                        <h3>{t("symptoms", lang)}</h3>
                        <ul>{aiStructured.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                    )}
                    
                    {/* 4. Causes */}
                    {Array.isArray(aiStructured.causes) && aiStructured.causes.length > 0 && (
                      <div className="report-block">
                        <h3>{t("causes", lang)}</h3>
                        <ul>{aiStructured.causes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                      </div>
                    )}

                    {/* 5. Immediate Actions */}
                    {Array.isArray(aiStructured.immediate_actions) && aiStructured.immediate_actions.length > 0 && (
                      <div className="report-block action-block">
                        <h3><AlertTriangle size={18} color="#f87171" /> {t("immediateActions", lang)}</h3>
                        <ul>
                          {aiStructured.immediate_actions.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* 6. Treatment & Management */}
                    {Array.isArray(aiStructured.treatment) && aiStructured.treatment.length > 0 && (
                      <div className="report-block treatment-block">
                        <h3>{t("treatmentManagement", lang)}</h3>
                        <ul>
                          {aiStructured.treatment.map((t_item, i) => <li key={i}>{t_item}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* 7. Prevention */}
                    {Array.isArray(aiStructured.prevention) && aiStructured.prevention.length > 0 && (
                      <div className="report-block prevention-block">
                        <h3><ShieldCheck size={18} color="#34d399" /> {t("prevention", lang)}</h3>
                        <ul>
                          {aiStructured.prevention.map((p_item, i) => <li key={i}>{p_item}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* 8. Monitoring */}
                    {Array.isArray(aiStructured.monitoring) && aiStructured.monitoring.length > 0 && (
                      <div className="report-block">
                        <h3>{t("monitoring", lang)}</h3>
                        <ul>{aiStructured.monitoring.map((m, i) => <li key={i}>{m}</li>)}</ul>
                      </div>
                    )}
                    
                    {/* 9. Farmer Advice */}
                    {Array.isArray(aiStructured.farmer_advice) && aiStructured.farmer_advice.length > 0 && (
                      <div className="report-block highlight-block" style={{ marginTop: '1rem', background: 'rgba(52, 211, 153, 0.1)' }}>
                        <h3>{t("farmerAdvice", lang) || "Farmer Advice"}</h3>
                        <ul>{aiStructured.farmer_advice.map((advice, i) => <li key={i}>{advice}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ) : reportStatus === "success" && aiReport ? (
                  <div className="unstructured-report">
                    <div dangerouslySetInnerHTML={{ __html: String(aiReport).replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="ai-report-loading">
                    <p>Preparing diagnosis advisory...</p>
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
          <BookmarkCheck size={18} />
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
