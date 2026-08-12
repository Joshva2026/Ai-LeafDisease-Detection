import React from 'react';
import './About.css';
import Footer from '../../components/Footer/Footer';
import { Leaf, Server, Database, Code, Shield, BrainCircuit } from 'lucide-react';

function About() {
  return (
    <>
      <div className="page-wrapper about-wrapper">
        <header className="about-header slide-section fade-in-section is-visible">
          <span className="about-tag">About The Project</span>
          <h1 className="about-title">LeafGuard AI</h1>
          <p className="about-subtitle">An intelligent plant-health platform designed to demonstrate how deep learning and computer vision can assist in identifying plant leaf diseases from images.</p>
        </header>

        <section className="about-content slide-section fade-in-section is-visible">
          <div className="about-card">
            <h2 className="about-heading">The Vision</h2>
            <p className="about-text">The system combines image processing, deep learning classification, and visual analysis to provide an accessible disease detection workflow. By bringing advanced neural networks to both mobile and desktop platforms seamlessly, we aim to bridge the gap between AI research and practical agricultural application.</p>
          </div>
        </section>

        <section className="tech-stack-section slide-section fade-in-section is-visible">
          <div className="section-header-center">
            <h2 className="section-heading-large">Technology Behind LeafGuard</h2>
            <p className="section-subtext">Built with a modern, scalable, and powerful technology stack.</p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <Code size={32} className="tech-icon" />
              <span className="tech-title">Frontend</span>
              <span className="tech-badge">React + Vite</span>
            </div>
            
            <div className="tech-card">
              <Server size={32} className="tech-icon" />
              <span className="tech-title">Backend</span>
              <span className="tech-badge">Flask + Python</span>
            </div>

            <div className="tech-card">
              <BrainCircuit size={32} className="tech-icon" />
              <span className="tech-title">AI / ML</span>
              <span className="tech-badge">TensorFlow + Keras</span>
            </div>

            <div className="tech-card">
              <Database size={32} className="tech-icon" />
              <span className="tech-title">Model</span>
              <span className="tech-badge">MobileNetV2</span>
            </div>

            <div className="tech-card">
              <Shield size={32} className="tech-icon" />
              <span className="tech-title">Image Analysis</span>
              <span className="tech-badge">Grad-CAM Heatmap</span>
            </div>

            <div className="tech-card">
              <Leaf size={32} className="tech-icon" />
              <span className="tech-title">Computer Vision</span>
              <span className="tech-badge">OpenCV</span>
            </div>
          </div>
        </section>

        <section className="architecture-section slide-section fade-in-section is-visible">
          <div className="about-card">
            <h2 className="about-heading" style={{ textAlign: "center", marginBottom: "24px" }}>System Architecture</h2>
            
            <div className="arch-flow">
              <div className="arch-node">User</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node">Leaf Image</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node highlight">React Frontend</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node highlight">Flask API</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node highlight-ai">TensorFlow Model</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node">Prediction</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node">Heatmap</div>
              <div className="arch-arrow">↓</div>
              <div className="arch-node final">Result</div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default About;
