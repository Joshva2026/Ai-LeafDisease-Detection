import { useState, useEffect } from "react";
import { Camera, Search, Activity, CheckCircle, Leaf, History, ArrowRight, Sparkles, BookOpen, Bot, ShieldCheck } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
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

  const recentScans = history.slice(0, 4);
  const healthyScansCount = history.filter(h => mapClassName(h.disease).isHealthy).length;
  const careScansCount = history.filter(h => !mapClassName(h.disease).isHealthy).length;

  return (
    <>
      <div className="home-page-wrapper slide-section">
        
        {/* COMMAND CENTER HEADER */}
        <header className="hub-command-header fade-in-section">
          <div className="hub-user-badge">
            <span className="hub-live-dot"></span>
            <span>PLANT INTELLIGENCE COMMAND CENTER</span>
          </div>

          <h1 className="hub-welcome-title">
            {greeting}, <span className="user-name-highlight">{user.username}</span>
          </h1>

          <p className="hub-welcome-sub">
            Your field diagnostic workspace is active. Manage scans, track plant health trends, and consult AI pathology intelligence.
          </p>
        </header>

        {/* CENTRAL CONNECTED INTELLIGENCE MODULES GRID */}
        <section className="hub-network-section fade-in-section">
          
          {/* Central Hub Node */}
          <div className="hub-central-node glass-card">
            <div className="central-leaf-aura">
              <svg viewBox="0 0 160 160" className="central-leaf-svg">
                <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
                <path d="M80 15 L80 145" stroke="#6ee7b7" strokeWidth="2" />
                <circle cx="80" cy="80" r="30" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" className="hub-rotate-ring" />
              </svg>
            </div>
            
            <div className="hub-central-info">
              <span className="hub-status-tag">CORE DIAGNOSTIC ENGINE</span>
              <h3>LeafGuard AI Workstation</h3>
              <p>Connected to 38 crop pathology neural classifiers</p>

              <div className="hub-cta-group" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
                <button className="btn btn-primary hub-scan-cta" onClick={() => onViewChange("scan")}>
                  <Camera size={18} />
                  <span>START SCANNING</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary hub-howto-cta" onClick={() => onViewChange("howto")}>
                  <BookOpen size={18} />
                  <span>HOW IT WORKS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected Intelligence Modules */}
          <div className="hub-modules-grid">
            
            {/* Module 1: The Leaf Journey */}
            <div className="hub-module-card glass-card" onClick={() => onViewChange("howto")}>
              <div className="module-header">
                <div className="module-icon-box"><Sparkles size={20} color="#10b981" /></div>
                <span className="module-num">01</span>
              </div>
              <h4>THE LEAF JOURNEY</h4>
              <p>Explore the 6-stage interactive visual pathology process.</p>
              <div className="module-footer">
                <span>View Journey</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Module 2: Leaf Memory Archive */}
            <div className="hub-module-card glass-card" onClick={() => onViewChange("history")}>
              <div className="module-header">
                <div className="module-icon-box"><History size={20} color="#34d399" /></div>
                <span className="module-num">02</span>
              </div>
              <h4>LEAF MEMORY ARCHIVE</h4>
              <p>{history.length} preserved scan records & Grad-CAM timelines.</p>
              <div className="module-footer">
                <span>Browse Archive</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Module 3: Botanical Intelligence Library */}
            <div className="hub-module-card glass-card" onClick={() => onViewChange("guide")}>
              <div className="module-header">
                <div className="module-icon-box"><BookOpen size={20} color="#f59e0b" /></div>
                <span className="module-num">03</span>
              </div>
              <h4>BOTANICAL ARCHIVE</h4>
              <p>Search plant species, symptom guides, and organic remedies.</p>
              <div className="module-footer">
                <span>Open Library</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Module 4: AI Doctor Workspace */}
            <div className="hub-module-card glass-card" onClick={() => onViewChange("profile")}>
              <div className="module-header">
                <div className="module-icon-box"><Bot size={20} color="#6366f1" /></div>
                <span className="module-num">04</span>
              </div>
              <h4>AGRICULTURAL AI ROOM</h4>
              <p>Consult AI agronomic assistant for crop care advice.</p>
              <div className="module-footer">
                <span>Enter Workspace</span>
                <ArrowRight size={14} />
              </div>
            </div>

          </div>

        </section>

        {/* RECENT SCAN MEMORY & HEALTH METRICS SECTION */}
        <section className="hub-metrics-section fade-in-section">
          <div className="hub-metrics-header">
            <h3>Field Pathology Status</h3>
            <span className="hub-subtitle">Real-time breakdown of analyzed specimen history</span>
          </div>

          <div className="hub-stats-row">
            <div className="stat-card glass-card">
              <span className="stat-num">{history.length}</span>
              <span className="stat-lbl">Total Scans Executed</span>
            </div>

            <div className="stat-card glass-card healthy-stat">
              <span className="stat-num">{healthyScansCount}</span>
              <span className="stat-lbl">Healthy Specimens</span>
            </div>

            <div className="stat-card glass-card care-stat">
              <span className="stat-num">{careScansCount}</span>
              <span className="stat-lbl">Conditions Diagnosed</span>
            </div>
          </div>

          {/* Recent Scans Showcase */}
          {recentScans.length > 0 && (
            <div className="hub-recent-showcase">
              <h4>Recent Leaf Memory Specimens</h4>
              <div className="recent-cards-grid">
                {recentScans.map((scan, idx) => {
                  const details = mapClassName(scan.disease);
                  return (
                    <div key={idx} className="recent-specimen-card glass-card" onClick={() => onSelectPrediction(scan)}>
                      <div className="specimen-img-box">
                        <img 
                          src={getMediaUrl(scan.original_url)} 
                          alt={details.displayName} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=200";
                          }}
                        />
                      </div>
                      <div className="specimen-info">
                        <h5>{details.displayName}</h5>
                        <span className={`specimen-status ${details.isHealthy ? 'healthy' : 'danger'}`}>
                          {details.isHealthy ? 'Healthy Leaf' : 'Pathology Detected'}
                        </span>
                        <div className="specimen-conf">
                          <span>{Math.round(scan.confidence)}% Match</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      </div>

      <div className="desktop-only"><Footer /></div>
    </>
  );
}

export default Home;
