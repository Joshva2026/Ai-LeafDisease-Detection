import { useState, useRef } from "react";
import api from "../../api/api";
import diseaseData from "../../data/diseaseData";
import { UploadCloud, Search, Loader2, ImageIcon, Camera, Video, AlertCircle } from "lucide-react";

function ImageUpload({ setPrediction }) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle local file uploaded
  const handleImage = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
    setPrediction(null);
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraError("");
    setPrediction(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // default to back camera on phones
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUseCamera(true);
    } catch (err) {
      console.error(err);
      setCameraError("Unable to access camera. Please upload an image instead.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  // Capture frame from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], "captured_leaf.jpg", { type: "image/jpeg" });
      setFile(capturedFile);
      setImage(URL.createObjectURL(capturedFile));
      stopCamera();
    }, "image/jpeg");
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Please upload or capture a leaf image first.");
      return;
    }
    setLoading(true);
    const userString = localStorage.getItem("user");
    const username = userString ? JSON.parse(userString).username : "Guest";

    const formData = new FormData();
    formData.append("image", file);
    formData.append("username", username);

    try {
      const response = await api.post("/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const disease = response.data.disease;
      const info = diseaseData[disease] || {
        description: "No specific description available for this class.",
        symptoms: ["No information available."],
        treatment: "Consult your local agricultural extension office.",
        prevention: "Maintain standard crop care practices."
      };
      setPrediction({
        success: true,
        disease,
        confidence: response.data.confidence,
        top_predictions: response.data.top_predictions,
        gradcam_url: response.data.gradcam_url,
        original_url: response.data.original_url,
        description: info.description,
        symptoms: info.symptoms,
        treatment: info.treatment,
        prevention: info.prevention
      });
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || "Backend Connection Failed. Please ensure the API server is running on port 5000.";
      setPrediction({
        success: false,
        error: errMsg
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Selector Mode Tabs */}
      <div className="upload-tabs" style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
        <button
          type="button"
          onClick={() => { stopCamera(); setUseCamera(false); setImage(null); setFile(null); }}
          className={`upload-tab-btn ${!useCamera ? "active" : ""}`}
          style={{
            flex: 1,
            padding: "8px",
            background: !useCamera ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.05)",
            border: "1px solid " + (!useCamera ? "#22c55e" : "rgba(255, 255, 255, 0.1)"),
            color: !useCamera ? "#22c55e" : "#9ca3af",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          <ImageIcon size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
          Upload Image
        </button>
        <button
          type="button"
          onClick={startCamera}
          className={`upload-tab-btn ${useCamera ? "active" : ""}`}
          style={{
            flex: 1,
            padding: "8px",
            background: useCamera ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.05)",
            border: "1px solid " + (useCamera ? "#22c55e" : "rgba(255, 255, 255, 0.1)"),
            color: useCamera ? "#22c55e" : "#9ca3af",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          <Camera size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
          Use Camera
        </button>
      </div>

      {cameraError && (
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <AlertCircle size={16} />
          {cameraError}
        </div>
      )}

      {/* Render Camera View or Upload drop zone */}
      {useCamera ? (
        <div className="camera-view-container" style={{
          position: "relative",
          width: "100%",
          height: "280px",
          background: "#000",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="camera-controls" style={{
            position: "absolute",
            bottom: "15px",
            left: "0",
            right: "0",
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }}>
            <button
              type="button"
              onClick={capturePhoto}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                padding: "10px 20px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
                cursor: "pointer"
              }}
            >
              <Video size={18} />
              Capture Snapshot
            </button>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                padding: "10px 15px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <label
          className="upload-drop-zone"
          onClick={() => fileInputRef.current.click()}
        >
          {image ? (
            <>
              <img src={image} alt="Uploaded leaf" className="preview-image" />
              <div className="change-img-tag">
                <ImageIcon size={15} /> Change Image
              </div>
            </>
          ) : (
            <>
              <div className="upload-cloud-icon">
                <UploadCloud size={60} />
              </div>
              <h3>Click or Drop Image Here</h3>
              <p>Supports JPG, PNG, JPEG</p>
            </>
          )}
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleImage}
          />
        </label>
      )}

      <button
        className="predict-btn-3d"
        onClick={handlePredict}
        disabled={loading || !file}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            Analyzing Leaf...
          </>
        ) : (
          <>
            <Search size={20} />
            Diagnose Disease
          </>
        )}
      </button>
    </div>
  );
}

export default ImageUpload;