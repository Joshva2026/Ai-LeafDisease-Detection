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

        {/* Desktop Hero section */}
        <section id="hero" className="hero-card slide-section fade-in-section desktop-only">
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

        {/* Mobile Premium Home Section */}
        <section className="mobile-only mobile-premium-home fade-in-section">
          <div className="mobile-brand-header">
            <h1 className="mobile-brand-title">Protect your plants with AI.</h1>
            <p className="mobile-brand-subtitle">Detect leaf diseases, understand symptoms and get practical treatment guidance.</p>
          </div>
          
          <div className="mobile-hero-3d">
            <div className="mobile-3d-leaf-container">
              <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mobile-3d-leaf">
                <defs>
                  <linearGradient id="leafGrad" x1="50" y1="5" x2="50" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#065f46" stopOpacity="0.9"/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* 3D Depth shadows */}
                <path d="M52 112 C52 112, 87 82, 87 47 C87 12, 52 7, 52 7 C52 7, 17 12, 17 47 C17 82, 52 112, 52 112 Z" fill="#022c22" fillOpacity="0.4" filter="url(#glow)"/>
                <path d="M50 110 C50 110, 85 80, 85 45 C85 10, 50 5, 50 5 C50 5, 15 10, 15 45 C15 80, 50 110, 50 110 Z" fill="url(#leafGrad)"/>
                <path d="M50 110 C50 110, 78 85, 78 50 C78 20, 50 15, 50 15 C50 15, 22 20, 22 50 C22 85, 50 110, 50 110 Z" fill="#10b981" fillOpacity="0.4"/>
                <path d="M50 15V105" stroke="#ecfdf5" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
                <path d="M50 35C58 40 68 42 74 40" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <path d="M50 55C58 60 70 63 76 60" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <path d="M50 75C56 80 66 83 70 82" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <path d="M50 35C42 40 32 42 26 40" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <path d="M50 55C42 60 30 63 24 60" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <path d="M50 75C44 80 34 83 30 82" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                {/* Glowing Nodes */}
                <circle cx="50" cy="35" r="2.5" fill="#a7f3d0" filter="url(#glow)" className="pulse-node" />
                <circle cx="50" cy="55" r="2.5" fill="#a7f3d0" filter="url(#glow)" className="pulse-node" style={{animationDelay: "0.5s"}} />
                <circle cx="50" cy="75" r="2.5" fill="#a7f3d0" filter="url(#glow)" className="pulse-node" style={{animationDelay: "1s"}} />
              </svg>
            </div>
          </div>

          <div className="mobile-primary-actions">
            <button className="mobile-btn-primary" onClick={() => onViewChange("scan")}>
              <div className="mobile-btn-icon"><Camera size={20} /></div>
              Scan a Leaf
            </button>
            <button className="mobile-btn-secondary" onClick={() => onViewChange("history")}>
              View History
            </button>
          </div>

          <div className="mobile-stats-card glass-card">
            <h3 className="mobile-section-title">Your Plant Health</h3>
            <div className="mobile-stats-grid">
              <div className="m-stat">
                <span className="m-stat-val">{history.length}</span>
                <span className="m-stat-lbl">Total Scans</span>
              </div>
              <div className="m-stat">
                <span className="m-stat-val" style={{color: "var(--color-healthy)"}}>
                  {history.filter(h => mapClassName(h.disease).isHealthy).length}
                </span>
                <span className="m-stat-lbl">Healthy</span>
              </div>
              <div className="m-stat">
                <span className="m-stat-val" style={{color: "var(--color-danger)"}}>
                  {history.filter(h => !mapClassName(h.disease).isHealthy).length}
                </span>
                <span className="m-stat-lbl">Diseases</span>
              </div>
            </div>
          </div>

          <div className="mobile-how-it-works">
            <h3 className="mobile-section-title">How LeafGuard Works</h3>
            <div className="m-steps-vertical">
              <div className="m-step-card glass-card">
                <div className="m-step-num">01</div>
                <div className="m-step-info">
                  <h4>Capture</h4>
                  <p>Upload a clear leaf image.</p>
                </div>
              </div>
              <div className="m-step-card glass-card">
                <div className="m-step-num">02</div>
                <div className="m-step-info">
                  <h4>AI Analysis</h4>
                  <p>Deep learning detects patterns.</p>
                </div>
              </div>
              <div className="m-step-card glass-card">
                <div className="m-step-num">03</div>
                <div className="m-step-info">
                  <h4>Plant Care</h4>
                  <p>Get actionable treatment steps.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-recent-diagnosis">
            <h3 className="mobile-section-title">Recent Diagnosis</h3>
            {recentScans.length > 0 ? (
              <div className="m-recent-list">
                {recentScans.map((scan, idx) => {
                  const details = mapClassName(scan.disease);
                  return (
                    <div key={idx} className="m-recent-item glass-card" onClick={() => onSelectPrediction(scan)}>
                      <img src={scan.image_url} alt="scan" className="m-recent-img" />
                      <div className="m-recent-info">
                        <h5>{details.name}</h5>
                        <span className={`severity-pill ${details.isHealthy ? 'healthy' : 'danger'}`}>
                          {details.isHealthy ? 'Healthy' : 'Diseased'}
                        </span>
                      </div>
                      <div className="m-recent-conf">{(scan.confidence).toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="m-empty-history glass-card">
                <History size={24} color="var(--text-light)" />
                <p>No scans yet</p>
                <small>Your recent AI diagnoses will appear here.</small>
              </div>
            )}
          </div>
        </section>

        {/* How It Works (Desktop) */}
        <section className="slide-section fade-in-section desktop-only-block">
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

        {/* Why LeafGuard (Features) (Desktop) */}
        <section className="slide-section fade-in-section desktop-only-block">
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
        
        {/* Visual Storytelling (Desktop) */}
        <section className="slide-section fade-in-section desktop-only-block">
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

        {/* Explore Crops Grid (Desktop) */}
        <section className="slide-section fade-in-section desktop-only-block">
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
