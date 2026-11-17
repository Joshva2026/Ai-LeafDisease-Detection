import React from 'react';
import { t } from "../../data/translations";
import Footer from '../../components/Footer/Footer';
import { Leaf, Server, Database, Code, Shield, BrainCircuit, Scan, Eye, Activity, Cpu } from 'lucide-react';
import "./About.css";

function About({ lang }) {
  return (
    <>
      <div className="tech-documentary-container fade-in-section">
        
        {/* DOCUMENTARY HERO HEADER */}
        <header className="tech-doc-header">
          <div className="doc-badge">
            <span className="badge-pulse-dot"></span>
            <span>{lang === "ta" ? "தொழில்நுட்ப ஆவணப்படிப்பு" : "TECHNOLOGY DOCUMENTARY"}</span>
          </div>
          <h1 className="doc-title">
            {lang === "ta" ? "இலை நோய் கண்டறிதலின் பின்னணியில் உள்ள தொழில்நுட்பம்" : "The Technology Behind The Leaf"
            }
          </h1>
          <p className="doc-subtitle">
            {lang === "ta"
              ? "கணினிப் பார்வை, மூடங்கிய நரம்பு வலைவலைகள், மற்றும் Grad-CAM thịர்வ கருத்து எவ்வாறு தாவர நோய் அறிவியலை விளக்குகிறது."
              : "How computer vision, convolutional neural networks, and Grad-CAM visual explainability decode plant pathology."
            }
          </p>
        </header>

        {/* DOCUMENTARY SCENE STEPS */}
        <div className="doc-story-flow">
          
          {/* STEP 01: LEAF */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">01</span>
              <h3>{lang === "ta" ? "இலை விஷயம்" : "THE LEAF SPECIMEN"}</h3>
            </div>
            <p>
              {lang === "ta"
                ? "ஒரு தாவர இலைப்பின் மேலோட்ட வடிவியல், த keh் மாசு, மற்றும் செல erineங்கள் அடிப்படை உயிரியல் señல். LeafGuard உங்கள் மோபைல் கேமரா அல்லது கோப்பு பதிவேற்ற மூலம் உயர் துணுக்கப் படங்களைப் பெறுகிறது."
                : "A plant leaf's surface morphology, discoloration, and lesions serve as the foundational biological signal. LeafGuard captures high-resolution specimen photos directly via mobile camera or file upload."
              }
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 02: MOBILENETV2 */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">02</span>
              <h3>{lang === "ta" ? "MOBILENETV2 நரம்பு கட்டமைப்பு" : "MOBILENETV2 NEURAL ARCHITECTURE"}</h3>
            </div>
            <p>
              {lang === "ta"
                ? "எங்கள் ஆழ் கற்றல் செலவு முன் செயலாக்கப்பட்ட இலை படத்தை MobileNetV2 நரம்பு வலைவலையில் அனுப்புகிறது, இது விரைவான, லைட்வேட் அம்சங்களைப் பெற depthwise Conv2D பயன்படுத்துகிறது."
                : "Our deep learning pipeline passes the preprocessed leaf image through a MobileNetV2 neural network utilizing depthwise separable convolutions for rapid, lightweight feature extraction."
              }
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 03: DISEASE DETECTION */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">03</span>
              <h3>{lang === "ta" ? "நோய் கண்டறிதல் (38 நோய் வகைகள்)" : "DISEASE DETECTION (38 CLASSES)"}</h3>
            </div>
            <p>
              {lang === "ta"
                ? "பயிற்சி பெற்ற மாதிரி 14 தாவர வகைகளில் 38 வெவ்வேறு பயிர் நோய் வகைகளை மதிப்பிடுகிறது, துல்லியமான உள்ளிட நம்பகத்தன்மை மதிப்புகளை கணக்கிடுகிறது மற்றும் ஆரோக்கியமான vs நோய் பாதிக்கப்பட்ட இலைகளைக் கண்டறிகிறது."
                : "The trained model evaluates 38 distinct crop pathology classes across 14 plant species, calculating precise prediction confidence scores and identifying healthy vs diseased leaves."
              }
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 04: GRAD-CAM */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">04</span>
              <h3>{lang === "ta" ? "GRAD-CAM கவன வரைபட விளக்கம்" : "GRAD-CAM HEATMAP EXPLAINABILITY"}</h3>
            </div>
            <p>
              {lang === "ta"
                ? "LeafGuard ஒரு விளக்கமுடியható மறை பெட்டியாக செயல்படுவதற்குப் பதிலாக, Grad-CAM (Gradient-weighted Class Activation Mapping) மூலம் மூல விஷய புகைப்படத்தின் மீது திருப்ப 시선을 காட்டும் வெண்ணோக்கச் சதுரங்களைக் கணக்கிடுகிறது."
                : "Rather than functioning as an unexplainable black box, LeafGuard computes Gradient-weighted Class Activation Mapping (Grad-CAM) to project visual attention heatmaps over the original specimen photo."
              }
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 05: AI EXPLANATION */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">05</span>
              <h3>{lang === "ta" ? "AI விளக்கம் & விவசாய ஆலோசனை" : "AI EXPLANATION & AGRONOMIC ADVISORY"}</h3>
            </div>
            <p>
              {lang === "ta"
                ? "நரம்பு கண்டறிதல் வெளியீடுகள் NVIDIA AI மூலம் ஆழமான விவசாய அறிவு உடன் இணைக்கப்பட்டு, உடனடி வேளாண்மை சிகிச்சை மற்றும் நோய் தடுப்புக்காக தனிப்பயனாக்கப்பட்ட பல பகுதி ஆலோசனை அறிக்கைகளை உருவாக்குகின்றன."
                : "Neural diagnostic outputs are paired with deep agronomic insights powered by NVIDIA AI, generating dynamic multi-section advisory reports for immediate field treatment and disease prevention."
              }
            </p>
          </div>

        </div>

        {/* SYSTEM ARCHITECTURE TECH STACK GRID */}
        <section className="tech-stack-grid-section">
          <h2>{lang === "ta" ? "LeafGuard AI முக்கிய தொழில்நுட்பக் குறிமங்கள்" : "LeafGuard AI Core Technology Stack"}</h2>
          <div className="doc-tech-grid">
            <div className="doc-tech-card glass-card">
              <Code size={30} color="#22c55e" />
              <h4>{lang === "ta" ? "முன் பகுதி" : "Frontend"}</h4>
              <span>React 19 + Vite 8</span>
            </div>

            <div className="doc-tech-card glass-card">
              <Server size={30} color="#22c55e" />
              <h4>{lang === "ta" ? "பின்ன்பகுதி" : "Backend"}</h4>
              <span>Python + Flask API</span>
            </div>

            <div className="doc-tech-card glass-card">
              <BrainCircuit size={30} color="#22c55e" />
              <h4>{lang === "ta" ? "நரம்பு வலை" : "Neural Network"}</h4>
              <span>TensorFlow + MobileNetV2</span>
            </div>

            <div className="doc-tech-card glass-card">
              <Eye size={30} color="#22c55e" />
              <h4>{lang === "ta" ? "விளக்கக்கூடிய AI" : "Explainable AI"}</h4>
              <span>Grad-CAM Heatmap Analysis</span>
            </div>
          </div>
        </section>

        {/* Credits */}
        <div className="about-credits glass-card" style={{ marginTop: "32px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>{t("createdBy", lang)}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>Joshva</span>
            <span style={{ color: "#9ca3af" }}>{lang === "ta" ? "MCA மாணவர், காந்திகிராம்" : "MCA Student, Gandhigram"}</span>
          </div>
        </div>

      </div>

      <div className="desktop-only"><Footer lang={lang} onViewChange={() => {}} /></div>
    </>
  );
}

export default About;