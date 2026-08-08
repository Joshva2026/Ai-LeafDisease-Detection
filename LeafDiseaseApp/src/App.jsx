import { useState, useEffect } from "react";
import "./App.css";
import ImageUpload from "./components/ImageUpload/ImageUpload";
import Auth from "./components/Auth/Auth";
import api from "./api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Rocket, Zap, Camera, Bot, Stethoscope,
  BarChart3, ShieldCheck, Activity, FileText,
  Info, ChevronRight, LogOut, HeartPulse, AlertCircle, History, Globe, Loader2, MapPin
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const crops = [
  { name: "Apple", emoji: "🍎" },
  { name: "Tomato", emoji: "🍅" },
  { name: "Potato", emoji: "🥔" },
  { name: "Corn", emoji: "🌽" },
  { name: "Grape", emoji: "🍇" },
  { name: "Orange", emoji: "🍊" },
  { name: "Peach", emoji: "🍑" },
  { name: "Pepper", emoji: "🫑" },
  { name: "Blueberry", emoji: "🫐" },
  { name: "Cherry", emoji: "🍒" },
  { name: "Strawberry", emoji: "🍓" },
  { name: "Soybean", emoji: "🌱" },
  { name: "Squash", emoji: "🥬" },
  { name: "Raspberry", emoji: "🌿" },
];

const translations = {
  en: {
    home: "Home",
    features: "Features",
    detect: "Detect",
    crops: "Crops",
    logout: "Log Out",
    welcome: "Hi",
    heroBadge: "AI-Powered Plant Disease Detection",
    heroTitle: "Protect Your Crops with AI Precision",
    heroSub: "Upload a leaf image or take a snapshot directly using the live camera. Know the disease, symptoms, treatment, and prevention tips instantly.",
    btnStart: "Start Detection",
    btnExplore: "Explore Features",
    statAccuracy: "Prediction Accuracy",
    statClasses: "Disease Classes",
    statCrops: "Supported Crops",
    featureLabel: "Features",
    featureTitle: "Powered by Real AI",
    featureSub: "Three simple steps to diagnose any plant disease with deep learning accuracy.",
    inputTitle: "Input Leaf Source",
    analysisTitle: "Analysis & Prediction",
    emptyResult: "Upload a leaf image or use the camera and click Diagnose to see results here.",
    topMatching: "Top Matching Predictions",
    hotspotTitle: "🔍 Infection Hotspot Map (Grad-CAM)",
    hotspotSub: "Comparing the original leaf with the infected heatmap. The highlighted regions (red/yellow) indicate where the deep learning model localized the infection.",
    descriptionTitle: "Description",
    symptomsTitle: "Symptoms",
    treatmentTitle: "Treatment",
    preventionTitle: "Prevention",
    historyTitle: "Scan History (Last 5)",
    noHistory: "No recent scans. Logged scans will appear here.",
    supportedTitle: "Supported Crops",
    supportedSub: "Our AI model recognizes diseases across 14 major crop types.",
    diagnosisBlocked: "Diagnosis Blocked",
    healthy: "Healthy",
    mild: "Mild Risk",
    severe: "Severe Risk",
    treatmentSheet: "📝 Treatment Sheet",
    visualDiagnosis: "📊 Visual Diagnosis"
  },
  ta: {
    home: "முகப்பு",
    features: "அம்சங்கள்",
    detect: "கண்டறிதல்",
    crops: "பயிர்கள்",
    logout: "வெளியேறு",
    welcome: "வணக்கம்",
    heroBadge: "AI-ஆல் இயங்கும் தாவர நோய் கண்டறிதல்",
    heroTitle: "துல்லியமான AI மூலம் உங்கள் பயிர்களைப் பாதுகாக்கவும்",
    heroSub: "இலை படத்தை பதிவேற்றவும் அல்லது கேமராவைப் பயன்படுத்தி நேரடி புகைப்படம் எடுக்கவும். நோய், அறிகுறிகள், சிகிச்சை மற்றும் தடுப்பு உதவிக்குறிப்புகளை உடனடியாக அறிந்து கொள்ளுங்கள்.",
    btnStart: "கண்டறியத் தொடங்கு",
    btnExplore: "அம்சங்களை ஆராய்",
    statAccuracy: "கணிப்பு துல்லியம்",
    statClasses: "நோய் வகைகள்",
    statCrops: "ஆதரிக்கப்படும் பயிர்கள்",
    featureLabel: "அம்சங்கள்",
    featureTitle: "உண்மையான AI மூலம் இயக்கப்படுகிறது",
    featureSub: "ஆழ்ந்த கற்றல் துல்லியத்துடன் எந்தவொரு தாவர நோயையும் கண்டறிய மூன்று எளிய படிகள்.",
    inputTitle: "இலை மூல உள்ளீடு",
    analysisTitle: "பகுப்பாய்வு & கணிப்பு",
    emptyResult: "முடிவுகளைக் காண இலையின் படத்தை பதிவேற்றவும் அல்லது கேமராவைப் பயன்படுத்தி கண்டறி என்பதைக் கிளிக் செய்யவும்.",
    topMatching: "சிறந்த கணிப்பு பொருத்தங்கள்",
    hotspotTitle: "🔍 நோய் தொற்று பகுதி வரைபடம் (Grad-CAM)",
    hotspotSub: "அசல் இலையை நோய் தொற்று வரைபடத்துடன் ஒப்பிடுதல். சிவப்பு/மஞ்சள் நிற புள்ளிகள் நோய் தொற்றை மாதிரியால் சுட்டிக்காட்டப்பட்ட இடங்களைக் குறிக்கும்.",
    descriptionTitle: "விளக்கம்",
    symptomsTitle: "அறிகுறிகள்",
    treatmentTitle: "சிகிச்சை முறை",
    preventionTitle: "தடுப்பு முறைகள்",
    historyTitle: "சமீபத்திய சோதனைகள் (கடைசி 5)",
    noHistory: "சமீபத்திய சோதனைகள் எதுவும் இல்லை. சோதிக்கப்பட்ட விவரங்கள் இங்கே தோன்றும்.",
    supportedTitle: "ஆதரிக்கப்படும் பயிர்கள்",
    supportedSub: "எங்கள் AI மாதிரி 14 முக்கிய பயிர் வகைகளில் உள்ள நோய்களைக் கண்டறிறுகிறது.",
    diagnosisBlocked: "கண்டறிதல் தடுக்கப்பட்டது",
    healthy: "ஆரோக்கியமானது",
    mild: "லேசான ஆபத்து",
    severe: "கடுமையான ஆபத்து",
    treatmentSheet: "📝 சிகிச்சை விவரங்கள்",
    visualDiagnosis: "📊 காட்சி கணிப்பு"
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState("en"); // "en" or "ta"
  const [translatedPred, setTranslatedPred] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [view, setView] = useState("dashboard"); // "dashboard" or "profile"
  const [isEditing, setIsEditing] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [editProfileImage, setEditProfileImage] = useState("");

  const t = translations[lang];

  // Check if user session exists in localStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch scan history
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/history?username=${user.username}`);
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  // Re-fetch history when user logs in or a new prediction succeeds
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, prediction]);

  // Translate prediction details when language switches to Tamil
  useEffect(() => {
    const translatePrediction = async () => {
      if (!prediction || !prediction.success) {
        setTranslatedPred(null);
        return;
      }

      if (lang === "ta") {
        setTranslating(true);
        try {
          // Translate dynamic fields using Gemini translation helper
          const translateText = async (text) => {
            const res = await api.post("/api/chat", {
              message: `Translate the following text to Tamil. Output ONLY the translated Tamil text. Do not add any introductory message, chat text, or quotes:\n\n${text}`
            });
            return res.data.success ? res.data.reply.trim() : text;
          };

          const transDisease = await translateText(prediction.disease);
          const transDesc = await translateText(prediction.description);
          const transTreatment = await translateText(prediction.treatment);
          const transPrevention = await translateText(prediction.prevention);

          const transSymptoms = [];
          for (const sym of prediction.symptoms) {
            const ts = await translateText(sym);
            transSymptoms.push(ts);
          }

          setTranslatedPred({
            ...prediction,
            disease: transDisease,
            description: transDesc,
            treatment: transTreatment,
            prevention: transPrevention,
            symptoms: transSymptoms
          });
        } catch (err) {
          console.error("Auto translation failed:", err);
          setTranslatedPred(prediction);
        } finally {
          setTranslating(false);
        }
      } else {
        setTranslatedPred(null);
      }
    };

    translatePrediction();
  }, [lang, prediction]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPrediction(null);
    setHistory([]);
    setView("dashboard");
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.post("/api/auth/update", {
        username: user.username,
        location: editLocation,
        profile_image: editProfileImage
      });
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  // Use translated prediction if language is Tamil
  const activePred = (lang === "ta" && translatedPred) ? translatedPred : prediction;

  const isHealthy = prediction?.disease ? prediction.disease.toLowerCase().includes("healthy") : false;

  const formattedDisease = activePred?.disease
    ?.replace(/___/g, " → ")
    ?.replace(/_/g, " ");

  // Circular progress calculation
  const strokeDashoffset = prediction ? 283 - (283 * prediction.confidence) / 100 : 283;

  // Severity Indicator Logic
  const getSeverity = () => {
    if (!prediction || !prediction.success) return null;
    if (isHealthy) {
      return {
        label: t.healthy,
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.15)",
        border: "rgba(16, 185, 129, 0.3)"
      };
    }
    if (prediction.confidence <= 75) {
      return {
        label: t.mild,
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.15)",
        border: "rgba(251, 191, 36, 0.3)"
      };
    }
    return {
      label: t.severe,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.3)"
    };
  };

  const severity = getSeverity();

  return (
    <>
      {/* ======================== NAVBAR ======================== */}
      <nav className="navbar">
        <div className="logo" onClick={() => setView("dashboard")} style={{ cursor: "pointer" }}>
          <Leaf className="logo-icon" size={26} />
          LeafGuard AI
        </div>
        <ul className="nav-links">
          <li>
            <button
              onClick={() => setView("dashboard")}
              style={{
                background: "transparent",
                border: "none",
                color: view === "dashboard" ? "#22c55e" : "rgba(255,255,255,0.7)",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "color 0.3s"
              }}
            >
              {t.home}
            </button>
          </li>
          <li><a href="#features" onClick={() => setView("dashboard")}>{t.features}</a></li>
          <li><a href="#detect" onClick={() => setView("dashboard")}>{t.detect}</a></li>
          <li><a href="#crops" onClick={() => setView("dashboard")}>{t.crops}</a></li>
          {/* Profile Navigation Tab */}
          <li>
            <button
              onClick={() => setView("profile")}
              style={{
                background: "transparent",
                border: "none",
                color: view === "profile" ? "#22c55e" : "rgba(255,255,255,0.7)",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "color 0.3s"
              }}
            >
              {lang === "ta" ? "சுயவிவரம்" : "Profile"}
            </button>
          </li>
        </ul>
        <div className="nav-user-actions" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Language Switch Toggle */}
          <div className="lang-switcher" style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "30px",
            padding: "2px"
          }}>
            <button
              onClick={() => setLang("en")}
              style={{
                background: lang === "en" ? "#22c55e" : "transparent",
                color: lang === "en" ? "#030712" : "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ta")}
              style={{
                background: lang === "ta" ? "#22c55e" : "transparent",
                color: lang === "ta" ? "#030712" : "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              தமிழ்
            </button>
          </div>

          <span className="user-welcome" style={{ color: "#a7f3d0", fontSize: "14px", fontWeight: "600" }}>
            {t.welcome}, {user.username}
          </span>
          <button className="logout-btn" onClick={handleLogout} style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "600",
            transition: "all 0.2s"
          }}>
            <LogOut size={14} /> {t.logout}
          </button>
        </div>
      </nav>

      {view === "profile" ? (
        /* ======================== PROFILE VIEW ======================== */
        <div className="profile-container" style={{
          padding: "120px 6% 80px",
          minHeight: "100vh",
          background: "#030712",
          color: "#fff"
        }}>
          {/* User Account Card */}
          <motion.div
            className="glass-panel"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ maxWidth: "800px", margin: "0 auto 40px", padding: "30px" }}
          >
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", margin: "0 0 10px 0" }}>
                  {lang === "ta" ? "சுயவிவரத்தைத் திருத்தவும்" : "Edit Profile"}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", color: "#a7f3d0", fontWeight: "600" }}>
                    {lang === "ta" ? "இருப்பிடம்" : "Location"}
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="E.g. London, UK"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "10px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", color: "#a7f3d0", fontWeight: "600" }}>
                    {lang === "ta" ? "சுயவிவரப் படம்" : "Profile Image"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            const MAX_SIZE = 150;
                            let width = img.width;
                            let height = img.height;
                            if (width > height) {
                              if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              }
                            } else {
                              if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0, width, height);
                            setEditProfileImage(canvas.toDataURL("image/jpeg", 0.7));
                          };
                          img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "8px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      background: "#22c55e",
                      color: "#030712",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    {lang === "ta" ? "சேமி" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    {lang === "ta" ? "ரத்துசெய்" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile Avatar"
                    style={{
                      width: "85px",
                      height: "85px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #22c55e",
                      boxShadow: "0 4px 14px rgba(34, 197, 94, 0.2)"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "85px",
                    height: "85px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #22c55e, #10b981)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: "800",
                    color: "#030712"
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h2 style={{ margin: "0 0 5px 0", fontSize: "26px", fontWeight: "800", color: "#fff" }}>
                        {user.username}
                      </h2>
                      {user.location && (
                        <p style={{ margin: "0 0 8px 0", color: "#34d399", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                          <MapPin size={13} /> {user.location}
                        </p>
                      )}
                      <p style={{ margin: "0 0 15px 0", color: "#9ca3af", fontSize: "14px" }}>
                        {user.username.toLowerCase()}@leafguard.ai
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditLocation(user.location || "");
                        setEditProfileImage(user.profile_image || "");
                      }}
                      style={{
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "#34d399",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                    >
                      {lang === "ta" ? "சுயவிவரத்தைத் திருத்து" : "Edit Profile"}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "12px",
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      color: "#34d399",
                      padding: "4px 10px",
                      borderRadius: "6px"
                    }}>
                      Account: Active
                    </span>
                    <span style={{
                      fontSize: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#d1d5db",
                      padding: "4px 10px",
                      borderRadius: "6px"
                    }}>
                      Total Scans: {history.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Previous Results Grid */}
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <History size={22} color="#22c55e" /> {lang === "ta" ? "முந்தைய நோயறிதல் முடிவுகள்" : "Previous Detection Results"}
            </h3>

            {history.length === 0 ? (
              <div className="glass-panel" style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
                <FileText size={60} style={{ marginBottom: "15px", opacity: 0.4 }} />
                <p style={{ fontSize: "15px" }}>{lang === "ta" ? "சேமிக்கப்பட்ட முந்தைய முடிவுகள் எதுவும் இல்லை." : "You have no previous saved detection results."}</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px"
              }}>
                {history.map((item, idx) => {
                  const isHistHealthy = item.disease.toLowerCase().includes("healthy");
                  const formattedHistDisease = item.disease.replace(/___/g, " → ").replace(/_/g, " ");

                  return (
                    <motion.div
                      key={idx}
                      className="glass-panel"
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ overflow: "hidden" }}>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {formattedHistDisease}
                          </h4>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>{item.timestamp}</span>
                        </div>
                        <div style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: isHistHealthy ? "#34d399" : "#f87171",
                          background: isHistHealthy ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          padding: "3px 8px",
                          borderRadius: "8px",
                          flexShrink: 0
                        }}>
                          {item.confidence}% Match
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        padding: "8px"
                      }}>
                        <img
                          src={item.thumbnail_base64}
                          alt="Historical scan"
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1530708112151-5b9b7405267e?w=80"; // fallback
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.filename}
                        </span>
                      </div>

                      <button
                        onClick={async () => {
                          const cleanKey = item.disease;
                          const diseaseDataModule = (await import("./data/diseaseData")).default;
                          const info = diseaseDataModule[cleanKey] || {
                            description: "No specific description available for this class.",
                            symptoms: ["No information available."],
                            treatment: "Consult your local agricultural extension office.",
                            prevention: "Maintain standard crop care practices."
                          };
                          setPrediction({
                            success: true,
                            disease: item.disease,
                            confidence: item.confidence,
                            original_url: item.thumbnail_base64,
                            gradcam_url: item.gradcam_base64,
                            description: info.description,
                            symptoms: info.symptoms,
                            treatment: info.treatment,
                            prevention: info.prevention
                          });
                          setView("dashboard");
                          setTimeout(() => {
                            document.getElementById("detect").scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        style={{
                          background: "rgba(34, 197, 94, 0.12)",
                          border: "1px solid rgba(34, 197, 94, 0.25)",
                          color: "#34d399",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginTop: "auto",
                          textAlign: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        {lang === "ta" ? "விவரங்களைக் காண்க" : "View Details"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================== DASHBOARD VIEW ======================== */
        <>
          {/* ======================== HERO ======================== */}
          <section className="hero" id="home">
            <motion.div
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="hero-badge">
                  <span className="dot"></span>
                  {t.heroBadge}
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp}>
                {t.heroTitle.split("with")[0]} <span className="highlight">Crops</span><br />
                with AI Precision
              </motion.h1>

              <motion.p className="hero-sub" variants={fadeUp}>
                {t.heroSub}
              </motion.p>

              <motion.div className="hero-buttons" variants={fadeUp}>
                <button className="btn-primary" onClick={() => document.getElementById("detect").scrollIntoView({ behavior: "smooth" })}>
                  <Rocket size={18} /> {t.btnStart}
                </button>
                <button className="btn-secondary" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>
                  <Zap size={18} /> {t.btnExplore}
                </button>
              </motion.div>

              <motion.div className="hero-stats" variants={fadeUp}>
                <div className="stat-item"><h2>98%</h2><p>{t.statAccuracy}</p></div>
                <div className="stat-item"><h2>38</h2><p>{t.statClasses}</p></div>
                <div className="stat-item"><h2>14+</h2><p>{t.statCrops}</p></div>
              </motion.div>
            </motion.div>
          </section>

          {/* ======================== FEATURES ======================== */}
          <section className="features-section" id="features">
            <motion.div
              className="header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <div className="section-label"><Zap size={14} /> {t.featureLabel}</div>
              <h2 className="section-title">{t.featureTitle}</h2>
              <p className="section-sub">{t.featureSub}</p>
            </motion.div>

            <motion.div
              className="features-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { icon: <Camera size={26} />, title: lang === "ta" ? "பதிவேற்றம் அல்லது படம்" : "Upload or Snap", desc: lang === "ta" ? "கேலரியில் இருந்து ஒரு புகைப்படத்தைத் தேர்ந்தெடுக்கவும் அல்லது நேரடி படத்தைப் பிடிக்க வெப்கேம்களைப் பயன்படுத்தவும்." : "Choose a photo from your gallery or use your webcam to capture a live snapshot." },
                { icon: <Bot size={26} />, title: lang === "ta" ? "AI ஆழமான பகுப்பாய்வு" : "AI Deep Analysis", desc: lang === "ta" ? "எங்கள் MobileNetV2 மாதிரி 98% துல்லியத்துடன் உடனடியாக படத்தை பகுப்பாய்வு செய்கிறது." : "Our MobileNetV2 model instantly analyzes the image with 98% accuracy." },
                { icon: <Stethoscope size={26} />, title: lang === "ta" ? "சிகிச்சை & அரட்டை" : "Treatment & Chat", desc: lang === "ta" ? "சிகிச்சை விவரங்களைப் பெற்று, எங்கள் அக்ரி-பாட் உதவியாளருடன் அரட்டையடிக்கவும்." : "Get treatment sheets and chat dynamically with our Agri-bot assistant." },
              ].map((f, i) => (
                <motion.div key={i} className="feature-card-3d" variants={fadeUp}>
                  <div className="f-icon-wrap">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ======================== DETECT SECTION ======================== */}
          <section className="detect-section" id="detect">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{ marginBottom: "40px" }}
            >
              <div className="section-label"><Camera size={14} /> {t.detect}</div>
              <h2 className="section-title">{t.btnStart}</h2>
              <p className="section-sub">{t.heroSub.split(".")[0]}.</p>
            </motion.div>

            {/* Translation Progress Overlay */}
            {translating && (
              <div style={{
                background: "rgba(3, 7, 18, 0.8)",
                padding: "12px 24px",
                borderRadius: "30px",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                color: "#34d399",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "20px",
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                மொழியாக்கம் செய்யப்படுகிறது... (Translating predictions...)
              </div>
            )}

            <div className="detect-flex-layout" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              boxSizing: "border-box"
            }}>
              {/* Column 1: Input Leaf Source Only */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <motion.div className="glass-panel" variants={fadeUp} style={{ height: "fit-content" }}>
                  <div className="panel-header">
                    <Camera size={20} color="#22c55e" /> {t.inputTitle}
                  </div>
                  <ImageUpload setPrediction={setPrediction} />
                </motion.div>
              </div>

              {/* Column 2: Visual Diagnosis (Analysis, Top-3, Grad-CAM) */}
              <motion.div className="glass-panel" variants={fadeUp} style={{ height: "fit-content" }}>
                <div className="panel-header">
                  <Activity size={20} color="#22c55e" /> {t.visualDiagnosis}
                </div>

                <AnimatePresence mode="wait">
                  {!prediction ? (
                    <motion.div
                      className="result-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key="empty"
                    >
                      <FileText size={52} />
                      <p>{t.emptyResult}</p>
                    </motion.div>
                  ) : !prediction.success ? (
                    <motion.div
                      className="result-error-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      key="error"
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#f87171",
                        padding: "30px 20px",
                        borderRadius: "16px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                        margin: "20px 0"
                      }}
                    >
                      <AlertCircle size={44} color="#ef4444" />
                      <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{t.diagnosisBlocked}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: "#e5e7eb", lineHeight: "1.5" }}>{prediction.error}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                      key="result"
                      className="result-display-container"
                    >
                      {/* Circular/SVG Animated Confidence Gauge */}
                      <div className="gauge-score-wrapper" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        marginBottom: "20px",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "16px",
                        padding: "15px",
                        border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}>
                        <div style={{ position: "relative", width: "100px", height: "100px" }}>
                          <svg width="100" height="100">
                            <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              stroke={isHealthy ? "#22c55e" : "#ef4444"}
                              strokeWidth="8"
                              strokeDasharray="283"
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              style={{ transition: "stroke-dashoffset 1s ease-out" }}
                            />
                          </svg>
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center"
                      }}>
                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
                          {prediction.confidence}%
                        </span>
                        <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase" }}>Match</p>
                      </div>
                    </div>

                    <div className="status-labels" style={{ flex: "1", paddingLeft: "20px" }}>
                      <h3 style={{ margin: "0 0 5px 0", fontSize: "20px", fontWeight: "700" }}>
                        {formattedDisease}
                      </h3>
                      
                      {/* Dynamic Severity Badge */}
                      {severity && (
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          background: severity.bg,
                          border: "1px solid " + severity.border,
                          color: severity.color,
                          borderRadius: "30px",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          <HeartPulse size={13} />
                          {severity.label}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top-3 Predictions Bar Chart */}
                  {prediction.top_predictions && (
                    <div className="top-predictions-chart" style={{
                      marginBottom: "20px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "16px",
                      padding: "15px",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#a7f3d0" }}>
                        {t.topMatching}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {prediction.top_predictions.map((p, idx) => {
                          const transPName = (lang === "ta" && translatedPred?.top_predictions)
                            ? translatedPred.top_predictions[idx]?.disease
                            : p.disease;

                          return (
                            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#d1d5db" }}>
                                <span>{transPName?.replace(/___/g, " → ").replace(/_/g, " ")}</span>
                                <span style={{ fontWeight: "700" }}>{p.confidence}%</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{
                                  height: "100%",
                                  width: `${p.confidence}%`,
                                  background: idx === 0 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #6b7280, #4b5563)",
                                  borderRadius: "3px",
                                  transition: "width 1s ease-out"
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grad-CAM Activation Map */}
                  {prediction.gradcam_url && (
                    <div className="gradcam-container" style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "16px",
                      padding: "15px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      textAlign: "center"
                    }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#a7f3d0" }}>
                        {t.hotspotTitle}
                      </h4>
                      <div style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "space-between",
                        marginTop: "10px"
                      }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>Original Image</span>
                          <img
                            src={prediction.original_url}
                            alt="Original leaf"
                            style={{
                              width: "100%",
                              borderRadius: "12px",
                              border: "1.5px solid rgba(255, 255, 255, 0.1)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#34d399" }}>Infected Heatmap</span>
                          <img
                            src={prediction.gradcam_url}
                            alt="Gradcam activation map"
                            style={{
                              width: "100%",
                              borderRadius: "12px",
                              border: "1.5px solid rgba(16, 185, 129, 0.3)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                            }}
                          />
                        </div>
                      </div>
                      <p style={{ margin: "12px 0 0 0", fontSize: "11px", color: "#9ca3af", lineHeight: "1.4" }}>
                        {t.hotspotSub}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Column 3: Text Treatment Sheet (Description, Symptoms, Treatment, Prevention) */}
          <motion.div className="glass-panel" variants={fadeUp} style={{ height: "fit-content" }}>
            <div className="panel-header">
              <Stethoscope size={20} color="#22c55e" /> {t.treatmentSheet}
            </div>

            <AnimatePresence mode="wait">
              {!activePred ? (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280", fontSize: "14px" }}>
                  <FileText size={52} style={{ marginBottom: "15px", opacity: 0.5 }} />
                  <p>{t.emptyResult}</p>
                </div>
              ) : !activePred.success ? (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#f87171", fontSize: "14px" }}>
                  <AlertCircle size={44} style={{ marginBottom: "15px" }} />
                  <p>{t.diagnosisBlocked}</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}
                >
                  <div className="info-block">
                    <div className="info-block-title"><Info size={13} /> {t.descriptionTitle}</div>
                    <div className="info-block-body" style={{ color: "#d1d5db" }}>{activePred.description}</div>
                  </div>

                  {!isHealthy && (
                    <>
                      <div className="info-block">
                        <div className="info-block-title"><Activity size={13} /> {t.symptomsTitle}</div>
                        <div className="info-block-body">
                          <ul style={{ paddingLeft: "20px", color: "#d1d5db" }}>
                            {activePred.symptoms.map((s, i) => <li key={i} style={{ marginBottom: "5px" }}>{s}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="info-block">
                        <div className="info-block-title"><Stethoscope size={13} /> {t.treatmentTitle}</div>
                        <div className="info-block-body" style={{ color: "#d1d5db" }}>{activePred.treatment}</div>
                      </div>
                    </>
                  )}

                  <div className="info-block">
                    <div className="info-block-title"><ShieldCheck size={13} /> {t.preventionTitle}</div>
                    <div className="info-block-body" style={{ color: "#d1d5db" }}>{activePred.prevention}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ======================== CROPS ======================== */}
      <section className="crops-section" id="crops">
        <motion.div
          className="header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="section-label"><Leaf size={14} /> Supported</div>
          <h2 className="section-title">{t.supportedTitle}</h2>
          <p className="section-sub">{t.supportedSub}</p>
        </motion.div>

        <motion.div
          className="crops-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {crops.map((c, i) => (
            <motion.div key={i} className="crop-chip" variants={fadeUp}>
              <span className="crop-emoji">{c.emoji}</span>
              {c.name}
            </motion.div>
          ))}
        </motion.div>
      </section>
        </>
      )}

      {/* ======================== CHATBOT WIDGET ======================== */}

      {/* ======================== FOOTER ======================== */}
      <footer className="footer">
        <div className="footer-brand">
          <Leaf className="logo-icon" size={22} />
          LeafGuard AI
        </div>
        <div className="footer-info">
          <p>Powered by React • Flask • TensorFlow • MobileNetV2 • Gemini AI</p>
          <p>© 2026 MCA Mini Project</p>
        </div>
      </footer>
    </>
  );
}

export default App;