import React from 'react';
import { t } from "../../data/translations";
import './Footer.css';

function Footer({ lang }) {
  return (
    <footer className="village-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg className="footer-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7c0-2 2-3 4-3 2 0 4 1 4 3 0 2-2 3-4 3-2 0-4-1-4-3z" />
              <path d="M12 7c0-2 2-3 4-3 2 0 4 1 4 3 0 2-2 3-4 3-2 0-4-1-4-3z" />
              <path d="M7 17c0 2 2 3 4 3 2 0 4-1 4-3 0-2-2-3-4-3-2 0-4 1-4 3z" />
              <path d="M17 17c0 2 2 3 4 3 2 0 4-1 4-3 0-2-2-3-4-3-2 0-4 1-4 3z" />
            </svg>
            <span>{t("logoName", lang)}</span>
          </div>
          <p className="footer-tagline">{t("homeSubtitle", lang)}</p>
        </div>

        <div className="footer-links">
          <p className="footer-section-title">{t("quickActions", lang)}</p>
          <div className="footer-link-grid">
            <a href="#scan" className="footer-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{t("scanALeaf", lang)}</span>
            </a>
            <a href="#guide" className="footer-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>{t("guides", lang)}</span>
            </a>
            <a href="#history" className="footer-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{t("history", lang)}</span>
            </a>
            <a href="#profile" className="footer-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{t("profile", lang)}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 {t("logoName", lang)}. All Rights Reserved.</p>
        <p className="footer-credit">
          Built by <strong>Joshva</strong> — MCA Student, Gandhigram
        </p>
      </div>
    </footer>
  );
}

export default Footer;