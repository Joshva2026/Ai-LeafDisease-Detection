import { useState, useRef, useEffect } from "react";
import { Camera, UploadCloud, ImageIcon, AlertCircle, X, Check, Info, Loader2, Scan as ScanIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { t } from "../../data/translations";
import api from "../../api/api";
import "./Scan.css";

function Scan({ onPredictionSuccess, lang }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  const stages = [
    lang === "ta" ? "இலையின் படத்தைப் பிடிக்கிறது..." : "CAPTURING LEAF IMAGE",
    lang === "ta" ? "இலை அமைப்பை ஆராய்கிறது..." : "EXAMINING LEAF STRUCTURE",
    lang === "ta" ? "காட்சி வடிவங்களை பகுப்பாய்வு செய்கிறது..." : "ANALYZING VISUAL PATTERNS",
    lang === "ta" ? "காட்சி ஆதாரத்தை உருவாக்குகிறது..." : "GENERATING VISUAL EVIDENCE",
    lang === "ta" ? "நோயறிதல் அறிக்கையைத் தயார் செய்கிறது..." : "PREPARING DIAGNOSIS REPORT"
  ];
  
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle, requesting, ready, denied, unavailable
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
        // Fallback for laptop/desktop webcams without rear camera
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
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMsg(lang === "ta" ? "செல்லாத படம். JPG, PNG அல்லது WEBP படத்தைப் பதிவேற்றவும்." : "Invalid file type. Please upload a JPG, PNG, or WEBP image.");
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
    setAnalysisStageIndex(0);

    const stageInterval = setInterval(() => {
      setAnalysisStageIndex(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 600);

    const formData = new FormData();
    formData.append("image", file);

    const savedUser = localStorage.getItem("user");
    const username = savedUser ? JSON.parse(savedUser).username : "testuser";
    formData.append("username", username);

    const wakeUpServer = async (retries = 3) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await api.get("/health", { timeout: 10000 });
          if (res.data && res.data.status === "healthy" && res.data.model_loaded) {
            return;
          }
          throw new Error("Server not fully ready");
        } catch (err) {
          if (i === retries) return; 
          setIsWakingUp(true);
          await new Promise(resolve => setTimeout(resolve, 4000));
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
      clearInterval(stageInterval);
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
    <div className="scan-chamber-container fade-in-section">
      
      {/* DIAGNOSTIC CHAMBER HEADER */}
      <header className="chamber-header">
        <div className="chamber-badge">
          <span className="badge-pulse-dot"></span>
          <span>THE DIAGNOSTIC CHAMBER</span>
        </div>
        <h1 className="chamber-title">{t("plantDoctor", lang)}</h1>
        <p className="chamber-subtitle">
          {lang === "ta" ? "இலையைப் படம் பிடித்து நோயைக் கண்டறியவும்." : "Position your leaf inside the optic scanner frame to trigger neural diagnostic evaluation."}
        </p>
      </header>

      <div className="chamber-main-workstation">
        {loading ? (
          /* FRONTEND ANIMATION STAGES DURING REAL PREDICT CALL */
          <div className="chamber-analyzing-panel glass-card">
            <div className="chamber-optic-wrapper">
              <img src={image} alt="Preview" className="chamber-optic-img dimmed" />
              <div className="chamber-laser-sweep"></div>
              <div className="chamber-hud-ring"></div>
            </div>
            
            <div className="chamber-stage-info">
              <span className="stage-num-badge">STAGE 0{analysisStageIndex + 1} / 05</span>
              <h3 className="stage-title-text">
                {isWakingUp ? (lang === "ta" ? "சேவையகம் தயாராகிறது..." : "WAKING UP NEURAL SERVER...") : stages[analysisStageIndex]}
              </h3>
              <p className="stage-sub-text">
                {isWakingUp ? (lang === "ta" ? "இது சிறிது நேரம் ஆகலாம்." : "This may take a moment.") : `MobileNetV2 visual feature evaluation in progress`}
              </p>
            </div>
          </div>
        ) : image ? (
          /* IMAGE SELECTED PREVIEW STATE */
          <div className="chamber-ready-panel glass-card">
            <div className="chamber-optic-wrapper">
              <img src={image} alt="Preview" className="chamber-optic-img" />
              <div className="optic-hud-corner top-left"></div>
              <div className="optic-hud-corner top-right"></div>
              <div className="optic-hud-corner bottom-left"></div>
              <div className="optic-hud-corner bottom-right"></div>
            </div>

            <div className="chamber-file-details">
              <span className="file-tag">CAPTURED LEAF SPECIMEN</span>
              <h4 className="file-name-text">{file?.name || "captured-leaf.jpg"}</h4>
              <span className="file-size-text">{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</span>
            </div>

            <div className="chamber-actions-row">
              <button className="btn-chamber-secondary" onClick={resetAll}>
                {lang === "ta" ? "மாற்று" : "Choose Another"}
              </button>
              <button className="btn-chamber-secondary" onClick={startCamera}>
                {lang === "ta" ? "மீண்டும் எடு" : "Retake Photo"}
              </button>
            </div>

            <button className="btn btn-primary btn-chamber-diagnose" onClick={handleDiagnose}>
              <ScanIcon size={20} />
              <span>{t("analyzeLeaf", lang)}</span>
            </button>

            {errorMsg && (
              <div className="chamber-error-box">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* SCAN CHAMBER ENTRY & CAPTURE SELECTION */
          <div className="chamber-entry-panel">
            
            <div className="chamber-tabs-selector">
              <button
                className={`chamber-tab ${!useCamera ? "active" : ""}`}
                onClick={() => { stopCamera(); setUseCamera(false); }}
              >
                <ImageIcon size={16} />
                <span>{t("uploadImage", lang)}</span>
              </button>
              <button
                className={`chamber-tab ${useCamera ? "active" : ""}`}
                onClick={startCamera}
              >
                <Camera size={16} />
                <span>{t("useCamera", lang)}</span>
              </button>
            </div>

            {!useCamera ? (
              <div className="chamber-dropzone glass-card" onClick={() => fileInputRef.current.click()}>
                <div className="dropzone-icon-circle">
                  <UploadCloud size={32} color="#10b981" />
                </div>
                <h4>{t("uploadPrompt", lang)}</h4>
                <p className="dropzone-specs">Supports High-Resolution JPG, PNG, WEBP Leaf Photos</p>
                <button className="btn btn-primary btn-gallery-select">
                  <span>{lang === "ta" ? "கேலரியில் இருந்து தேர்ந்தெடு" : "UPLOAD FROM GALLERY"}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="chamber-camera-wrapper glass-card">
                {cameraStatus === "requesting" && (
                  <div className="camera-state-box">
                    <Loader2 className="spinner" size={24} color="#10b981" />
                    <p>{lang === "ta" ? "கேமரா அனுமதியை கோருகிறது..." : "Requesting optical camera access..."}</p>
                  </div>
                )}

                {cameraStatus === "denied" && (
                  <div className="camera-state-box error">
                    <AlertCircle size={28} />
                    <p>{lang === "ta" ? "புகைப்படம் எடுக்க கேமரா அனுமதி தேவை." : "Camera permission is required."}</p>
                    <button className="btn btn-primary mt-2" onClick={startCamera}>{lang === "ta" ? "கேமராவை அனுமதி" : "Allow Camera Access"}</button>
                  </div>
                )}

                {cameraStatus === "ready" && (
                  <div className="live-camera-chamber">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video-stream" />
                    <div className="camera-hud-overlay">
                      <button className="btn-close-cam" onClick={() => setUseCamera(false)}>
                        <X size={20} />
                      </button>
                      <button className="btn-capture-trigger" onClick={capturePhoto}>
                        <div className="trigger-ring"></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOW TO CAPTURE A GOOD LEAF — 3 VISUAL RULES */}
            <div className="capture-rules-section glass-card">
              <h3>HOW TO CAPTURE A GOOD LEAF</h3>
              <div className="rules-grid">
                <div className="rule-card">
                  <div className="rule-num">01</div>
                  <div className="rule-info">
                    <h4>Use a Clear Leaf</h4>
                    <p>Ensure single leaf is in sharp focus without heavy shadows.</p>
                  </div>
                </div>

                <div className="rule-card">
                  <div className="rule-num">02</div>
                  <div className="rule-info">
                    <h4>Keep Leaf Centered</h4>
                    <p>Position the lesion zone inside the main optical frame.</p>
                  </div>
                </div>

                <div className="rule-card">
                  <div className="rule-num">03</div>
                  <div className="rule-info">
                    <h4>Avoid Extreme Blur</h4>
                    <p>Hold your camera steady in natural indirect sunlight.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export default Scan;
