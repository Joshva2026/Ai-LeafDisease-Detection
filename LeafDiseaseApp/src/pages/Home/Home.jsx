import { useState, useEffect } from "react";
import { Camera, Search, Activity, CheckCircle, Leaf, History, ArrowRight } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
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

  const recentScans = history.slice(0, 3);

  return (
    <>
      <div className="home-page-wrapper slide-section">
        
        {/* =======================================
            MOBILE HOME (App-like, compact)
            ======================================= */}
        <div className="mobile-home mobile-only">
          <header className="m-header">
            <div className="m-user-info">
              <span className="m-greeting">{greeting}, {user.username}</span>
              <h1 className="m-title">Your plant's health,<br/>decoded.</h1>
            </div>
            {user.profile_image ? (
              <img src={user.profile_image} alt={user.username} className="m-avatar" />
            ) : (
              <div className="m-avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
            )}
          </header>

          <div className="m-actions fade-in-section">
            <button className="m-primary-action" onClick={() => onViewChange("scan")}>
              <div className="m-action-icon"><Camera size={24} /></div>
              <div className="m-action-text">
                <span className="m-action-title">Scan a Leaf</span>
                <span className="m-action-sub">Detect diseases instantly</span>
              </div>
              <ArrowRight size={20} className="m-action-arrow" />
            </button>
          </div>

          <div className="m-section fade-in-section">
            <div className="m-section-header">
              <h3 className="m-section-title">Plant Health Overview</h3>
            </div>
            <div className="m-health-cards">
              <div className="m-health-card">
                <span className="m-hc-value">{history.length}</span>
                <span className="m-hc-label">Total Scans</span>
              </div>
              <div className="m-health-card healthy">
                <span className="m-hc-value">{history.filter(h => mapClassName(h.disease).isHealthy).length}</span>
                <span className="m-hc-label">Healthy</span>
              </div>
              <div className="m-health-card danger">
                <span className="m-hc-value">{history.filter(h => !mapClassName(h.disease).isHealthy).length}</span>
                <span className="m-hc-label">Needs Care</span>
              </div>
            </div>
          </div>

          <div className="m-section fade-in-section">
            <div className="m-section-header">
              <h3 className="m-section-title">Recent Diagnoses</h3>
              <button className="m-view-all" onClick={() => onViewChange("history")}>See All</button>
            </div>
            
            {recentScans.length > 0 ? (
              <div className="m-recent-list">
                {recentScans.map((scan, idx) => {
                  const details = mapClassName(scan.disease);
                  return (
                    <div key={idx} className="m-recent-item glass-card" onClick={() => onSelectPrediction(scan)}>
                      <img 
                        src={scan.image_url} 
                        alt={details.name} 
                        className="m-recent-img" 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=100"; }}
                      />
                      <div className="m-recent-info">
                        <h4 className="m-recent-name">{details.displayName}</h4>
                        <span className={`m-recent-status ${details.isHealthy ? 'healthy' : 'danger'}`}>
                          {details.isHealthy ? 'Healthy' : 'Condition Detected'}
                        </span>
                      </div>
                      <div className="m-recent-conf">
                        {Math.round(scan.confidence)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="m-empty-state glass-card">
                <History size={32} />
                <p>No recent scans.</p>
                <span>Tap "Scan a Leaf" to get started.</span>
              </div>
            )}
          </div>
        </div>


        {/* =======================================
            DESKTOP HOME (Premium Cinematic)
            ======================================= */}
        <div className="desktop-home desktop-only">
          <section className="d-hero fade-in-section">
            <div className="d-hero-content">
              <div className="d-hero-badge">
                <span className="d-badge-dot"></span> LeafGuard Intelligence Platform
              </div>
              <h1 className="d-hero-title">Understand<br/>Every Leaf.</h1>
              <p className="d-hero-subtitle">
                AI-powered plant disease detection with visual intelligence. 
                Identify 38 distinct crop conditions instantly using deep learning and actionable heatmaps.
              </p>
              <div className="d-hero-actions">
                <button className="d-btn-primary" onClick={() => onViewChange("scan")}>
                  <Camera size={20} />
                  Scan a Leaf
                </button>
                <button className="d-btn-secondary" onClick={() => onViewChange("about")}>
                  <Leaf size={20} />
                  Explore Plant Guide
                </button>
              </div>
            </div>
            
            <div className="d-hero-visual">
              <div className="d-visual-card glass-card">
                {/* Mockup of a scanning UI using pure SVG and CSS */}
                <div className="d-visual-svg-container">
                  <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="d-visual-leaf-svg">
                    <defs>
                      <linearGradient id="leafGrad" x1="100" y1="10" x2="100" y2="230" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#065f46" stopOpacity="0.9"/>
                      </linearGradient>
                      <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="heatPulse" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {/* Shadow for depth */}
                    <path d="M104 234 C104 234, 174 174, 174 104 C174 34, 104 24, 104 24 C104 24, 34 34, 34 104 C34 174, 104 234, 104 234 Z" fill="#022c22" fillOpacity="0.4" filter="url(#aiGlow)"/>
                    {/* Main Leaf Body */}
                    <path d="M100 230 C100 230, 170 170, 170 100 C170 30, 100 20, 100 20 C100 20, 30 30, 30 100 C30 170, 100 230, 100 230 Z" fill="url(#leafGrad)"/>
                    {/* Leaf highlight */}
                    <path d="M100 230 C100 230, 156 180, 156 110 C156 50, 100 40, 100 40 C100 40, 44 50, 44 110 C44 180, 100 230, 100 230 Z" fill="#10b981" fillOpacity="0.3"/>
                    {/* Leaf Veins */}
                    <path d="M100 30V220" stroke="#ecfdf5" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                    <path d="M100 70C116 80 136 84 148 80" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    <path d="M100 110C116 120 140 126 152 120" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    <path d="M100 150C112 160 132 166 140 164" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    <path d="M100 70C84 80 64 84 52 80" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    <path d="M100 110C84 120 60 126 48 120" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    <path d="M100 150C88 160 68 166 60 164" stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                    
                    {/* Grad-CAM Inspired Heatmap Blurbs */}
                    <circle cx="130" cy="100" r="25" fill="#f59e0b" fillOpacity="0.6" filter="url(#heatPulse)" className="heat-pulse-1" />
                    <circle cx="70" cy="140" r="20" fill="#ef4444" fillOpacity="0.5" filter="url(#heatPulse)" className="heat-pulse-2" />
                    
                    {/* AI Data Nodes */}
                    <circle cx="130" cy="100" r="4" fill="#fef3c7" filter="url(#aiGlow)" className="ai-node" />
                    <circle cx="70" cy="140" r="4" fill="#fee2e2" filter="url(#aiGlow)" className="ai-node" style={{animationDelay: "1s"}} />
                    <circle cx="100" cy="70" r="4" fill="#ecfdf5" filter="url(#aiGlow)" className="ai-node" style={{animationDelay: "0.5s"}} />
                  </svg>
                  
                  {/* AI Scanning Beam */}
                  <div className="d-visual-scanner-bar"></div>
                  
                  {/* Floating AI Analysis Card */}
                  <div className="floating-ai-card glass-card">
                    <span className="fac-title">AI ANALYSIS</span>
                    <span className="fac-desc">Leaf structure mapped</span>
                    <div className="fac-conf">
                      <span className="fac-dot"></span> 98.5% Confidence
                    </div>
                  </div>
                </div>
                <div className="d-visual-stats">
                  <div className="d-stat-row">
                    <span>Analysis Complete</span>
                    <span className="d-stat-conf">98.5%</span>
                  </div>
                  <div className="d-stat-bar"><div className="d-stat-fill"></div></div>
                </div>
              </div>
            </div>
          </section>

          <section className="d-features fade-in-section">
            <div className="d-section-header">
              <h2>Intelligent features designed for precision</h2>
              <p>Everything you need to monitor, diagnose, and treat your crops.</p>
            </div>
            
            <div className="d-feature-grid">
              <div className="d-feature-card glass-card">
                <div className="d-fc-icon"><Camera /></div>
                <h3>Visual Intelligence</h3>
                <p>Upload or snap a photo of a leaf to instantly detect underlying health conditions.</p>
              </div>
              <div className="d-feature-card glass-card">
                <div className="d-fc-icon"><Activity /></div>
                <h3>MobileNetV2 Core</h3>
                <p>Powered by a fine-tuned Convolutional Neural Network trained on thousands of agricultural samples.</p>
              </div>
              <div className="d-feature-card glass-card">
                <div className="d-fc-icon"><Search /></div>
                <h3>Grad-CAM Heatmaps</h3>
                <p>Don't just get a diagnosis. See exactly which regions of the leaf triggered the AI's decision.</p>
              </div>
              <div className="d-feature-card glass-card">
                <div className="d-fc-icon"><CheckCircle /></div>
                <h3>Actionable Treatments</h3>
                <p>Receive immediate, agronomic advice and prevention strategies for detected diseases.</p>
              </div>
            </div>
          </section>
        </div>

      </div>
      
      {/* Footer only on desktop */}
      <div className="desktop-only"><Footer /></div>
    </>
  );
}

export default Home;
