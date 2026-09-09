import { useState } from "react";
import { 
  User, Lock, ArrowRight, Leaf, ShieldAlert, MapPin, Camera, 
  BrainCircuit, Eye, ShieldCheck, ChevronDown, Sparkles, Activity, 
  Layers, Scan, CheckCircle2, ArrowDown, Play
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

  // PHASE 2 TRANSITION STATE
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStep, setTransitionStep] = useState(1);

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
              height = MAX_SIZE;
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
          const userObj = response.data.user;
          localStorage.setItem("user", JSON.stringify(userObj));
          
          // TRIGGER PHASE 2 POST-LOGIN TRANSITION FILM
          setIsTransitioning(true);
          setTransitionStep(1);

          setTimeout(() => {
            setTransitionStep(2);
          }, 1400);

          setTimeout(() => {
            setTransitionStep(3);
          }, 2800);

          setTimeout(() => {
            onLoginSuccess(userObj);
          }, 4200);

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

  return (
    <div className="auth-master-wrapper">
      
      {/* PHASE 2 — POST LOGIN CINEMATIC TRANSITION FILM OVERLAY */}
      {isTransitioning && (
        <div className="post-login-transition-film">
          <div className="transition-leaf-silhouette">
            <svg viewBox="0 0 200 200" className="transition-leaf-svg">
              <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="none" stroke="#10b981" strokeWidth="2" className="trans-leaf-path" />
              <path d="M100 20 L100 180" stroke="#34d399" strokeWidth="2" />
            </svg>
            <div className="transition-laser-sweep"></div>
          </div>

          <div className="transition-text-container">
            {transitionStep === 1 && (
              <h2 className="trans-text slow-reveal">"BEFORE WE DIAGNOSE A PLANT..."</h2>
            )}
            {transitionStep === 2 && (
              <h2 className="trans-text slow-reveal">"...WE LISTEN TO ITS LEAF."</h2>
            )}
            {transitionStep === 3 && (
              <div className="trans-text-final slow-reveal">
                <span className="trans-chapter-tag">CHAPTER 01</span>
                <h1>THE LEAF JOURNEY</h1>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BACKGROUND VOLUMETRIC GLOW */}
      <div className="auth-ambient-glow"></div>

      {!showForm ? (
        /* PHASE 0 — PUBLIC LANDING FILM EXPERIENCE */
        <div className="phase0-landing-film">
          
          <nav className="phase0-nav">
            <div className="phase0-brand">
              <Leaf size={22} color="#10b981" />
              <span>LEAFGUARD AI</span>
            </div>
            <button className="btn-phase0-signin" onClick={() => setShowForm(true)}>
              Enter Lab
            </button>
          </nav>

          {/* SCENE 00 — HERO */}
          <section className="phase0-hero-viewport">
            <div className="phase0-hero-content">
              
              <div className="phase0-leaf-container">
                <svg viewBox="0 0 240 240" className="phase0-protagonist-leaf">
                  <defs>
                    <radialGradient id="p0Glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path 
                    d="M120 20 C190 60 200 180 120 220 C40 180 50 60 120 20 Z" 
                    fill="#04271e" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    className="p0-leaf-body"
                  />
                  <path d="M120 20 L120 220" stroke="#34d399" strokeWidth="2" />
                  <path d="M120 70 Q150 85 170 90" stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.6" />
                  <path d="M120 70 Q90 85 70 90" stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.6" />
                  <path d="M120 130 Q160 145 180 150" stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.6" />
                  <path d="M120 130 Q80 145 60 150" stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.6" />
                </svg>
                <div className="phase0-scan-laser"></div>
              </div>

              <div className="phase0-typography">
                <span className="p0-tag">CINEMATIC AI PRODUCT FILM</span>
                <h1 className="p0-headline">EVERY LEAF<br />CARRIES A SIGNAL.</h1>
                <p className="p0-subline">"We learn to read it."</p>
                <p className="p0-brand-sub">LEAFGUARD AI — AI-POWERED PLANT INTELLIGENCE</p>
              </div>

              <div className="phase0-cta-row">
                <button className="btn btn-primary btn-p0-enter" onClick={() => setShowForm(true)}>
                  <span>ENTER THE EXPERIENCE</span>
                  <Play size={16} fill="currentColor" />
                </button>
              </div>

              <div className="scroll-indicator-down">
                <span>SCROLL TO DISCOVER THE STORY</span>
                <ArrowDown size={14} className="pulse-arrow" />
              </div>

            </div>
          </section>

          {/* LANDING SCROLL STORY — SECTION 1: THE PROBLEM */}
          <section className="phase0-story-section problem-section">
            <div className="story-content-box">
              <span className="story-chapter-num">01 / THE PROBLEM</span>
              <div className="story-visual-graphic damaged-leaf-visual">
                <svg viewBox="0 0 200 200" className="story-svg">
                  <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="#180e0a" stroke="#ef4444" strokeWidth="1.5" />
                  <circle cx="120" cy="80" r="16" fill="#ef4444" opacity="0.3" />
                  <circle cx="85" cy="120" r="22" fill="#ef4444" opacity="0.25" />
                  <path d="M100 20 L100 180" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>
              </div>
              <h2 className="story-heading">
                A PLANT CAN'T SPEAK.<br />
                <span className="highlight-text">BUT ITS LEAVES CAN.</span>
              </h2>
              <p className="story-desc">
                Silent visual signals appear long before crop destruction occurs. Early detection is the difference between yield loss and total recovery.
              </p>
            </div>
          </section>

          {/* LANDING SCROLL STORY — SECTION 2: THE SIGNAL */}
          <section className="phase0-story-section signal-section">
            <div className="story-content-box">
              <span className="story-chapter-num">02 / THE SIGNAL</span>
              <div className="story-visual-graphic vein-map-visual">
                <svg viewBox="0 0 200 200" className="story-svg">
                  <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="#04271e" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="#34d399" strokeWidth="2" />
                  <circle cx="100" cy="70" r="4" fill="#34d399" className="pulse-node" />
                  <circle cx="130" cy="95" r="4" fill="#34d399" className="pulse-node" />
                  <circle cx="70" cy="135" r="4" fill="#34d399" className="pulse-node" />
                </svg>
              </div>
              <h2 className="story-heading">
                COLOR. TEXTURE. PATTERN.<br />
                <span className="highlight-text">EVERY DETAIL CARRIES INFORMATION.</span>
              </h2>
              <p className="story-desc">
                Microscopic chlorotic rings, necrotic lesions, and vein discoloration hold exact biological telemetry that computer vision decodes in milliseconds.
              </p>
            </div>
          </section>

          {/* LANDING SCROLL STORY — SECTION 3: THE MACHINE */}
          <section className="phase0-story-section machine-section">
            <div className="story-content-box">
              <span className="story-chapter-num">03 / THE MACHINE</span>
              <div className="machine-pipeline-flow">
                <div className="pipe-node">
                  <Scan size={24} color="#10b981" />
                  <span>IMAGE</span>
                </div>
                <div className="pipe-arrow">→</div>
                <div className="pipe-node">
                  <Layers size={24} color="#10b981" />
                  <span>FEATURES</span>
                </div>
                <div className="pipe-arrow">→</div>
                <div className="pipe-node">
                  <BrainCircuit size={24} color="#10b981" />
                  <span>NEURAL NET</span>
                </div>
                <div className="pipe-arrow">→</div>
                <div className="pipe-node">
                  <Activity size={24} color="#10b981" />
                  <span>DIAGNOSIS</span>
                </div>
              </div>
              <h2 className="story-heading">
                THE MODEL LOOKS<br />
                <span className="highlight-text">DEEP BEYOND THE SURFACE.</span>
              </h2>
              <p className="story-desc">
                MobileNetV2 neural feature extractors combined with Grad-CAM explainability heatmaps illuminate precisely where attention was focused.
              </p>
            </div>
          </section>

          {/* LANDING SCROLL STORY — SECTION 4: THE ANSWER */}
          <section className="phase0-story-section answer-section">
            <div className="story-content-box center-text">
              <span className="story-chapter-num">04 / THE ANSWER</span>
              <h2 className="story-heading huge-heading">
                "WHAT IF WE COULD<br />
                <span className="highlight-text-bright">READ THE SIGNAL?"</span>
              </h2>
              <p className="story-desc max-width-p">
                Experience agricultural diagnostic intelligence designed for instant crop diagnosis, transparent heatmaps, and actionable treatment strategy.
              </p>
              <div className="answer-cta-box">
                <button className="btn btn-primary btn-p0-enter-large" onClick={() => setShowForm(true)}>
                  <span>ENTER LEAFGUARD LAB</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>

        </div>
      ) : (
        /* PHASE 1 — LOGIN: "ENTER THE LAB" (60/40 CINEMATIC SPLIT) */
        <div className="phase1-lab-view fade-in-element">
          
          <div className="lab-header-bar">
            <button className="btn-back-film" onClick={() => setShowForm(false)}>
              ← Back to Product Film
            </button>
            <div className="lab-brand-title">
              <Leaf size={20} color="#10b981" />
              <span>LEAFGUARD AI LAB</span>
            </div>
          </div>

          <div className="lab-split-layout">
            
            {/* LEFT 60%: CINEMATIC VISUAL SYSTEM */}
            <div className="lab-visual-column desktop-only">
              <div className="lab-visual-frame">
                <svg viewBox="0 0 200 200" className="lab-leaf-svg">
                  <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="#04271e" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
                <div className="lab-laser-beam"></div>
              </div>
              <p className="lab-visual-tagline">
                "Plants cannot speak. Their leaves show signs. LeafGuard interprets those signs with neural computer vision."
              </p>
            </div>

            {/* RIGHT 40%: INTEGRATED WORKSTATION LOGIN */}
            <div className="lab-auth-column">
              <div className="lab-auth-panel glass-card">
                
                <div className="lab-panel-header">
                  <span className="lab-sys-tag">DIAGNOSTIC WORKSTATION</span>
                  <h2>ENTER THE LAB</h2>
                  <p>Identify yourself. The leaf journey begins here.</p>
                </div>

                <div className="lab-tabs-row">
                  <button
                    type="button"
                    className={`lab-tab ${isLogin ? "active" : ""}`}
                    onClick={() => { setIsLogin(true); setError(""); }}
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    className={`lab-tab ${!isLogin ? "active" : ""}`}
                    onClick={() => { setIsLogin(false); setError(""); }}
                  >
                    CREATE ACCOUNT
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="lab-form">
                  {error && (
                    <div className="lab-error-banner">
                      <ShieldAlert size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="lab-input-group">
                    <label>Username</label>
                    <div className="input-box">
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

                  <div className="lab-input-group">
                    <label>Password</label>
                    <div className="input-box">
                      <Lock size={18} className="field-icon" />
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <>
                      <div className="lab-input-group">
                        <label>Location (City / Region)</label>
                        <div className="input-box">
                          <MapPin size={18} className="field-icon" />
                          <input
                            type="text"
                            placeholder="e.g. California, USA"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="lab-input-group">
                        <label>Profile Avatar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="file-input-btn"
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn btn-primary lab-submit-btn" disabled={loading}>
                    {loading ? (
                      <span>AUTHENTICATING...</span>
                    ) : (
                      <>
                        <span>{isLogin ? "ENTER LEAFGUARD" : "CREATE WORKSTATION"}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Auth;
