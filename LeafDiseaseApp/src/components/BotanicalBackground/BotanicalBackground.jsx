import { useEffect, useRef } from "react";
import "./BotanicalBackground.css";

function BotanicalBackground() {
  const containerRef = useRef(null);

  // We keep the ref and a simple structure. The complex parallax and SVG layers are removed.
  return (
    <div className="botanical-bg-container" ref={containerRef}>
      <video
        className="botanical-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/botanical-background-poster.webp"
      >
        <source src="/assets/botanical-background.mp4" type="video/mp4" />
      </video>
      <img 
        src="/assets/botanical-background-poster.webp" 
        alt="Botanical Background Fallback" 
        className="botanical-bg-fallback"
      />
      <div className="botanical-bg-overlay"></div>
    </div>
  );
}

export default BotanicalBackground;

