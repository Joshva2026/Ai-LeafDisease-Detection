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
          
          {/* STEP 01: LEAF */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">01</span>
              <h3>THE LEAF SPECIMEN</h3>
            </div>
            <p>
              A plant leaf's surface morphology, stomatal discoloration, and cellular lesions serve as the foundational biological signal. LeafGuard captures high-resolution specimen photos directly via mobile camera or file upload.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 02: MOBILENETV2 */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">02</span>
              <h3>MOBILENETV2 NEURAL ARCHITECTURE</h3>
            </div>
            <p>
              Our deep learning pipeline passes the preprocessed leaf image through a MobileNetV2 neural network utilizing depthwise separable convolutions for rapid, lightweight feature extraction.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 03: DISEASE DETECTION */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">03</span>
              <h3>DISEASE DETECTION (38 PATHOLOGY CLASSES)</h3>
            </div>
            <p>
              The trained model evaluates 38 distinct crop pathology classes across 14 plant species, calculating precise prediction confidence scores and identifying healthy vs diseased leaves.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 04: GRAD-CAM */}
          <div className="doc-step-card glass-card highlight-step">
            <div className="doc-step-header">
              <span className="step-num">04</span>
              <h3>GRAD-CAM HEATMAP VISUAL EXPLAINABILITY</h3>
            </div>
            <p>
              Rather than functioning as an unexplainable black box, LeafGuard computes Gradient-weighted Class Activation Mapping (Grad-CAM) to project visual attention heatmaps over the original specimen photo.
            </p>
          </div>

          <div className="doc-connector">↓</div>

          {/* STEP 05: AI EXPLANATION */}
          <div className="doc-step-card glass-card">
            <div className="doc-step-header">
              <span className="step-num">05</span>
              <h3>AI EXPLANATION & AGRONOMIC ADVISORY</h3>
            </div>
            <p>
              Neural diagnostic outputs are paired with deep agronomic insights powered by NVIDIA AI, generating dynamic multi-section advisory reports for immediate field treatment and disease prevention.
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
