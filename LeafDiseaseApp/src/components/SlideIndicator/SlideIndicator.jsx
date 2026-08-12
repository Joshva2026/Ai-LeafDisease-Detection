import React, { useState, useEffect } from 'react';
import './SlideIndicator.css';

function SlideIndicator({ containerSelector = '.scroll-container', sectionSelector = '.slide-section' }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0);

  useEffect(() => {
    const scrollContainer = document.querySelector(containerSelector);
    if (!scrollContainer) return;

    // Small delay to ensure sections are rendered
    const initTimer = setTimeout(() => {
      const sections = document.querySelectorAll(sectionSelector);
      setSectionsCount(sections.length);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = Array.from(sections).indexOf(entry.target);
              if (index !== -1) {
                setActiveIdx(index);
              }
            }
          });
        },
        { 
          root: scrollContainer,
          threshold: 0.5 // Section is considered active when 50% visible
        }
      );

      sections.forEach(sec => observer.observe(sec));

      return () => {
        observer.disconnect();
      };
    }, 300);

    return () => clearTimeout(initTimer);
  }, [containerSelector, sectionSelector]);

  if (sectionsCount <= 1) return null; // Don't show indicator if only 1 or 0 sections

  return (
    <div className="slide-indicator-container">
      {Array.from({ length: sectionsCount }).map((_, idx) => (
        <div 
          key={idx} 
          className={`slide-dot ${idx === activeIdx ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}

export default SlideIndicator;
