import { Home, Camera, Library, History, User2 } from "lucide-react";
import { t } from "../../data/translations";
import "./BottomNav.css";

function BottomNav({ activeView, onViewChange, lang }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <button
        className={`bottom-nav-item ${activeView === "home" ? "active" : ""}`}
        onClick={() => onViewChange("home")}
        aria-current={activeView === "home" ? "page" : undefined}
        aria-label={t("home", lang)}
      >
        <Home size={22} />
        <span>{t("home", lang)}</span>
      </button>

      <button
        className="bottom-nav-item scan-btn-wrapper"
        onClick={() => onViewChange("scan")}
        aria-current={activeView === "scan" || activeView === "diagnosis" ? "page" : undefined}
        aria-label={t("scan", lang)}
      >
        <div className={`scan-floating-btn ${activeView === "scan" || activeView === "diagnosis" ? "active" : ""}`}>
          <Camera size={26} color="var(--bg-primary)" />
        </div>
        <span>{t("scan", lang)}</span>
      </button>

      <button
        className={`bottom-nav-item ${activeView === "history" ? "active" : ""}`}
        onClick={() => onViewChange("history")}
        aria-current={activeView === "history" ? "page" : undefined}
        aria-label={t("history", lang)}
      >
        <History size={22} />
        <span>{t("history", lang)}</span>
      </button>

      <button
        className={`bottom-nav-item ${activeView === "profile" ? "active" : ""}`}
        onClick={() => onViewChange("profile")}
        aria-current={activeView === "profile" ? "page" : undefined}
        aria-label={t("profile", lang)}
      >
        <User2 size={22} />
        <span>{t("profile", lang)}</span>
      </button>
    </nav>
  );
}

export default BottomNav;