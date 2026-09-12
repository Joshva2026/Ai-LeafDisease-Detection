import { useState, useRef, useEffect } from "react";
import { Camera, UploadCloud, AlertCircle, X, Loader2, Sparkles, Sprout, ArrowRight } from "lucide-react";
import { t } from "../../data/translations";
import api from "../../api/api";
import "./Scan.css";

function Scan({ onPredictionSuccess, lang }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  const isTa = lang === "ta";

  const stages = [
    isTa ? "இலையின் படத்தை பதிவேற்றுகிறது..." : "Uploading leaf image...",
    isTa ? "இலை அமைப்பை ஆராய்கிறது..." : "Examining leaf structure...",
    isTa ? "நோய்களுக்கான வடிவங்களை தேடுகிறது..." : "Analyzing disease patterns...",
    isTa ? "கவன வரைபடத்தை உருவாக்குகிறது..." : "Generating visual evidence...",
    isTa ? "மருத்துவ அறிக்கையைத் தயார் செய்கிறது..." : "Preparing diagnostic report..."
  ];
  
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (cameraStatus === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error("Video play error:", err));
    }
  }, [cameraStatus]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg("");
    setUseCamera(true);
    setCameraStatus("requesting");
    setImage(null);
    setFile(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("unavailable");
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setImage(dataUrl);
      
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const fileObj = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setFile(fileObj);
        });
        
      stopCamera();
      setUseCamera(false);
    }
  };

  const handleFileChange = (e) => {
    setErrorMsg("");
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMsg(t("err413", lang));
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const clearSelection = () => {
    setImage(null);
    setFile(null);
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
        setAnalysisStageIndex(stages.length - 1);
        setTimeout(() => {
          onPredictionSuccess(response.data);
        }, 800);
      } else {
        throw new Error(response.data.error || "Analysis failed");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      clearInterval(stageInterval);
      console.error("Analysis Error:", error);
      
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else if (error.code === 'ECONNABORTED') {
        setErrorMsg(t("errTimeout", lang));
      } else if (!error.response) {
        setErrorMsg(t("errNetwork", lang));
      } else {
        setErrorMsg(t("err500", lang));
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
          <span>{isTa ? "வயல் பரிசோதனை மையம்" : "FIELD DIAGNOSTIC STATION"}</span>
        </div>
        <h1 className="field-title">{isTa ? "பயிர் மருத்துவர்" : "Plant Doctor"}</h1>
        <p className="field-subtitle">
          {isTa 
            ? "நோய் தாக்கிய இலையை தெளிவாக புகைப்படம் எடுக்கவும். எங்கள் AI உங்களை வழிநடத்தும்." 
            : "Capture a clear photo of the affected leaf. Our AI will guide you."}
        </p>
      </header>

      {errorMsg && (
        <div className="scan-alert-box">
          <AlertCircle size={20} className="alert-icon" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Scanner Area */}
      <div className="scanner-main-area">
        {!image && !useCamera ? (
          <div className="scan-init-card glass-card">
            <div className="upload-options">
              <button className="scan-primary-btn" onClick={startCamera}>
                <Camera size={24} />
                <span>{isTa ? "புகைப்படம் எடுக்க" : "TAKE PHOTO"}</span>
              </button>
              <div className="scan-divider">
                <span>{isTa ? "அல்லது" : "OR"}</span>
              </div>
              <button className="scan-secondary-btn" onClick={triggerFileUpload}>
                <UploadCloud size={20} />
                <span>{isTa ? "படத்தை பதிவேற்ற" : "UPLOAD IMAGE"}</span>
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
                <span>{isTa ? "இலை முழுமையாக தெரிய வேண்டும்" : "Keep leaf fully visible"}</span>
              </div>
              <div className="tip-item">
                <div className="tip-dot yellow"></div>
                <span>{isTa ? "நல்ல வெளிச்சம் அவசியம்" : "Ensure good lighting"}</span>
              </div>
              <div className="tip-item">
                <div className="tip-dot red"></div>
                <span>{isTa ? "மங்கலாக இருக்கக்கூடாது" : "Avoid blurry shots"}</span>
              </div>
            </div>
          </div>
        ) : useCamera ? (
          <div className="camera-viewfinder glass-card">
            {cameraStatus === "requesting" && (
              <div className="camera-loading">
                <Loader2 size={32} className="spin-anim" />
                <p>{isTa ? "கேமராவை இயக்குகிறது..." : "Initializing camera..."}</p>
              </div>
            )}
            
            {cameraStatus === "denied" && (
              <div className="camera-error">
                <AlertCircle size={40} color="#f87171" />
                <p>{isTa ? "கேமரா அணுகல் மறுக்கப்பட்டது." : "Camera access denied."}</p>
                <button className="btn btn-secondary" onClick={clearSelection}>
                  {isTa ? "திரும்பிச் செல்" : "Go Back"}
                </button>
              </div>
            )}

            <div className={`video-wrapper ${cameraStatus === "ready" ? "active" : ""}`}>
              <video ref={videoRef} playsInline autoPlay muted />
              <div className="scanner-overlay-brackets">
                <div className="bracket tl"></div>
                <div className="bracket tr"></div>
                <div className="bracket bl"></div>
                <div className="bracket br"></div>
              </div>
              
              <div className="camera-controls">
                <button className="cam-cancel-btn" onClick={clearSelection}>
                  <X size={24} />
                </button>
                <button className="cam-shutter-btn" onClick={capturePhoto}>
                  <div className="shutter-inner"></div>
                </button>
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

            <div className="preview-actions">
              {loading ? (
                <div className="analysis-progress-panel">
                  <div className="analysis-header">
                    <Sparkles size={20} color="#34d399" />
                    <h3>{isTa ? "AI பரிசோதனை நடக்கிறது" : "AI DIAGNOSIS IN PROGRESS"}</h3>
                  </div>
                  
                  <div className="analysis-stages">
                    {stages.map((stage, idx) => (
                      <div key={idx} className={`stage-row ${idx === analysisStageIndex ? "active" : idx < analysisStageIndex ? "complete" : "pending"}`}>
                        <div className="stage-icon">
                          {idx < analysisStageIndex ? <Check size={14} /> : idx === analysisStageIndex ? <Loader2 size={14} className="spin-anim" /> : <div className="dot"></div>}
                        </div>
                        <span className="stage-text">{stage}</span>
                      </div>
                    ))}
                  </div>

                  {isWakingUp && (
                    <div className="waking-up-msg">
                      <Loader2 size={14} className="spin-anim" />
                      <span>{t("wakingUpMsg", lang)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ready-to-analyze">
                  <button className="btn btn-primary analyze-btn-hero" onClick={handleAnalyze}>
                    <Sparkles size={20} />
                    <span>{isTa ? "நோயை பகுப்பாய்வு செய்" : "ANALYZE FOR DISEASE"}</span>
                    <ArrowRight size={20} />
                  </button>
                  <p className="rescan-hint" onClick={clearSelection}>
                    {isTa ? "வேறு படத்தை தேர்வு செய்" : "Choose different image"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Scan;
