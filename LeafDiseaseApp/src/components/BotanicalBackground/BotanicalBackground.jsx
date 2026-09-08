import { useEffect, useRef } from "react";
import "./BotanicalBackground.css";

function BotanicalBackground() {
  const containerRef = useRef(null);

  return (
    <div className="botanical-bg-container" ref={containerRef} aria-hidden="true">
      <video
        className="botanical-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/botanical-background-poster.webp"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      >
        <source src="/assets/botanical-background.mp4" type="video/mp4" />
      </video>
      <div className="botanical-bg-overlay"></div>
      <div className="botanical-ambient-particles"></div>
    </div>
  );
}

export default BotanicalBackground;

