import { Leaf, Sun, Moon, User2 } from "lucide-react";
import { t } from "../../data/translations";

function MobileHeader({ theme, onToggleTheme, onViewChange, lang }) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-brand" onClick={() => onViewChange("home")}>
        <Leaf className="navbar-logo-icon" size={20} />
        <span>{t("logoName", lang)}</span>
      </div>
      <div className="mobile-header-actions">
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="mobile-profile-btn" onClick={() => onViewChange("profile")} title="Profile">
          <User2 size={18} />
        </button>
      </div>
    </header>
  );
}

export default MobileHeader;
