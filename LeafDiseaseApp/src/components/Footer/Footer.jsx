import React from 'react';
import './Footer.css';
import { Leaf } from 'lucide-react';

function Footer() {
  return (
    <footer className="professional-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf className="footer-icon" size={24} />
            <span>LeafGuard AI</span>
          </div>
          <p className="footer-tagline">Intelligent Plant Health & Disease Detection</p>
        </div>
        
        <div className="footer-credits">
          <p className="footer-built">Built with AI, Code & Curiosity</p>
          <div className="footer-creator">
            <span className="creator-highlight">Created by Jo</span>
            <span className="creator-details">Joshva — MCA Student</span>
            <span className="creator-published">Published by Gandhigram</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 Joshva. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
