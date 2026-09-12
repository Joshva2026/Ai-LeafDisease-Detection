import { useState, useEffect } from "react";
import { Camera, Search, CheckCircle, Leaf, ArrowRight, Sparkles, Sprout, CloudRain, Sun, Activity } from "lucide-react";
import { t } from "../../data/translations";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

function Home({ user, onViewChange, lang }) {
  const [greeting, setGreeting] = useState("காலை வணக்கம்");

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting(lang === "ta" ? "காலை வணக்கம்" : "Good morning");
    else if (hrs < 18) setGreeting(lang === "ta" ? "மதிய வணக்கம்" : "Good afternoon");
    else setGreeting(lang === "ta" ? "மாலை வணக்கம்" : "Good evening");
  }, [lang]);

  return (
    <div className="home-cinematic-wrapper">
      
      {/* SCENE 01: Village Morning & Hero */}
      <section className="cinematic-scene scene-village">
        <div className="scene-overlay"></div>
        <div className="scene-content fade-in-up">
          <div className="farmer-badge">
            <Sprout size={16} />
            <span>தமிழ்நாடு வயல்வெளி</span>
          </div>
          <h1 className="cinematic-title">
            {greeting}, <span className="farmer-name">{user.username}</span>
          </h1>
          <p className="cinematic-subtitle">
            உங்கள் பயிர்களை நோய்களிலிருந்து பாதுகாக்கும் AI தாவர மருத்துவர். 
            வயலில் இருந்து நேரடியாக AI ஆலோசனை பெறுங்கள்.
          </p>
          <button className="btn btn-primary cinematic-cta" onClick={() => onViewChange("scan")}>
            <Camera size={20} />
            <span>பயிரைப் பரிசோதிக்கவும்</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 02: The Flow - How it works for the farmer */}
      <section className="cinematic-scene scene-flow">
        <div className="scene-content">
          <h2 className="section-heading">பயிர் பாதுகாப்பு முறை</h2>
          
          <div className="flow-steps-grid">
            
            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Camera size={24} color="#34d399" />
              </div>
              <h3>1. படம் எடுங்கள்</h3>
              <p>நோய் தாக்கிய இலை அல்லது செடியின் பகுதியை தெளிவாக புகைப்படம் எடுக்கவும்.</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Search size={24} color="#60a5fa" />
              </div>
              <h3>2. AI பரிசோதனை</h3>
              <p>இலை சரியாக உள்ளதா என்பதை AI சரிபார்த்து MobileNetV2 மூலம் நோயை அறியும்.</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Activity size={24} color="#f472b6" />
              </div>
              <h3>3. கவன வரைபடம்</h3>
              <p>Grad-CAM தொழில்நுட்பம் மூலம் இலையின் எந்தப் பகுதியில் நோய் உள்ளது எனக்காட்டும்.</p>
            </div>

            <div className="flow-step-card glass-card">
              <div className="step-icon">
                <Sparkles size={24} color="#fbbf24" />
              </div>
              <h3>4. விவசாயி அறிக்கை</h3>
              <p>NVIDIA AI மூலம் முழுமையான தீர்வுகள் மற்றும் பரிந்துரைகளை தமிழில் பெறுங்கள்.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SCENE 03: Action / Knowledge Base */}
      <section className="cinematic-scene scene-action">
        <div className="scene-content">
          <div className="action-banner glass-card">
            <div className="action-text">
              <h2>பயிர் நோய்கள் பற்றிய களஞ்சியம்</h2>
              <p>38-க்கும் மேற்பட்ட நோய்களைப் பற்றி தமிழில் அறிந்துகொள்ளுங்கள்.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onViewChange("guide")}>
              <Leaf size={18} />
              <span>நூலகத்தைப் பார்க்க</span>
            </button>
          </div>
        </div>
      </section>

      <Footer lang={lang} onViewChange={onViewChange} />
    </div>
  );
}

export default Home;
