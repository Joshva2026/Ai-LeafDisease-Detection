import { useState, useEffect } from "react";
import { Camera, Sparkles, Sprout, ArrowRight, Leaf, Activity, CheckCircle } from "lucide-react";
import { t } from "../../data/translations";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

function Home({ user, onViewChange, lang }) {
  const [greeting, setGreeting] = useState(t("goodMorning", lang));

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting(t("goodMorning", lang));
    else if (hrs < 18) setGreeting(t("goodAfternoon", lang));
    else setGreeting(t("goodEvening", lang));
  }, [lang]);

  return (
    <div className="home-village-wrapper">
      {/* SCENE 01: Village Hero */}
      <section className="cinematic-scene scene-village">
        <div className="scene-overlay"></div>
        <div className="scene-content fade-in-up">
          <div className="farmer-badge">
            <Sprout size={18} />
            <span>{t("villageFarm", lang)}</span>
          </div>
          <h1 className="cinematic-title">
            {greeting}, <span className="farmer-name">{user?.username || "நண்பரே"}</span>
          </h1>
          <p className="cinematic-subtitle">
            {t("homeSubtitle", lang)}
          </p>
          <button className="btn btn-hero cinematic-cta" onClick={() => onViewChange("scan")}>
            <Camera size={22} />
            <span>{t("scanALeaf", lang)}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* SCENE 02: How It Works — 4 simple steps */}
      <section className="cinematic-scene scene-flow">
        <div className="scene-content">
          <h2 className="section-heading">{t("cropProtectionSystem", lang)}</h2>
          <p className="section-subtitle">
            {lang === "ta"
              ? "மூன்று எளிய ধাপங்களில் உங்கள் இலை நோயைக் கண்டறியவும்."
              : "Three simple steps to protect your crop."}
          </p>

          <div className="flow-steps-grid">
            <div className="flow-step-card glass-card step-1">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Camera size={26} color="#22c55e" />
              </div>
              <h3>{t("takePhoto", lang)}</h3>
              <p>{t("takePhotoDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card step-2">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Sparkles size={26} color="#f59e0b" />
              </div>
              <h3>{t("aiCheck", lang)}</h3>
              <p>{t("aiCheckDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card step-3">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Activity size={26} color="#3b82f6" />
              </div>
              <h3>{t("attentionMapHome", lang)}</h3>
              <p>{t("attentionMapHomeDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card step-4">
              <div className="step-number">4</div>
              <div className="step-icon">
                <CheckCircle size={26} color="#10b981" />
              </div>
              <h3>{t("farmerReportHome", lang)}</h3>
              <p>{t("farmerReportHomeDesc", lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 03: Quick Action / Knowledge Base */}
      <section className="cinematic-scene scene-action">
        <div className="scene-content">
          <div className="action-banner glass-card">
            <div className="action-text">
              <h2>{t("diseaseRepository", lang)}</h2>
              <p>{t("diseaseRepositoryDesc", lang)}</p>
            </div>
            <button className="btn btn-primary btn-hero" onClick={() => onViewChange("guide")}>
              <Leaf size={20} />
              <span>{t("viewLibrary", lang)}</span>
            </button>
          </div>
        </div>
      </section>

      <Footer lang={lang} onViewChange={onViewChange} />
    </div>
  );
}

export default Home;