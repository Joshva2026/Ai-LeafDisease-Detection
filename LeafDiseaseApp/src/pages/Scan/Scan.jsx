import { useState, useRef, useEffect } from "react";
import { Camera, UploadCloud, AlertCircle, X, Loader2, Sparkles, Sprout, ArrowRight, Check, RefreshCw, Zap, ZapOff, ShieldCheck } from "lucide-react";
import { t } from "../../data/translations";
import api from "../../api/api";
import { compressImage } from "../../utils/imageCompressor";
import "./Scan.css";

function Scan({ onPredictionSuccess, lang }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  const stages = [
    t("stage1", lang),
    t("stage2", lang),
    t("stage3", lang),
    t("stage4", lang),
    t("stage5", lang)
  ];
  
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); 
  const [facingMode, setFacingMode] = useState("environment");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (cameraStatus === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error("Video play error:", err));

      // Check for torch capability
      try {
        const track = streamRef.current.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setTorchAvailable(true);
        }
      } catch (e) {
        setTorchAvailable(false);
      }
    }
  }, [cameraStatus]);

  const toggleTorch = async () => {
    if (!streamRef.current || !torchAvailable) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  const flipCamera = async () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    stopCamera();
    startCamera(nextFacing);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setCameraStatus("idle");
  };

  const startCamera = async (overrideFacing) => {
    setErrorMsg("");
    setUseCamera(true);
    setCameraStatus("requesting");
    setImage(null);
    setFile(null);
    setCompressStats(null);
    
    const targetFacing = overrideFacing || facingMode;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("unavailable");
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: targetFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setCameraStatus("ready");
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setCameraStatus("denied");
      } else {
        setCameraStatus("unavailable");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = async () => {
    if (videoRef.current) {
      // Haptic pulse on capture
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([35, 25, 35]);
      }

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      stopCamera();
      setUseCamera(false);

      // Client-side compression
      setCompressing(true);
      try {
        const compressed = await compressImage(rawDataUrl, 1024, 0.85);
        setImage(compressed.dataUrl);
        setFile(compressed.file);
        setCompressStats(compressed);
      } catch (err) {
        console.warn("Compression fallback:", err);
        setImage(rawDataUrl);
        const res = await fetch(rawDataUrl);
        const blob = await res.blob();
        setFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleFileChange = async (e) => {
    setErrorMsg("");
    setCompressStats(null);
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        setErrorMsg(t("err413", lang) || "File is too large (max 20MB)");
        return;
      }
      
      setCompressing(true);
      try {
        const compressed = await compressImage(selected, 1024, 0.85);
        setImage(compressed.dataUrl);
        setFile(compressed.file);
        setCompressStats(compressed);
      } catch (err) {
        console.warn("Compression fallback:", err);
        setFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(selected);
      } finally {
        setCompressing(false);
      }
    }
  };

  const clearSelection = () => {
    setImage(null);
    setFile(null);
    setCompressStats(null);
    setErrorMsg("");
    setUseCamera(false);
    stopCamera();
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setErrorMsg("");
    setIsWakingUp(false);
    setAnalysisStageIndex(0);

    const stageInterval = setInterval(() => {
      setAnalysisStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1500);

    const formData = new FormData();
    formData.append("image", file);

    const timeoutId = setTimeout(() => {
      setIsWakingUp(true);
    }, 8000);

    try {
      const response = await api.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearTimeout(timeoutId);
      clearInterval(stageInterval);

      if (response.data && response.data.success) {
        // Haptic success vibration
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([50, 40, 60]);
        }
        setAnalysisStageIndex(stages.length - 1);
        setTimeout(() => {
          onPredictionSuccess(response.data);
        }, 600);
      } else {
        throw new Error(response.data?.error || "Analysis failed - Invalid prediction format.");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      clearInterval(stageInterval);
      
      console.error("----- PREDICT API ERROR -----", error);
      
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else if (error.code === 'ECONNABORTED') {
        setErrorMsg(t("errTimeout", lang));
      } else if (!error.response) {
        setErrorMsg(t("errNetwork", lang));
      } else {
        const safeMessage = typeof error.response?.data === 'string' 
          ? error.response.data.substring(0, 120) 
          : JSON.stringify(error.response?.data).substring(0, 120);
        setErrorMsg(safeMessage || t("err500", lang));
      }
      
      setLoading(false);
      setIsWakingUp(false);
    }
  };

  return (
    <div className="field-scan-container fade-in-section">
      
      {/* Header */}
      <header className="field-header">
        <div className="field-badge">
          <Sprout size={16} />
          <span>{t("fieldDiagnosticStation", lang)}</span>
        </div>
        <h1 className="field-title">{t("plantDoctor", lang)}</h1>
        <p className="field-subtitle">
          {t("scanGuidance", lang)}
        </p>
      </header>

      {errorMsg && (
        <div className="field-error-banner glass-card">
          <AlertCircle size={20} color="#f87171" />
          <span>{errorMsg}</span>
          <button className="error-close" onClick={() => setErrorMsg("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Action Area */}
      <div className="scan-main-viewport">
        {!image && !useCamera ? (
          <div className="scan-init-card glass-card">
            <div className="upload-options">
              <button className="scan-primary-btn" onClick={() => startCamera()}>
                <Camera size={24} />
                <span>{t("takePhotoAction", lang)}</span>
              </button>
              <div className="scan-divider">
                <span>{t("or", lang)}</span>
              </div>
              <button className="scan-secondary-btn" onClick={triggerFileUpload}>
                <UploadCloud size={20} />
                <span>{t("uploadImageAction", lang)}</span>
              </button>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            
            <div className="scan-tips-grid">
              <div className="tip-item">
                <div className="tip-dot green"></div>
                <span>{t("tipVisible", lang)}</span>
              </div>
              <div className="tip-item">
                <div className="tip-dot yellow"></div>
                <span>{t("tipLighting", lang)}</span>
              </div>
              <div className="tip-item">
                <div className="tip-dot red"></div>
                <span>{t("tipBlur", lang)}</span>
              </div>
            </div>
          </div>
        ) : useCamera ? (
          <div className="camera-viewfinder glass-card">
            {cameraStatus === "requesting" && (
              <div className="camera-loading">
                <Loader2 size={32} className="spin-anim" />
                <p>{t("initCamera", lang)}</p>
              </div>
            )}
            
            {cameraStatus === "denied" && (
              <div className="camera-error">
                <AlertCircle size={40} color="#f87171" />
                <p>{t("cameraDenied", lang) || "Camera access permission was denied. Please allow camera permissions in browser/app settings."}</p>
                <button className="btn btn-secondary" onClick={clearSelection}>
                  {t("goBack", lang)}
                </button>
              </div>
            )}

            {cameraStatus === "unavailable" && (
              <div className="camera-error">
                <AlertCircle size={40} color="#f87171" />
                <p>Camera not available or device not supported. You can upload an image instead.</p>
                <button className="btn btn-secondary" onClick={triggerFileUpload}>
                  <UploadCloud size={18} />
                  <span>Upload Image</span>
                </button>
              </div>
            )}

            <div className={`video-wrapper ${cameraStatus === "ready" ? "active" : ""}`}>
              <video ref={videoRef} playsInline autoPlay muted />
              
              {/* LEAF ALIGNMENT GUIDE HUD */}
              <div className="leaf-hud-overlay">
                <div className="leaf-hud-instructions">
                  <span>{lang === "ta" ? "இலையை வழிகாட்டியில் பொருத்தவும்" : "Align leaf within guide target"}</span>
                </div>
                
                {/* SVG Leaf Outline Reticle */}
                <svg className="leaf-silhouette-guide" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M100 20 C140 60 170 110 160 160 C150 200 120 220 100 225 C80 220 50 200 40 160 C30 110 60 60 100 20 Z" 
                    stroke="rgba(52, 211, 153, 0.75)" 
                    strokeWidth="2.5" 
                    strokeDasharray="6 4"
                  />
                  <line x1="100" y1="25" x2="100" y2="220" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.5" />
                  <line x1="100" y1="80" x2="140" y2="100" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="1.5" />
                  <line x1="100" y1="120" x2="60" y2="140" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="1.5" />
                  <line x1="100" y1="160" x2="135" y2="180" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="1.5" />
                </svg>

                {/* Corner reticle brackets */}
                <div className="bracket tl"></div>
                <div className="bracket tr"></div>
                <div className="bracket bl"></div>
                <div className="bracket br"></div>
              </div>
              
              {/* Camera Quick Tools */}
              <div className="camera-hud-top-tools">
                {torchAvailable && (
                  <button className={`hud-tool-btn ${torchOn ? "active" : ""}`} onClick={toggleTorch} title="Toggle Torch">
                    {torchOn ? <Zap size={18} color="#fbbf24" /> : <ZapOff size={18} />}
                  </button>
                )}
                <button className="hud-tool-btn" onClick={flipCamera} title="Flip Camera">
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Shutter and Cancel controls */}
              <div className="camera-controls">
                <button className="cam-cancel-btn" onClick={clearSelection} title="Cancel">
                  <X size={24} />
                </button>
                <button className="cam-shutter-btn" onClick={capturePhoto} title="Capture Leaf Photo">
                  <div className="shutter-inner"></div>
                </button>
                <div style={{ width: 44 }}></div> {/* Balance layout */}
              </div>
            </div>
          </div>
        ) : (
          <div className="scan-preview-card glass-card">
            <div className="preview-image-wrapper">
              <img src={image} alt="Leaf preview" />
              {loading && (
                <div className="scanning-laser-overlay">
                  <div className="laser-beam"></div>
                  <div className="laser-pulse"></div>
                </div>
              )}
              {!loading && (
                <button className="preview-close-btn" onClick={clearSelection}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Client-Side Optimization Badge */}
            {compressStats && compressStats.compressionRatio > 0 && (
              <div className="compression-pill-badge">
                <ShieldCheck size={14} color="#10b981" />
                <span>
                  {lang === "ta" 
                    ? `வேகமான பரிமாற்றம்: ${Math.round(compressStats.compressedSize / 1024)} KB (-${compressStats.compressionRatio}%)`
                    : `Optimized for fast upload: ${Math.round(compressStats.compressedSize / 1024)} KB (-${compressStats.compressionRatio}%)`}
                </span>
              </div>
            )}

            <div className="preview-actions">
              <button 
                className="btn btn-primary analyze-cta-btn" 
                onClick={handleAnalyze} 
                disabled={loading || compressing}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-anim" />
                    <span>{stages[analysisStageIndex]}</span>
                  </>
                ) : compressing ? (
                  <>
                    <Loader2 size={18} className="spin-anim" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{t("diagnoseNow", lang)}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {isWakingUp && loading && (
              <p className="wake-up-hint">
                {t("coldStartHint", lang)}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Scan;
