import { useState, useEffect } from "react";
import { Bell, ChevronRight, Camera, Leaf, History, BookOpen, Sun, Wind, CloudRain } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translationHelper";
import "./Home.css";

function Home({ user, history, onViewChange, onSelectPrediction, lang }) {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting(lang === "ta" ? "காலை வணக்கம்" : "Good morning");
    else if (hrs < 18) setGreeting(lang === "ta" ? "மதிய வணக்கம்" : "Good afternoon");
    else setGreeting(lang === "ta" ? "மாலை வணக்கம்" : "Good evening");
  }, [lang]);

  const recentScans = history.slice(0, 2);

  const tips = [
    {
      title: lang === "ta" ? "காலையில் நீர் பாய்ச்சவும்" : "Water in the morning",
      desc: lang === "ta" ? "காலையில் நீர் பாய்ச்சுவது இலைகள் உலர்வதற்கு உதவும், இதனால் பூஞ்சை தொற்று பரவாமல் தடுக்கலாம்." : "Watering early allows leaves to dry before nightfall, preventing fungal spores from germinating.",
      icon: <CloudRain size={20} />
    },
    {
      title: lang === "ta" ? "இலையின் அடிப்பகுதியைச் சோதிக்கவும்" : "Inspect leaf undersides",
      desc: lang === "ta" ? "பூச்சிகள் அல்லது பாக்டீரியா தொற்று பரவுவதற்கு முன்பே கண்டறிய வாராந்திர சோதனைகள் உதவும்." : "Weekly checkups help catch spider mites, bacterial lesions, or mold colonies before they spread.",
      icon: <Sun size={20} />
    },
    {
      title: lang === "ta" ? "காற்றோட்டத்தை உறுதிசெய்க" : "Maintain optimal airflow",
      desc: lang === "ta" ? "செடிகளுக்கு இடையே சரியான இடைவெளி இருக்க வேண்டும், இதனால் ஈரப்பதம் மற்றும் நோய்கள் பரவாது." : "Proper spacing between crop beds limits humidity buildup and prevents airborne diseases.",
      icon: <Wind size={20} />
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Home Header */}
      <header className="home-header">
        <div className="home-user">
          <span className="home-greeting">{greeting},</span>
          <span className="home-username">{user.username}</span>
        </div>
        <div className="home-header-actions">
          <button className="notif-btn" title="Notifications">
            <Bell size={20} />
          </button>
          {user.profile_image ? (
            <img src={user.profile_image} alt={user.username} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
          )}
        </div>
      </header>

      {/* Hero section */}
      <section className="hero-card fade-in-section">
        <span className="hero-tag">Botanical AI</span>
        <h1 className="hero-title">{t("detectDiseases", lang)}</h1>
        <p className="hero-subtitle">{t("heroSubtitle", lang)}</p>
        <button className="hero-button" onClick={() => onViewChange("scan")}>
          <Camera size={16} />
          {t("scanALeaf", lang)}
        </button>
        {/* Bespoke Botanical Leaf SVG Illustration */}
        <div className="hero-ill">
          <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M50 110 C50 110, 85 80, 85 45 C85 10, 50 5, 50 5 C50 5, 15 10, 15 45 C15 80, 50 110, 50 110 Z" fill="#6E8E7E" fillOpacity="0.25"/>
            <path d="M50 110 C50 110, 78 85, 78 50 C78 20, 50 15, 50 15 C50 15, 22 20, 22 50 C22 85, 50 110, 50 110 Z" fill="#6E8E7E" fillOpacity="0.75"/>
            <path d="M50 15V105" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 35C58 40 68 42 74 40" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 55C58 60 70 63 76 60" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 75C56 80 66 83 70 82" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 35C42 40 32 42 26 40" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 55C42 60 30 63 24 60" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 75C44 80 34 83 30 82" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="fade-in-section">
        <div className="section-title-row">
          <h3 className="section-heading">{t("quickActions", lang)}</h3>
        </div>
        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => onViewChange("scan")}>
            <div className="action-icon-wrap">
              <Camera size={18} />
            </div>
            <span className="action-title">{t("scan", lang)}</span>
          </div>
          <div className="action-card" onClick={() => onViewChange("myplants")}>
            <div className="action-icon-wrap">
              <Leaf size={18} />
            </div>
            <span className="action-title">{t("myPlants", lang)}</span>
          </div>
          <div className="action-card" onClick={() => onViewChange("history")}>
            <div className="action-icon-wrap">
              <History size={18} />
            </div>
            <span className="action-title">{t("history", lang)}</span>
          </div>
          <div className="action-card" onClick={() => onViewChange("guide")}>
            <div className="action-icon-wrap">
              <BookOpen size={18} />
            </div>
            <span className="action-title">{t("guides", lang)}</span>
          </div>
        </div>
      </section>

      {/* Recent Diagnoses section */}
      <section className="fade-in-section">
        <div className="section-title-row">
          <h3 className="section-heading">{t("recentDiagnoses", lang)}</h3>
          {history.length > 0 && (
            <button className="see-all-btn" onClick={() => onViewChange("history")}>
              {t("seeAll", lang)}
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          <div className="recent-empty-state">
            <p>{t("noDiagnoses", lang)}</p>
            <button className="hero-button" onClick={() => onViewChange("scan")} style={{ padding: "8px 16px", fontSize: "12px" }}>
              {t("scanFirstLeaf", lang)}
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {recentScans.map((scan, idx) => {
              const details = mapClassName(scan.disease);
              return (
                <div 
                  key={idx} 
                  className="recent-item" 
                  onClick={() => onSelectPrediction(scan)}
                >
                  <img 
                    src={scan.thumbnail_base64} 
                    alt={details.plantName} 
                    className="recent-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=120"; // fallback leaf image
                    }}
                  />
                  <div className="recent-info">
                    <span className="recent-plant-name">{details.plantName}</span>
                    <span className="recent-disease">{details.diseaseName}</span>
                  </div>
                  <div className="recent-meta">
                    <span className="recent-date">{scan.timestamp.split(" ")[0]}</span>
                    <span className="recent-confidence">{scan.confidence}% {t("match", lang)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Plant health tips */}
      <section className="fade-in-section" style={{ marginBottom: "20px" }}>
        <h3 className="section-heading" style={{ marginBottom: "12px" }}>{t("plantCareTips", lang)}</h3>
        <div className="tips-scroll-container">
          {tips.map((tip, i) => (
            <div key={i} className="tip-card">
              <div className="tip-img-wrap">
                {tip.icon}
              </div>
              <div className="tip-info">
                <span className="tip-title">{tip.title}</span>
                <p className="tip-desc">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
