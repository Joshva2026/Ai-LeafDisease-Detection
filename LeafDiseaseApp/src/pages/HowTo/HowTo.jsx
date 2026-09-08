import { useState } from "react";
import { 
  Camera, BrainCircuit, Eye, Sparkles, ShieldCheck, 
  ArrowRight, ArrowDown, Scan, CheckCircle2, ChevronRight 
} from "lucide-react";
import "./HowTo.css";

function HowTo({ onViewChange, lang }) {
  const [activeScene, setActiveScene] = useState(1);

  const totalScenes = 6;

  const scrollToScene = (sceneNum) => {
    setActiveScene(sceneNum);
    const elem = document.getElementById(`howto-scene-${sceneNum}`);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="howto-master-container fade-in-section">
      
      {/* Fixed Journey Scene Counter Bar */}
      <div className="howto-progress-bar">
        <div className="howto-progress-info">
          <span className="howto-step-badge">CHAPTER 01</span>
          <span className="howto-step-title">THE LEAF JOURNEY</span>
        </div>
        <div className="howto-dots">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className={`howto-dot ${activeScene === num ? "active" : ""}`}
              onClick={() => scrollToScene(num)}
              title={`Scene 0${num}`}
            >
              <span className="dot-label">0{num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SCENE 01 — THE LEAF */}
      <section id="howto-scene-1" className="howto-scene scene-leaf-intro">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">01 / THE LEAF</span>
          
          <div className="macro-leaf-hero">
            <svg viewBox="0 0 240 240" className="macro-leaf-svg">
              <defs>
                <radialGradient id="macroLeafGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#059669" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="120" r="100" fill="url(#macroLeafGlow)" className="aura-pulse" />
              <path 
                d="M120 30 C190 70 200 170 120 210 C40 170 50 70 120 30 Z" 
                fill="#064e3b" 
                stroke="#34d399" 
                strokeWidth="2" 
                className="macro-leaf-body"
              />
              <path d="M120 30 L120 210" stroke="#6ee7b7" strokeWidth="2.5" />
              <path d="M120 70 Q150 85 170 90" stroke="#34d399" strokeWidth="1.5" fill="none" />
              <path d="M120 70 Q90 85 70 90" stroke="#34d399" strokeWidth="1.5" fill="none" />
              <path d="M120 120 Q160 135 180 140" stroke="#34d399" strokeWidth="1.5" fill="none" />
              <path d="M120 120 Q80 135 60 140" stroke="#34d399" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <h1 className="howto-headline">
            "Before we diagnose a plant,<br />we listen to its leaf."
          </h1>
          
          <p className="howto-description">
            Leaves are living biological sensors. Every spot, discoloration, and structural lesion reflects cellular interactions between host and pathogen.
          </p>

          <button className="btn-howto-next" onClick={() => scrollToScene(2)}>
            <span>Proceed to Step 01: Capture</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 02 — CAPTURE */}
      <section id="howto-scene-2" className="howto-scene scene-capture">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">02 / CAPTURE</span>
          
          <div className="camera-frame-simulation">
            <div className="viewfinder-box">
              <svg viewBox="0 0 200 200" className="viewfinder-leaf">
                <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="45" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" fill="none" />
              </svg>
              
              <div className="viewfinder-corner top-left"></div>
              <div className="viewfinder-corner top-right"></div>
              <div className="viewfinder-corner bottom-left"></div>
              <div className="viewfinder-corner bottom-right"></div>
              
              <div className="reticle-center">
                <Camera size={24} color="#34d399" />
              </div>
            </div>

            <div className="capture-instructions-card">
              <div className="rule-item">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Focus on a single, clear leaf</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Keep natural daylight lighting</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Center the affected lesion area</span>
              </div>
            </div>
          </div>

          <h2 className="howto-headline">
            Capture: Give LeafGuard a Clear View
          </h2>

          <p className="howto-description">
            A high-contrast photograph ensures that microscopic edge boundaries and color distributions enter the deep network without distortion.
          </p>

          <button className="btn-howto-next" onClick={() => scrollToScene(3)}>
            <span>Proceed to Step 02: Analyze</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 03 — ANALYZE */}
      <section id="howto-scene-3" className="howto-scene scene-analyze">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">03 / ANALYZE</span>
          
          <div className="analysis-grid-simulation">
            <div className="scan-grid-box">
              <svg viewBox="0 0 200 200" className="grid-leaf">
                <path d="M100 20 C160 60 170 140 100 180 C30 140 40 60 100 20 Z" fill="#042f2e" stroke="#10b981" strokeWidth="1.5" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(16, 185, 129, 0.2)" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(16, 185, 129, 0.2)" />
                <line x1="0" y1="150" x2="200" y2="150" stroke="rgba(16, 185, 129, 0.2)" />
                <line x1="50" y1="0" x2="50" y2="200" stroke="rgba(16, 185, 129, 0.2)" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(16, 185, 129, 0.2)" />
                <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(16, 185, 129, 0.2)" />
              </svg>
              <div className="scan-laser-line"></div>
            </div>

            <div className="neural-nodes-list">
              <div className="node-badge active">
                <BrainCircuit size={16} />
                <span>MobileNetV2 Feature Extraction</span>
              </div>
              <div className="node-badge active">
                <Sparkles size={16} />
                <span>38 Crop Pathology Filters</span>
              </div>
              <div className="node-badge active">
                <Scan size={16} />
                <span>Morphological Pattern Matching</span>
              </div>
            </div>
          </div>

          <h2 className="howto-headline">
            Analyze: Neural Pattern Examination
          </h2>

          <p className="howto-description">
            Convolutional neural layers evaluate hierarchical textures from edge lines up to complex necrotic lesions in milliseconds.
          </p>

          <button className="btn-howto-next" onClick={() => scrollToScene(4)}>
            <span>Proceed to Step 03: Visualize</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 04 — VISUALIZE */}
      <section id="howto-scene-4" className="howto-scene scene-visualize">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">04 / VISUALIZE</span>
          
          <div className="visual-evidence-split">
            <div className="split-side original-side">
              <span className="split-label">01 / INPUT IMAGE</span>
              <div className="split-canvas">
                <svg viewBox="0 0 160 160">
                  <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="#143828" stroke="#34d399" strokeWidth="1.5" />
                  <circle cx="70" cy="70" r="16" fill="#3f1c19" stroke="#ef4444" strokeWidth="1" />
                </svg>
              </div>
              <p className="split-sub">Visible Leaf Tissue</p>
            </div>

            <div className="split-divider">
              <ChevronRight size={24} color="#10b981" />
            </div>

            <div className="split-side gradcam-side">
              <span className="split-label">02 / GRAD-CAM HEATMAP</span>
              <div className="split-canvas gradcam-canvas">
                <svg viewBox="0 0 160 160">
                  <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="#0b2419" stroke="#10b981" strokeWidth="1.5" />
                  <radialGradient id="howtoGradCam" cx="45%" cy="45%" r="40%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.75" />
                    <stop offset="80%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <circle cx="70" cy="70" r="34" fill="url(#howtoGradCam)" />
                </svg>
              </div>
              <p className="split-sub attention-text">Neural Attention Hotspots</p>
            </div>
          </div>

          <h2 className="howto-headline">
            Visualize: See Where the AI Found Evidence
          </h2>

          <p className="howto-description">
            Grad-CAM heatmap overlays reveal the exact mathematical activation zones that drove the model's classification.
          </p>

          <button className="btn-howto-next" onClick={() => scrollToScene(5)}>
            <span>Proceed to Step 04: Understand</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 05 — UNDERSTAND */}
      <section id="howto-scene-5" className="howto-scene scene-understand">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">05 / UNDERSTAND</span>
          
          <div className="understand-cards-layout">
            <div className="u-card">
              <div className="u-card-icon"><Eye size={20} color="#34d399" /></div>
              <h4>Disease Classification</h4>
              <p>Identifies exact species & pathogen taxonomy with high confidence.</p>
            </div>

            <div className="u-card">
              <div className="u-card-icon"><Sparkles size={20} color="#f59e0b" /></div>
              <h4>Diagnostic Breakdown</h4>
              <p>Explains symptoms, primary triggers, and severity level.</p>
            </div>

            <div className="u-card">
              <div className="u-card-icon"><ShieldCheck size={20} color="#10b981" /></div>
              <h4>Agronomic Advice</h4>
              <p>Delivers practical biological and chemical treatment guidance.</p>
            </div>
          </div>

          <h2 className="howto-headline">
            Understand: Turn Signals into Actionable Insight
          </h2>

          <p className="howto-description">
            Transform raw machine visual signals into structured agronomic knowledge tailored to your plant's condition.
          </p>

          <button className="btn-howto-next" onClick={() => scrollToScene(6)}>
            <span>Proceed to Step 05: Act & Protect</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* SCENE 06 — ACT & FINAL SCAN CTA */}
      <section id="howto-scene-6" className="howto-scene scene-act-final">
        <div className="howto-scene-content">
          <span className="scene-ch-tag">06 / ACT & PROTECT</span>
          
          <div className="act-transformation-visual">
            <div className="healthy-leaf-aura">
              <svg viewBox="0 0 160 160" className="healthy-leaf-svg">
                <path d="M80 15 C130 45 140 115 80 145 C20 115 30 45 80 15 Z" fill="linear-gradient(135deg, #10b981, #059669)" stroke="#6ee7b7" strokeWidth="2" />
                <path d="M80 15 L80 145" stroke="#a7f3d0" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <h2 className="final-prompt-headline">
            "YOUR PLANT IS TRYING<br />TO TELL YOU SOMETHING."
          </h2>

          <p className="final-prompt-subheadline">
            ARE YOU READY TO LISTEN?
          </p>

          <div className="howto-final-actions">
            <button className="btn btn-primary start-scan-cta" onClick={() => onViewChange("scan")}>
              <span>START SCANNING</span>
              <Scan size={20} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HowTo;
