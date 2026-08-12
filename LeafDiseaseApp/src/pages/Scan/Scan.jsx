import { useState, useRef, useEffect } from "react";
import { Camera, UploadCloud, ImageIcon, Video, AlertCircle, X, Check, Loader2 } from "lucide-react";
import { t } from "../../data/translationHelper";
import api from "../../api/api";
import "./Scan.css";

function Scan({ onPredictionSuccess, lang }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
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
    setCameraError("");
    setUseCamera(true);
    setImage(null);
    setFile(null);
    try {
      const constraints = {
        video: { facingMode: "environment" } // default to back camera on mobile
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(lang === "ta" ? "கேமராவை அணுக முடியவில்லை. கேமரா அனுமதிகளை சரிபார்க்கவும்." : "Unable to access camera. Please check permissions or choose gallery upload.");
      setUseCamera(false);
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
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      // Match camera video dimensions
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setImage(dataUrl);
      
      // Convert base64 to File blob
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const fileObj = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setFile(fileObj);
        });
      
      stopCamera();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMsg(lang === "ta" ? "செல்லாத படம். JPG, PNG அல்லது WEBP படத்தைப் பதிவேற்றவும்." : "Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        setImage(null);
        setFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
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
    }
  };

  const handleDiagnose = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("image", file);

    const savedUser = localStorage.getItem("user");
    const username = savedUser ? JSON.parse(savedUser).username : "testuser";
    formData.append("username", username);

    try {
      const response = await api.post("/predict", formData);

      if (response.data.success) {
        onPredictionSuccess(response.data);
      } else {
        setErrorMsg(response.data.error || (lang === "ta" ? "இலை நோயைக் கண்டறிய முடியவில்லை." : "Unable to analyze leaf. Please verify image details."));
      }
    } catch (err) {
      console.error("Diagnosis request error:", err);
      if (err.response) {
        if (err.response.status === 400) {
          setErrorMsg(lang === "ta" ? "செல்லாத படம். சரியான இலையின் படத்தைப் பதிவேற்றவும்." : "Please upload a valid leaf image.");
        } else if (err.response.status === 413) {
          setErrorMsg(lang === "ta" ? "படம் மிகப் பெரியது. 10 MB-க்கு குறைவான படத்தைப் பதிவேற்றவும்." : "Image is too large. Please upload an image below 10 MB.");
        } else if (err.response.status === 422) {
          setErrorMsg(lang === "ta" ? "இந்தப் படத்தைப் பகுப்பாய்வு செய்ய முடியவில்லை. வேறொரு இலையின் படத்தைப் பதிவேற்றவும்." : "We couldn't process this image. Try another clear leaf photo.");
        } else if (err.response.status === 500) {
          setErrorMsg(lang === "ta" ? "சர்வரில் பிழை ஏற்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்." : "The analysis service encountered a problem. Please try again.");
        } else {
          setErrorMsg(err.response.data.error || "An unexpected error occurred.");
        }
      } else if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes("timeout"))) {
        setErrorMsg(lang === "ta" ? "பகுப்பாய்வு அதிக நேரம் எடுக்கிறது. மீண்டும் முயற்சிக்கவும்." : "Analysis is taking longer than expected. Please try again.");
      } else if (err.request) {
        setErrorMsg(lang === "ta" ? "பகுப்பாய்வு சர்வரைத் தொடர்புகொள்ள முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்." : "Unable to reach the analysis service. Please check your connection.");
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setFile(null);
    setErrorMsg("");
    setCameraError("");
    stopCamera();
  };

  return (
    <div className="page-wrapper slide-section">
      <div className="scan-title-container">
        <h2 className="scan-title">{t("plantDoctor", lang)}</h2>
        <p className="scan-subtitle">{t("scanSubtitle", lang)}</p>
      </div>

      <div className="fade-in-section scan-layout-container">
        
        {/* Left Column: Capture / Preview Zone */}
        <div className="scan-left-col">
          <div className="scan-area-card">
            {loading && (
              <>
                <div className="laser-scanner"></div>
                <div className="scan-ring"></div>
              </>
            )}

            {useCamera ? (
              <div className="camera-stream-wrapper">
                <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                <div className="camera-overlay-controls">
                  <button className="camera-btn camera-btn-capture" onClick={capturePhoto}>
                    <Video size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                    {lang === "ta" ? "படம் எடு" : "Capture"}
                  </button>
                  <button className="camera-btn camera-btn-cancel" onClick={stopCamera}>
                    {lang === "ta" ? "ரத்துசெய்" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : image ? (
              <div className="preview-img-wrapper">
                <img src={image} alt="Preview" className="preview-img" />
                {!loading && (
                  <button className="remove-img-btn" onClick={resetAll} title="Clear Image">
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div onClick={() => fileInputRef.current.click()} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", cursor: "pointer" }}>
                <div className="scan-placeholder-icon">
                  <UploadCloud size={28} />
                </div>
                <h4>{t("uploadPrompt", lang)}</h4>
                <p style={{ textAlign: "center", marginBottom: "16px", color: "var(--text-secondary)" }}>{t("dragDropPrompt", lang)}</p>
                <div className="scan-tips-list" style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "left", display: "inline-block", lineHeight: "1.8" }}>
                  <div><Check size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-healthy)", marginRight: "6px" }} /> Use good lighting</div>
                  <div><Check size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-healthy)", marginRight: "6px" }} /> Keep the leaf visible</div>
                  <div><Check size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-healthy)", marginRight: "6px" }} /> Avoid extreme blur</div>
                  <div><Check size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-healthy)", marginRight: "6px" }} /> Capture the affected area clearly</div>
                  <div><Check size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-healthy)", marginRight: "6px" }} /> Avoid multiple overlapping leaves</div>
                </div>
                <div style={{ marginTop: "24px", fontSize: "12px", color: "var(--text-light)" }}>
                  Supported formats: JPG, PNG, WEBP (Max 10MB)
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Actions */}
        <div className="scan-right-col">
          {/* Tabs */}
          <div className="scan-mode-tabs">
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

          {/* Camera Errors */}
          {cameraError && (
            <div className="scan-error-card">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{cameraError}</div>
            </div>
          )}

          {/* Error state */}
          {errorMsg && (
            <div className="scan-error-card">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ color: "var(--color-danger)", fontWeight: "bold", marginBottom: "4px" }}>{t("analysisFailed", lang)}</p>
                <p style={{ color: "var(--color-danger)" }}>{errorMsg}</p>
                <button onClick={resetAll} style={{ marginTop: "6px" }}>{t("tryAnother", lang)}</button>
              </div>
            </div>
          )}

          {/* Image Ready / Analyzing state UI */}
          {image && !errorMsg && (
            <div className="scan-action-container">
              {loading ? (
                <div className="card analyzing-box">
                  <div className="scanner-loader"></div>
                  <span className="analyzing-title">{t("analyzing", lang)}</span>
                  <span className="analyzing-sub">{t("analyzingSub", lang)}</span>
                </div>
              ) : (
                <>
                  <div className="image-status-bar">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={16} color="var(--color-healthy)" />
                      <span>{t("readyScan", lang)}</span>
                    </div>
                  </div>
                  <div className="analyze-btn-wrapper">
                    <button className="btn btn-primary btn-analyze" onClick={handleDiagnose}>
                      {t("analyzeLeaf", lang)}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scan;
