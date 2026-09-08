import { useState } from "react";
import { 
  User, Lock, ArrowRight, Leaf, ShieldAlert, MapPin, Camera, 
  BrainCircuit, Eye, ShieldCheck, ChevronDown, Sparkles, Activity, 
  Layers, Scan, CheckCircle2, ArrowDown
} from "lucide-react";
import api from "../../api/api";
import "./Auth.css";

function Auth({ onLoginSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
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
              width = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          setProfileImage(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { username, password } 
      : { username, password, location, profile_image: profileImage };

    try {
      const response = await api.post(endpoint, payload);
      if (response.data.success) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          onLoginSuccess(response.data.user);
        } else {
          setIsLogin(true);
          setError("Account created successfully! Please login with your credentials.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Connection error. Please check your credentials or API connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToNextScene = (nextSceneId) => {
    const elem = document.getElementById(nextSceneId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="auth-master-wrapper">
      
      {/* Background ambient lighting */}
      <div className="auth-ambient-glow"></div>

      {!showForm ? (
        <div className="auth-landing-film">
          
          {/* Subtle Top Navigation Bar */}
          <nav className="film-nav">
            <div className="film-nav-brand">
              <div className="film-logo-icon">
                <Leaf size={22} color="var(--primary, #10b981)" />
              </div>
              <span className="film-brand-title">LEAFGUARD AI</span>
            </div>
            <div className="film-nav-actions">
              <button className="btn-film-secondary" onClick={() => setShowForm(true)}>
                Sign In
              </button>
              <button className="btn-film-primary" onClick={() => setShowForm(true)}>
                <span>Enter Workstation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </nav>

          {/* SCENE 01 — OPENING */}
          <section id="scene-01" className="film-scene scene-opening">
            <div className="scene-content">
              <div className="opening-badge fade-in-element">
                <span className="badge-pulse-dot"></span>
                <span>LEAFGUARD AI PRODUCT FILM</span>
              </div>
              
              <h1 className="opening-title slow-reveal">
                LEAFGUARD AI
              </h1>
              
              <p className="opening-subtitle slow-reveal-delay">
                "Every leaf carries a signal."
              </p>

              <div className="opening-scroll-hint fade-in-element" onClick={() => scrollToNextScene("scene-02")}>
                <span>Begin Film Journey</span>
                <ChevronDown size={20} className="bounce-arrow" />
              </div>
            </div>
          </section>

          {/* SCENE 02 — THE LEAF */}
          <section id="scene-02" className="film-scene scene-leaf">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 01 / 06</span>
              
              <div className="leaf-protagonist-wrapper">
                <div className="leaf-visual-frame">
                  <svg viewBox="0 0 200 200" className="botanical-leaf-svg">
                    <defs>
                      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.5" />
                      </linearGradient>
                      <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" 
                      fill="url(#leafGrad)" 
                      stroke="#34d399" 
                      strokeWidth="1.5" 
                      className="leaf-main-path"
                    />
                    <path d="M100 20 L100 180" stroke="url(#veinGrad)" strokeWidth="2" />
                    <path d="M100 60 C120 70 140 75 150 80" stroke="url(#veinGrad)" strokeWidth="1.2" fill="none" />
                    <path d="M100 60 C80 70 60 75 50 80" stroke="url(#veinGrad)" strokeWidth="1.2" fill="none" />
                    <path d="M100 100 C125 110 145 115 155 120" stroke="url(#veinGrad)" strokeWidth="1.2" fill="none" />
                    <path d="M100 100 C75 110 55 115 45 120" stroke="url(#veinGrad)" strokeWidth="1.2" fill="none" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#6ee7b7" strokeWidth="0.8" strokeDasharray="3 3" className="leaf-reticle" />
                  </svg>
                  <div className="leaf-aura-glow"></div>
                </div>
              </div>

              <h2 className="scene-statement">
                "One photograph can reveal what your plant is telling you."
              </h2>
              <p className="scene-subtext">
                Microscopic cellular structures retain the earliest signatures of fungal, bacterial, and viral pathology.
              </p>

              <button className="btn-scene-next" onClick={() => scrollToNextScene("scene-03")}>
                <span>Examine Visual Scan</span>
                <ArrowDown size={16} />
              </button>
            </div>
          </section>

          {/* SCENE 03 — AI SCANNING */}
          <section id="scene-03" className="film-scene scene-scanning">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 02 / 06</span>
              
              <div className="scan-canvas-wrapper">
                <div className="scan-leaf-frame">
                  <svg viewBox="0 0 200 200" className="scan-leaf-svg">
                    <path 
                      d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" 
                      fill="rgba(16, 185, 129, 0.15)" 
                      stroke="#10b981" 
                      strokeWidth="1.5" 
                    />
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="85" cy="85" r="14" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" className="hotspot-pulse" />
                    <circle cx="125" cy="120" r="10" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.5" className="hotspot-pulse-delay" />
                  </svg>
                  
                  {/* Scanning Laser Bar */}
                  <div className="laser-scan-bar"></div>
                  <div className="scan-hud-corner top-left"></div>
                  <div className="scan-hud-corner top-right"></div>
                  <div className="scan-hud-corner bottom-left"></div>
                  <div className="scan-hud-corner bottom-right"></div>
                </div>

                {/* Animated Technical Status Overlays */}
                <div className="scan-overlays-column">
                  <div className="scan-overlay-badge active">
                    <Camera size={16} />
                    <span>01 CAPTURING HIGH-RES SURFACE</span>
                  </div>
                  <div className="scan-overlay-badge active">
                    <Scan size={16} />
                    <span>02 EXAMINING CELLULAR STRUCTURE</span>
                  </div>
                  <div className="scan-overlay-badge active">
                    <BrainCircuit size={16} />
                    <span>03 ANALYZING NEURAL PATTERNS</span>
                  </div>
                </div>
              </div>

              <h2 className="scene-statement">
                Real-Time Neural Pattern Examination
              </h2>
              <p className="scene-subtext">
                MobileNetV2 visual feature maps sweep millions of parameters to identify morphological anomalies.
              </p>

              <button className="btn-scene-next" onClick={() => scrollToNextScene("scene-04")}>
                <span>View Visual Evidence</span>
                <ArrowDown size={16} />
              </button>
            </div>
          </section>

          {/* SCENE 04 — VISUAL INTELLIGENCE */}
          <section id="scene-04" className="film-scene scene-intelligence">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 03 / 06</span>
              
              <h2 className="scene-statement">
                Beneath the Surface: Visual Evidence
              </h2>
              <p className="scene-subtext">
                Grad-CAM neural attention overlays transform raw visual input into interpretable diagnostic heatmaps.
              </p>

              <div className="intelligence-dual-view">
                <div className="intel-card">
                  <div className="intel-card-header">
                    <Camera size={16} />
                    <span>ORIGINAL LEAF PHOTO</span>
                  </div>
                  <div className="intel-visual-box original-box">
                    <svg viewBox="0 0 160 160" className="intel-svg">
                      <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="#1b382b" stroke="#34d399" strokeWidth="1.5" />
                      <circle cx="70" cy="70" r="16" fill="#42201d" stroke="#f87171" strokeWidth="1" />
                    </svg>
                    <span className="intel-tag">RGB Input Layer</span>
                  </div>
                </div>

                <div className="intel-divider">
                  <div className="intel-arrow">→</div>
                </div>

                <div className="intel-card highlight-card">
                  <div className="intel-card-header">
                    <Eye size={16} color="#10b981" />
                    <span>AI VISUAL EVIDENCE (GRAD-CAM)</span>
                  </div>
                  <div className="intel-visual-box gradcam-box">
                    <svg viewBox="0 0 160 160" className="intel-svg">
                      <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="#0f291e" stroke="#10b981" strokeWidth="1.5" />
                      <radialGradient id="gradcamDemo" cx="45%" cy="45%" r="40%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                        <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="80%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                      </radialGradient>
                      <circle cx="70" cy="70" r="32" fill="url(#gradcamDemo)" />
                      <circle cx="70" cy="70" r="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                    <span className="intel-tag attention-tag">Neural Activation Hotspot</span>
                  </div>
                </div>
              </div>

              <button className="btn-scene-next" onClick={() => scrollToNextScene("scene-05")}>
                <span>See Demonstration Diagnosis</span>
                <ArrowDown size={16} />
              </button>
            </div>
          </section>

          {/* SCENE 05 — DIAGNOSIS REVEAL */}
          <section id="scene-05" className="film-scene scene-diagnosis-demo">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 04 / 06</span>
              
              <div className="demo-diagnosis-card glass-card">
                <div className="demo-watermark-banner">
                  <Sparkles size={14} />
                  <span>EXAMPLE ANALYSIS — DEMONSTRATION VIEW</span>
                </div>

                <div className="demo-card-body">
                  <div className="demo-result-header">
                    <div className="demo-condition-badge">
                      <ShieldAlert size={18} color="#ef4444" />
                      <span>Early Blight (Alternaria solani)</span>
                    </div>
                    <div className="demo-confidence">
                      <span className="conf-value">98.4%</span>
                      <span className="conf-label">Confidence Match</span>
                    </div>
                  </div>

                  <div className="demo-details-grid">
                    <div className="demo-detail-item">
                      <span className="detail-label">Host Plant</span>
                      <span className="detail-val">Tomato (Solanum lycopersicum)</span>
                    </div>
                    <div className="demo-detail-item">
                      <span className="detail-label">Severity Assessment</span>
                      <span className="detail-val warning-text">Stage 2 — Moderate Lesions</span>
                    </div>
                    <div className="demo-detail-item">
                      <span className="detail-label">Neural Verification</span>
                      <span className="detail-val success-text">Grad-CAM Hotspots Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="scene-statement">
                Instant Actionable Agronomic Intelligence
              </h2>
              <p className="scene-subtext">
                Every scan provides accurate classification, visual validation, and step-by-step treatment guidance.
              </p>

              <button className="btn-scene-next" onClick={() => scrollToNextScene("scene-06")}>
                <span>Explore The 5-Step Journey</span>
                <ArrowDown size={16} />
              </button>
            </div>
          </section>

          {/* SCENE 06 — HOW LEAFGUARD WORKS (CONNECTED SINGLE-FLOW JOURNEY) */}
          <section id="scene-06" className="film-scene scene-journey">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 05 / 06</span>
              
              <h2 className="scene-statement">
                How LeafGuard Decodes Plant Health
              </h2>
              <p className="scene-subtext">
                A connected, continuous 5-stage diagnostic pipeline from field photograph to treatment action.
              </p>

              <div className="connected-journey-container">
                <div className="journey-flow-line"></div>

                <div className="journey-step-node">
                  <div className="node-marker">01</div>
                  <div className="node-icon"><Camera size={22} /></div>
                  <div className="node-info">
                    <h4>01 CAPTURE</h4>
                    <p>Take a clear leaf photo via mobile camera or upload from gallery.</p>
                  </div>
                </div>

                <div className="journey-connector">↓</div>

                <div className="journey-step-node">
                  <div className="node-marker">02</div>
                  <div className="node-icon"><BrainCircuit size={22} /></div>
                  <div className="node-info">
                    <h4>02 ANALYZE</h4>
                    <p>MobileNetV2 neural networks examine cellular and morphological patterns.</p>
                  </div>
                </div>

                <div className="journey-connector">↓</div>

                <div className="journey-step-node">
                  <div className="node-marker">03</div>
                  <div className="node-icon"><Eye size={22} /></div>
                  <div className="node-info">
                    <h4>03 VISUALIZE</h4>
                    <p>Grad-CAM pinpoints exact neural attention hotspots on the leaf image.</p>
                  </div>
                </div>

                <div className="journey-connector">↓</div>

                <div className="journey-step-node">
                  <div className="node-marker">04</div>
                  <div className="node-icon"><Sparkles size={22} /></div>
                  <div className="node-info">
                    <h4>04 UNDERSTAND</h4>
                    <p>Review immediate condition diagnosis, percentage confidence, and symptoms.</p>
                  </div>
                </div>

                <div className="journey-connector">↓</div>

                <div className="journey-step-node">
                  <div className="node-marker">05</div>
                  <div className="node-icon"><ShieldCheck size={22} /></div>
                  <div className="node-info">
                    <h4>05 ACT</h4>
                    <p>Apply targeted organic remedies, treatment plans, and spray schedules.</p>
                  </div>
                </div>
              </div>

              <button className="btn-scene-next" onClick={() => scrollToNextScene("scene-07")}>
                <span>Proceed To Final Scene</span>
                <ArrowDown size={16} />
              </button>
            </div>
          </section>

          {/* SCENE 07 — FINAL CTA */}
          <section id="scene-07" className="film-scene scene-final-cta">
            <div className="scene-content">
              <span className="scene-number-tag">SCENE 06 / 06</span>
              
              <div className="final-cta-visual">
                <Leaf size={48} color="var(--primary, #10b981)" className="final-leaf-icon" />
              </div>

              <h2 className="final-headline">
                "Your plant is trying to tell you something."
              </h2>
              
              <p className="final-subheadline">
                Are you ready to listen?
              </p>

              <div className="final-cta-buttons">
                <button className="btn btn-primary cta-main-btn" onClick={() => setShowForm(true)}>
                  <span>SCAN A LEAF</span>
                  <Scan size={20} />
                </button>

                <button className="btn btn-secondary cta-sub-btn" onClick={() => setShowForm(true)}>
                  <span>SIGN IN TO WORKSTATION</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              <p className="final-footer-note">
                LeafGuard AI • Next-Gen Plant Pathology Platform
              </p>
            </div>
          </section>

        </div>
      ) : (
        /* VISUALLY DISTINCT CINEMATIC AUTHENTICATION WORKSTATION */
        <div className="auth-workstation-view fade-in-element">
          
          <div className="workstation-header-bar">
            <button className="btn-back-overview" onClick={() => setShowForm(false)}>
              ← Back to Product Overview
            </button>
            <div className="workstation-brand">
              <Leaf size={20} color="var(--primary, #10b981)" />
              <span>LEAFGUARD WORKSTATION</span>
            </div>
          </div>

          <div className="workstation-container">
            <div className="workstation-glass-panel">
              
              <div className="workstation-title-box">
                <div className="workstation-icon-badge">
                  <Activity size={24} color="var(--primary, #10b981)" />
                </div>
                <h2>Diagnostic System Access</h2>
                <p>Authenticate to access the deep neural scan engine and pathology archive.</p>
              </div>

              {/* Login / Register Tab Selector */}
              <div className="workstation-tabs">
                <button
                  type="button"
                  className={`workstation-tab ${isLogin ? "active" : ""}`}
                  onClick={() => { setIsLogin(true); setError(""); }}
                >
                  <User size={16} />
                  <span>SIGN IN</span>
                </button>
                <button
                  type="button"
                  className={`workstation-tab ${!isLogin ? "active" : ""}`}
                  onClick={() => { setIsLogin(false); setError(""); }}
                >
                  <ShieldCheck size={16} />
                  <span>CREATE ACCOUNT</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="workstation-form">
                {error && (
                  <div className="workstation-error-box">
                    <ShieldAlert size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="workstation-input-wrapper">
                  <label className="input-label">Username</label>
                  <div className="input-field-box">
                    <User size={18} className="field-icon" />
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="workstation-input-wrapper">
                  <label className="input-label">Password</label>
                  <div className="input-field-box">
                    <Lock size={18} className="field-icon" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="workstation-input-wrapper">
                      <label className="input-label">Location (City / Region)</label>
                      <div className="input-field-box">
                        <MapPin size={18} className="field-icon" />
                        <input
                          type="text"
                          placeholder="e.g. California, USA or Coimbatore, India"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="workstation-input-wrapper">
                      <label className="input-label">Profile Avatar (Optional)</label>
                      <div className="input-file-box">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="file-input-hidden"
                          id="avatarUpload"
                        />
                        <label htmlFor="avatarUpload" className="file-input-btn">
                          <Camera size={16} />
                          <span>{profileImage ? "Avatar Uploaded ✓" : "Choose Profile Photo"}</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary workstation-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>Authenticating System...</span>
                  ) : (
                    <>
                      <span>{isLogin ? "ENTER WORKSTATION" : "CREATE WORKSTATION ACCOUNT"}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="workstation-footer">
                <span>Protected by LeafGuard Encrypted Session Tokens</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Auth;
