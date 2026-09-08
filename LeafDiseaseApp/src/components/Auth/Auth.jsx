import { useState } from "react";
import { User, Lock, ArrowRight, Leaf, ShieldAlert, MapPin, Camera, BrainCircuit, Eye, ShieldCheck, ChevronDown } from "lucide-react";
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

  return (
    <div className="auth-master-wrapper">
      
      {/* Background ambient lighting */}
      <div className="auth-ambient-glow"></div>

      {/* Landing Hero Screen */}
      {!showForm ? (
        <div className="auth-landing-view">
          
          {/* Top Brand Bar */}
          <nav className="auth-nav">
            <div className="auth-nav-brand">
              <Leaf className="auth-logo-icon" size={24} />
              <span>LEAFGUARD AI</span>
            </div>
            <button className="auth-nav-btn" onClick={() => setShowForm(true)}>
              Sign In
            </button>
          </nav>

          {/* Opening Hero Scene */}
          <section className="auth-hero-scene">
            <div className="auth-hero-badge">
              <span className="auth-badge-dot"></span> NEXT-GEN PLANT PATHOLOGY PLATFORM
            </div>
            
            <h1 className="auth-hero-main-title">
              INTELLIGENCE FOR<br />EVERY LEAF
            </h1>

            <p className="auth-hero-subtitle">
              A single image. A deeper understanding. Powered by deep learning visual neural networks and instant agronomic advice.
            </p>

            <div className="auth-hero-cta-row">
              <button className="btn btn-primary auth-cta-primary" onClick={() => setShowForm(true)}>
                <span>Start Diagnosis</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary auth-cta-secondary" onClick={() => {
                document.getElementById('auth-story-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <span>Explore Capabilities</span>
                <ChevronDown size={18} />
              </button>
            </div>
          </section>

          {/* Cinematic Storytelling Section */}
          <section id="auth-story-section" className="auth-story-section">
            <div className="auth-story-header">
              <h2>How LeafGuard Decodes Crop Health</h2>
              <p>Four interconnected steps from visual observation to field action.</p>
            </div>

            <div className="auth-story-flow">
              <div className="auth-story-step">
                <div className="story-step-num">01</div>
                <div className="story-step-icon"><Camera size={26} /></div>
                <h3>CAPTURE</h3>
                <p>Start with a simple photo of your plant leaf using your camera or gallery upload.</p>
              </div>

              <div className="auth-story-step">
                <div className="story-step-num">02</div>
                <div className="story-step-icon"><BrainCircuit size={26} /></div>
                <h3>ANALYZE</h3>
                <p>MobileNetV2 deep neural network examines microscopic disease patterns in milliseconds.</p>
              </div>

              <div className="auth-story-step">
                <div className="story-step-num">03</div>
                <div className="story-step-icon"><Eye size={26} /></div>
                <h3>UNDERSTAND</h3>
                <p>Grad-CAM visual evidence pinpoints the exact regions that informed the classification.</p>
              </div>

              <div className="auth-story-step">
                <div className="story-step-num">04</div>
                <div className="story-step-icon"><ShieldCheck size={26} /></div>
                <h3>ACT</h3>
                <p>Receive actionable treatment plans, organic remedies, and preventive spray schedules.</p>
              </div>
            </div>

            <div className="auth-story-bottom-cta">
              <h3>Ready to safeguard your crops?</h3>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <span>Enter Workstation</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </section>

        </div>
      ) : (
        /* Split Workstation Login / Register Form */
        <div className="auth-workstation-view">
          <div className="auth-split-container">
            
            {/* Left Column: Ambient Visual Canvas */}
            <div className="auth-split-visual desktop-only">
              <div className="visual-glass-content">
                <div className="visual-brand">
                  <Leaf size={32} color="var(--primary)" />
                  <h2>LeafGuard AI</h2>
                </div>
                <p className="visual-tagline">
                  "Plants cannot speak. Their leaves show signs. LeafGuard interprets those signs with computer vision."
                </p>

                <div className="visual-feature-pills">
                  <span>✦ 38 Crop Condition Classes</span>
                  <span>✦ Grad-CAM Neural Attention Maps</span>
                  <span>✦ Mobile & Offline History Archive</span>
                </div>
              </div>
            </div>

            {/* Right Column: Workstation Form */}
            <div className="auth-split-form">
              <button className="auth-back-to-landing" onClick={() => setShowForm(false)}>
                ← Back to Overview
              </button>

              <div className="auth-form-card glass-card">
                <div className="auth-card-header">
                  <h3>{isLogin ? "Welcome Back" : "Create Account"}</h3>
                  <p>{isLogin ? "Continue your plant intelligence journey." : "Join thousands of farmers and agronomists."}</p>
                </div>

                <div className="auth-tabs">
                  <button
                    type="button"
                    className={`auth-tab ${isLogin ? "active" : ""}`}
                    onClick={() => { setIsLogin(true); setError(""); }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`auth-tab ${!isLogin ? "active" : ""}`}
                    onClick={() => { setIsLogin(false); setError(""); }}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  {error && (
                    <div className="auth-error">
                      <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <div className="input-group">
                        <MapPin size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="Location (City, Country)"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="input-group avatar-upload-group">
                        <span className="avatar-label">Profile Image (Optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="avatar-file-input"
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                    {loading ? "Processing..." : isLogin ? "Enter Workstation" : "Create Account"}
                    <ArrowRight size={18} />
                  </button>
                </form>

                <p className="auth-footer-text">
                  LeafGuard AI • Intelligent Agriculture Engine
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Auth;
