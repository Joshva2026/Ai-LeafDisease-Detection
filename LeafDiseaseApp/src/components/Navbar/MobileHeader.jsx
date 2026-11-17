import { Leaf, Sun, Moon, User2 } from "lucide-react";
import { t } from "../../data/translations";
import "./MobileHeader.css";

function MobileHeader({ theme, onToggleTheme, onViewChange, lang }) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-brand" onClick={() => onViewChange("home")}>
        <Leaf className="navbar-logo-icon" size={22} />
        <span>{t("logoName", lang)}</span>
      </div>
      <div className="mobile-header-actions">
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="mobile-profile-btn" onClick={() => onViewChange("profile")} title="Profile" aria-label="Profile">
          <User2 size={20} />
        </button>
      </div>
    </header>
  );
}

export default MobileHeader;