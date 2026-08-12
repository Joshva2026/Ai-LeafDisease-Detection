import { useState, useEffect } from "react";
import { Bell, ChevronRight, Camera, Leaf, History, BookOpen, Sun, Wind, CloudRain, Activity, CheckCircle, Search, Droplet, Sprout } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translationHelper";
import Footer from "../../components/Footer/Footer";
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

  const steps = [
    { num: "01", title: "Capture", desc: "Upload or capture a clear image of a plant leaf.", icon: <Camera size={24} /> },
    { num: "02", title: "Analyze", desc: "Our deep learning model analyzes visual patterns in the leaf.", icon: <Search size={24} /> },
    { num: "03", title: "Detect", desc: "LeafGuard identifies the most likely disease or healthy condition.", icon: <Activity size={24} /> },
    { num: "04", title: "Understand", desc: "View confidence information and visual heatmap analysis.", icon: <CheckCircle size={24} /> }
  ];

  const features = [
    { title: "AI Disease Detection", desc: "Fast image-based disease classification.", icon: <Activity size={24}/> },
    { title: "Visual Heatmap", desc: "Understand which areas of the leaf influenced the prediction.", icon: <Search size={24}/> },
    { title: "38 Disease Classes", desc: "Support for a wide range of crop and plant conditions.", icon: <Leaf size={24}/> },
    { title: "Simple Workflow", desc: "Upload → Analyze → Diagnose.", icon: <ChevronRight size={24}/> },
    { title: "Mobile Ready", desc: "Designed to work naturally on phones, tablets and desktops.", icon: <BookOpen size={24}/> },
    { title: "Farmer Friendly", desc: "Clear results instead of complicated technical output.", icon: <Sun size={24}/> }
  ];

  return (
    <>
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
        <section id="hero" className="hero-card slide-section fade-in-section">
          <div className="hero-content-wrapper">
            <div className="hero-text-col">
              <span className="hero-tag">Botanical AI</span>
              <h1 className="hero-title">Protect Every Leaf with AI</h1>
              <p className="hero-subtitle">Detect plant diseases from leaf images using deep learning and intelligent visual analysis.</p>
              
              <div className="hero-trust-strip">
                <span>✓ AI Powered</span>
                <span>✓ 38 Plant Disease Classes</span>
                <span>✓ Deep Learning</span>
                <span>✓ Visual Heatmap Analysis</span>
              </div>
              
              <div className="hero-buttons">
                <button className="hero-button primary" onClick={() => onViewChange("scan")}>
                  <Camera size={18} />
                  Scan a Leaf
                </button>
                <button className="hero-button secondary" onClick={() => onViewChange("about")}>
                  Explore LeafGuard
                </button>
              </div>
            </div>
            <div className="hero-visual-col">
              {/* Bespoke Botanical Leaf SVG Illustration */}
              <div className="hero-ill">
                <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", animation: "float 6s ease-in-out infinite" }}>
                  <path d="M50 110 C50 110, 85 80, 85 45 C85 10, 50 5, 50 5 C50 5, 15 10, 15 45 C15 80, 50 110, 50 110 Z" fill="#6E8E7E" fillOpacity="0.25"/>
                  <path d="M50 110 C50 110, 78 85, 78 50 C78 20, 50 15, 50 15 C50 15, 22 20, 22 50 C22 85, 50 110, 50 110 Z" fill="#6E8E7E" fillOpacity="0.75"/>
                  <path d="M50 15V105" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 35C58 40 68 42 74 40" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 55C58 60 70 63 76 60" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 75C56 80 66 83 70 82" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 35C42 40 32 42 26 40" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 55C42 60 30 63 24 60" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M50 75C44 80 34 83 30 82" stroke="#FAF9F5" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Glowing nodes overlay */}
                  <circle cx="50" cy="35" r="2" fill="#4ade80" />
                  <circle cx="50" cy="55" r="2" fill="#4ade80" />
                  <circle cx="50" cy="75" r="2" fill="#4ade80" />
                  <circle cx="70" cy="82" r="1.5" fill="#4ade80" opacity="0.6"/>
                  <circle cx="30" cy="82" r="1.5" fill="#4ade80" opacity="0.6"/>
                  <circle cx="76" cy="60" r="1.5" fill="#4ade80" opacity="0.6"/>
                  <circle cx="24" cy="60" r="1.5" fill="#4ade80" opacity="0.6"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="slide-section fade-in-section">
          <div className="section-header-center">
            <h2 className="section-heading-large">How LeafGuard AI Works</h2>
            <p className="section-subtext">A simple, effective workflow to secure your plant's health.</p>
          </div>
          
          <div className="steps-grid">
            {steps.map((s, idx) => (
              <div key={idx} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon-wrap">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why LeafGuard (Features) */}
        <section className="slide-section fade-in-section">
          <div className="section-header-center">
            <h2 className="section-heading-large">Built for Smarter Plant Health</h2>
            <p className="section-subtext">Powerful features designed to make disease identification fast and accessible.</p>
          </div>
          
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Visual Storytelling */}
        <section className="slide-section fade-in-section">
          <div className="story-card">
            <div className="story-text">
              <h2 className="section-heading-large">From Leaf Image to Intelligent Diagnosis</h2>
              <p className="section-subtext">LeafGuard leverages a deep learning MobileNetV2 architecture fine-tuned on 38 unique plant conditions. By passing your image through the convolutional neural network, we extract visual features and produce a Grad-CAM heatmap showing exactly which leaf regions triggered the AI decision.</p>
            </div>
            <div className="story-flow">
              <div className="story-node"><Camera size={28}/><span>Leaf Image</span></div>
              <div className="story-arrow">→</div>
              <div className="story-node"><Activity size={28}/><span>AI Analysis</span></div>
              <div className="story-arrow">→</div>
              <div className="story-node"><Search size={28}/><span>Disease Detection</span></div>
              <div className="story-arrow">→</div>
              <div className="story-node"><CheckCircle size={28}/><span>Actionable Understanding</span></div>
            </div>
          </div>
        </section>

        {/* Explore Crops Grid */}
        <section className="slide-section fade-in-section">
           <div className="section-header-center">
            <h2 className="section-heading-large">Explore Supported Plant Conditions</h2>
            <p className="section-subtext">LeafGuard currently supports 38 specific plant diseases and healthy classes across 14 major crops.</p>
          </div>
          
          <div className="crops-grid-display">
            {/* Hardcoded sample representations of the actual 38 classes */}
            <div className="crop-card"><Leaf size={32}/> <span>Apple</span> <small>4 conditions</small></div>
            <div className="crop-card"><Sun size={32}/> <span>Corn</span> <small>4 conditions</small></div>
            <div className="crop-card"><Droplet size={32}/> <span>Grape</span> <small>4 conditions</small></div>
            <div className="crop-card"><Sprout size={32}/> <span>Tomato</span> <small>10 conditions</small></div>
            <div className="crop-card"><Leaf size={32}/> <span>Potato</span> <small>3 conditions</small></div>
            <div className="crop-card"><CloudRain size={32}/> <span>Cherry</span> <small>2 conditions</small></div>
            <div className="crop-card"><Sun size={32}/> <span>Peach</span> <small>2 conditions</small></div>
            <div className="crop-card"><Wind size={32}/> <span>Pepper</span> <small>2 conditions</small></div>
          </div>
        </section>

      </div>
      
      <Footer />
    </>
  );
}

export default Home;
