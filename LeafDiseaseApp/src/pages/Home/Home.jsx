import { useState, useEffect } from "react";
import { Camera, Search, Activity, Sparkles, Sprout, ArrowRight, Leaf } from "lucide-react";
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
    <div className="home-cinematic-wrapper">
      
      {/* SCENE 01: Village Morning & Hero */}
      <section className="cinematic-scene scene-village">
        <div className="scene-overlay"></div>
        <div className="scene-content fade-in-up">
          <div className="farmer-badge">
            <Sprout size={16} />
            <span>{t("villageFarm", lang)}</span>
          </div>
          <h1 className="cinematic-title">
            {greeting}, <span className="farmer-name">{user.username}</span>
          </h1>
          <p className="cinematic-subtitle">
            {t("homeSubtitle", lang)}
          </p>
          <button className="btn btn-primary cinematic-cta" onClick={() => onViewChange("scan")}>
            <Camera size={20} />
            <span>{t("scanALeaf", lang)}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 02: The Flow - How it works for the farmer */}
      <section className="cinematic-scene scene-flow">
        <div className="scene-content">
          <h2 className="section-heading">{t("cropProtectionSystem", lang)}</h2>
          
          <div className="flow-steps-grid">
            
            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Camera size={24} color="#34d399" />
              </div>
              <h3>{t("takePhoto", lang)}</h3>
              <p>{t("takePhotoDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Search size={24} color="#60a5fa" />
              </div>
              <h3>{t("aiCheck", lang)}</h3>
              <p>{t("aiCheckDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Activity size={24} color="#f472b6" />
              </div>
              <h3>{t("attentionMapHome", lang)}</h3>
              <p>{t("attentionMapHomeDesc", lang)}</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Sparkles size={24} color="#fbbf24" />
              </div>
              <h3>{t("farmerReportHome", lang)}</h3>
              <p>{t("farmerReportHomeDesc", lang)}</p>
            </div>

          </div>
        </div>
      </section>

      {/* SCENE 03: Action / Knowledge Base */}
      <section className="cinematic-scene scene-action">
        <div className="scene-content">
          <div className="action-banner glass-card">
            <div className="action-text">
              <h2>{t("diseaseRepository", lang)}</h2>
              <p>{t("diseaseRepositoryDesc", lang)}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onViewChange("guide")}>
              <Leaf size={18} />
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
