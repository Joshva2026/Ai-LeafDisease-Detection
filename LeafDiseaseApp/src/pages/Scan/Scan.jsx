import { useState, useRef, useEffect } from "react";
import { Camera, UploadCloud, ImageIcon, Video, AlertCircle, X, Check, Info, Loader2 } from "lucide-react";
import { t } from "../../data/translations";
import api from "../../api/api";
import "./Scan.css";

function Scan({ onPredictionSuccess, lang }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle, requesting, ready, denied, unavailable
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up camera stream on unmount
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
      const constraints = {
        video: { facingMode: "environment" } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMsg(lang === "ta" ? "செல்லாத படம். JPG, PNG அல்லது WEBP படத்தைப் பதிவேற்றவும்." : "Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        setImage(null);
        setFile(null);
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setErrorMsg(lang === "ta" ? "படம் மிகப் பெரியது. 10 MB-க்கு குறைவான படத்தைப் பதிவேற்றவும்." : "Image is too large. Please upload an image below 10 MB.");
        setImage(null);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
      setErrorMsg("");
      stopCamera();
      setUseCamera(false);
    }
  };

  const handleDiagnose = async () => {
    if (!file) return;
    setLoading(true);
    setIsWakingUp(false);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("image", file);

    const savedUser = localStorage.getItem("user");
    const username = savedUser ? JSON.parse(savedUser).username : "testuser";
    formData.append("username", username);

    const wakeUpServer = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          await api.get("/", { timeout: 15000 });
          return;
        } catch (err) {
          if (i === retries) return; 
          setIsWakingUp(true);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };

    try {
      await wakeUpServer();

      let response;
      let attempt = 0;
      const MAX_PREDICT_RETRIES = 1;
      
      while (attempt <= MAX_PREDICT_RETRIES) {
        try {
          response = await api.post("/predict", formData);
          break; 
        } catch (err) {
          if (err.response && [400, 413, 422].includes(err.response.status)) {
            throw err; 
          }
          if (attempt === MAX_PREDICT_RETRIES) throw err;
          
          setIsWakingUp(true);
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      if (response && response.data.success) {
        onPredictionSuccess(response.data);
      } else {
        setErrorMsg(response?.data?.error || (lang === "ta" ? "இலை நோயைக் கண்டறிய முடியவில்லை." : "Unable to analyze leaf. Please verify image details."));
      }
    } catch (err) {
      console.error("Diagnosis request error:", err);
      if (err.response) {
        if (err.response.status === 400) {
          setErrorMsg(t("err400", lang));
        } else if (err.response.status === 413) {
          setErrorMsg(t("err413", lang));
        } else if (err.response.status === 422) {
          setErrorMsg(t("err422", lang));
        } else if (err.response.status === 500) {
          setErrorMsg(t("err500", lang));
        } else {
          setErrorMsg(err.response.data.error || "An unexpected error occurred.");
        }
      } else if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes("timeout"))) {
        setErrorMsg(t("errTimeout", lang));
      } else if (err.request) {
        setErrorMsg(t("errNetwork", lang));
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
      setIsWakingUp(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setFile(null);
    setErrorMsg("");
    stopCamera();
    setUseCamera(false);
  };

  return (
    <div className="page-wrapper scan-page-wrapper">
      <div className="scan-header">
        <h2 className="scan-title">{t("plantDoctor", lang)}</h2>
        <p className="scan-subtitle">{lang === "ta" ? "இலையைப் படம் பிடித்து நோயைக் கண்டறியவும்." : "Take a photo of a leaf to identify possible diseases."}</p>
      </div>

      <div className="scan-content">
        {loading ? (
          <div className="analyzing-state">
            <div className="preview-img-wrapper analyzing-preview">
              <img src={image} alt="Preview" className="preview-img dimmed" />
              <div className="laser-scanner"></div>
              <div className="scan-ring"></div>
            </div>
            <h3 className="analyzing-title">
              {isWakingUp ? (lang === "ta" ? "சேவையகம் தயாராகிறது..." : "Waking up server...") : (lang === "ta" ? "உங்கள் இலையை பகுப்பாய்வு செய்கிறது..." : "Analyzing your leaf...")}
            </h3>
            <p className="analyzing-sub">
              {isWakingUp ? (lang === "ta" ? "இது சிறிது நேரம் ஆகலாம்." : "This may take a moment.") : (lang === "ta" ? "AI நிலையை கண்டறிகிறது..." : "AI is identifying the condition...")}
            </p>
          </div>
        ) : image ? (
          <div className="image-ready-state">
            <div className="preview-img-wrapper rounded-preview">
              <img src={image} alt="Preview" className="preview-img" />
            </div>
            
            <div className="file-info">
              <span className="file-name">{file?.name || "captured-image.jpg"}</span>
              <span className="file-size">{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</span>
            </div>

            <div className="preview-actions">
              <button className="btn-secondary" onClick={resetAll}>
                {lang === "ta" ? "மாற்று" : "Choose Another"}
              </button>
              <button className="btn-secondary" onClick={() => { startCamera(); }}>
                {lang === "ta" ? "மீண்டும் எடு" : "Retake"}
              </button>
            </div>

            <button className="btn btn-primary btn-analyze-large" onClick={handleDiagnose}>
              {t("analyzeLeaf", lang)}
            </button>
            
            {errorMsg && (
              <div className="scan-error-card mt-3">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{t("analysisFailed", lang)}</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="input-selection-state">
            <div className="scan-mode-tabs compact-tabs">
              <button
                className={`scan-mode-btn ${!useCamera ? "active" : ""}`}
                onClick={() => { stopCamera(); setUseCamera(false); }}
              >
                <ImageIcon size={16} />
                {t("uploadImage", lang)}
              </button>
              <button
                className={`scan-mode-btn ${useCamera ? "active" : ""}`}
                onClick={startCamera}
              >
                <Camera size={16} />
                {t("useCamera", lang)}
              </button>
            </div>

            {!useCamera ? (
              <div className="upload-card" onClick={() => fileInputRef.current.click()}>
                <UploadCloud size={32} className="upload-icon" />
                <h4>{t("uploadPrompt", lang)}</h4>
                <p className="upload-specs">JPG PNG WEBP • Max 10MB</p>
                <button className="btn-gallery">{lang === "ta" ? "கேலரியில் இருந்து தேர்ந்தெடு" : "Choose from Gallery"}</button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="camera-card">
                {cameraStatus === "requesting" && (
                  <div className="camera-message">
                    <Loader2 className="spinner" size={24} />
                    <p>{lang === "ta" ? "கேமரா அனுமதியை கோருகிறது..." : "Requesting camera permission..."}</p>
                  </div>
                )}
                
                {cameraStatus === "denied" && (
                  <div className="camera-message error-msg">
                    <AlertCircle size={28} />
                    <p>{lang === "ta" ? "புகைப்படம் எடுக்க கேமரா அனுமதி தேவை." : "Camera permission is required to take a photo."}</p>
                    <button className="btn btn-primary mt-2" onClick={startCamera}>{lang === "ta" ? "கேமராவை அனுமதி" : "Allow Camera"}</button>
                    <button className="btn-text mt-2" onClick={() => setUseCamera(false)}>{lang === "ta" ? "கேலரியில் இருந்து பதிவேற்று" : "Upload from Gallery"}</button>
                  </div>
                )}
                
                {cameraStatus === "unavailable" && (
                  <div className="camera-message error-msg">
                    <AlertCircle size={28} />
                    <p>{lang === "ta" ? "இந்த சாதனத்தில் கேமரா இல்லை." : "Camera is not available on this device."}</p>
                    <button className="btn-text mt-2" onClick={() => setUseCamera(false)}>{lang === "ta" ? "கேலரியில் இருந்து பதிவேற்று" : "Upload from Gallery"}</button>
                  </div>
                )}
                
                {cameraStatus === "ready" && (
                  <div className="live-camera-container">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                    <div className="camera-controls">
                      <button className="btn-camera-close" onClick={() => setUseCamera(false)}>
                        <X size={20} />
                      </button>
                      <button className="btn-camera-capture" onClick={capturePhoto}>
                        <div className="capture-inner"></div>
                      </button>
                      <div style={{ width: 44 }}></div> {/* Spacer to center the capture button */}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!useCamera && (
               <details className="photo-tips-card">
                 <summary><Info size={16} /> {lang === "ta" ? "புகைப்பட குறிப்புகள்" : "Photo Tips"}</summary>
                 <div className="tips-content">
                    <p><Check size={14} color="var(--color-healthy)" /> {t("tipLighting", lang)}</p>
                    <p><Check size={14} color="var(--color-healthy)" /> {t("tipVisible", lang)}</p>
                    <p><Check size={14} color="var(--color-healthy)" /> {t("tipBlur", lang)}</p>
                 </div>
               </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Scan;
