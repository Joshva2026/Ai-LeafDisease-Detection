import { Home, Camera, Library, History } from "lucide-react";
import { t } from "../../data/translationHelper";

function BottomNav({ activeView, onViewChange, lang }) {
  return (
    <nav className="bottom-nav">
      <div 
        className={`bottom-nav-item ${activeView === "home" ? "active" : ""}`}
        onClick={() => onViewChange("home")}
      >
        <Home size={20} />
        <span>{t("home", lang)}</span>
      </div>
      
      <div 
        className="bottom-nav-item scan-btn-wrapper"
        onClick={() => onViewChange("scan")}
      >
        <div className={`scan-floating-btn ${activeView === "scan" || activeView === "diagnosis" ? "active" : ""}`}>
          <Camera size={24} color="var(--bg-primary)" />
        </div>
        <span>{t("scan", lang)}</span>
      </div>

      <div 
        className={`bottom-nav-item ${activeView === "history" ? "active" : ""}`}
        onClick={() => onViewChange("history")}
      >
        <History size={20} />
        <span>{t("history", lang)}</span>
      </div>

      <div 
        className={`bottom-nav-item ${activeView === "about" ? "active" : ""}`}
        onClick={() => onViewChange("about")}
      >
        <Library size={20} />
        <span>About</span>
      </div>
    </nav>
  );
}

export default BottomNav;
