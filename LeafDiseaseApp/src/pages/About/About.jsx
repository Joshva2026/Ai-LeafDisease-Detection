import React from 'react';
import './About.css';
import Footer from '../../components/Footer/Footer';
import { Leaf, Server, Database, Code, Shield, BrainCircuit, Scan, Eye, Activity, Cpu } from 'lucide-react';

function About() {
  return (
    <>
      <div className="tech-documentary-container fade-in-section">
        
        {/* DOCUMENTARY HERO HEADER */}
        <header className="tech-doc-header">
          <div className="doc-badge">
            <span className="badge-pulse-dot"></span>
            <span>TECHNOLOGY DOCUMENTARY</span>
          </div>
          <h1 className="doc-title">The Technology Behind The Leaf</h1>
          <p className="doc-subtitle">
            An exploration of how computer vision, convolutional neural networks, and Grad-CAM visual explainability decode plant pathology.
          </p>
        </header>

        {/* DOCUMENTARY SCENE STEPS */}
        <div className="doc-story-flow">
          
          {/* STEP 01: THE PROBLEM */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">01</span>
              <h3>THE AGRICULTURAL CHALLENGE</h3>
            </div>
            <p>
              Crop diseases account for up to 40% of annual global food production losses. Early microscopic detection before symptoms become widespread is essential for food security and targeted agronomic intervention.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 02: THE LEAF AS A SIGNAL */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">02</span>
              <h3>THE LEAF AS A SIGNAL</h3>
            </div>
            <p>
              A plant leaf's surface morphology, stomatal discoloration, and cellular necrosis act as an immediate visual signal. LeafGuard captures these features directly via smartphone cameras or gallery uploads.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 03: COMPUTER VISION & MOBILENETV2 */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">03</span>
              <h3>MOBILENETV2 NEURAL ARCHITECTURE</h3>
            </div>
            <p>
              Our core classification pipeline leverages MobileNetV2 depthwise separable convolutions, optimized to evaluate 38 crop pathology classes with high precision and sub-second execution speeds.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 04: GRAD-CAM VISUAL EXPLAINABILITY */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">04</span>
              <h3>GRAD-CAM NEURAL EXPLAINABILITY</h3>
            </div>
            <p>
              Rather than serving as a black-box AI, LeafGuard computes Gradient-weighted Class Activation Mapping (Grad-CAM) to project activation heatmaps onto the original leaf photo, proving exactly where the AI detected evidence.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 05: THE FARMER & FIELD ACTION */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">05</span>
              <h3>ACTIONABLE FIELD AGRONOMY</h3>
            </div>
            <p>
              Neural predictions are immediately paired with actionable treatment steps, organic remedies, and spray scheduling recommendations so farmers can protect their crops before diseases spread.
            </p>
          </div>

        </div>

        {/* SYSTEM ARCHITECTURE TECH STACK GRID */}
        <section className="tech-stack-grid-section">
          <h2>LeafGuard AI Core Technology Stack</h2>
          <div className="doc-tech-grid">
            <div className="doc-tech-card glass-card">
              <Code size={28} color="#10b981" />
              <h4>Frontend Engine</h4>
              <span>React 19 + Vite 8</span>
            </div>

            <div className="doc-tech-card glass-card">
              <Server size={28} color="#10b981" />
              <h4>Backend Service</h4>
              <span>Python + Flask API</span>
            </div>

            <div className="doc-tech-card glass-card">
              <BrainCircuit size={28} color="#10b981" />
              <h4>Neural Network</h4>
              <span>TensorFlow + MobileNetV2</span>
            </div>

            <div className="doc-tech-card glass-card">
              <Eye size={28} color="#10b981" />
              <h4>Explainable AI</h4>
              <span>Grad-CAM Heatmap Analysis</span>
            </div>
          </div>
        </section>

      </div>

      <div className="desktop-only"><Footer /></div>
    </>
  );
}

export default About;
