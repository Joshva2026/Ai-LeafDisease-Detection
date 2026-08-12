import { useState, useEffect } from "react";
import { Leaf, Sun, Moon, LogOut, Menu, X, Home, Camera, Library, History, User2 } from "lucide-react";
import { t } from "../../data/translationHelper";
import "./navbar.css";

function Navbar({ activeView, onViewChange, theme, onToggleTheme, onLogout, lang, onLangChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { id: "home", label: t("home", lang), icon: Home },
    { id: "scan", label: t("scan", lang), icon: Camera },
    { id: "history", label: t("history", lang), icon: History },
    { id: "about", label: "About", icon: Library },
    { id: "profile", label: t("profile", lang), icon: User2 }
  ];

  // Listen to scrolling inside .scroll-container to toggle full-width navbar sticky state
  useEffect(() => {
    const scrollContainer = document.querySelector(".scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollContainer.scrollTop > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (id) => {
    onViewChange(id);
    setDrawerOpen(false);
  };

  return (
    <>
      <nav className={`desktop-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-brand" onClick={() => onViewChange("home")}>
          <Leaf className="navbar-logo-icon" size={22} />
          <span>{t("logoName", lang)}</span>
        </div>

        {/* Desktop Links */}
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.id}>
              <button
                className={`navbar-link-btn ${
                  activeView === link.id || (link.id === "scan" && activeView === "diagnosis")
                    ? "active"
                    : ""
                }`}
                onClick={() => onViewChange(link.id)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop Action buttons */}
        <div className="navbar-actions">
          {/* Language Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={() => onLangChange(lang === "en" ? "ta" : "en")}
            title="Switch Language / மொழி மாற்றவும்"
            style={{ fontSize: "12px", fontWeight: "700", padding: "8px 12px", borderRadius: "16px", letterSpacing: "0.5px" }}
          >
            {lang === "en" ? "தமிழ்" : "EN"}
          </button>

          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="navbar-logout-btn" onClick={onLogout}>
            <LogOut size={13} />
            <span>{t("logout", lang)}</span>
          </button>
        </div>

        {/* Mobile Hamburger menu trigger */}
        <button
          className="hamburger-btn"
          onClick={() => setDrawerOpen(true)}
          title="Open Menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-menu-overlay ${drawerOpen ? "open" : ""}`} 
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="navbar-brand">
            <Leaf className="navbar-logo-icon" size={20} />
            <span>{t("logoName", lang)}</span>
          </div>
          <button 
            className="drawer-close-btn"
            onClick={() => setDrawerOpen(false)}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="mobile-menu-links">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.id}>
                <button
                  className={`mobile-menu-link ${
                    activeView === link.id || (link.id === "scan" && activeView === "diagnosis")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleLinkClick(link.id)}
                >
                  <IconComponent size={18} />
                  <span>{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="drawer-actions">
          {/* Mobile Language row */}
          <div 
            className="drawer-action-row" 
            onClick={() => onLangChange(lang === "en" ? "ta" : "en")}
            style={{ cursor: "pointer" }}
          >
            <span>{t("language", lang)}</span>
            <span style={{ color: "var(--primary)", fontWeight: "700" }}>
              {lang === "en" ? "தமிழ்" : "English"}
            </span>
          </div>

          <div 
            className="drawer-action-row"
            onClick={onToggleTheme}
            style={{ cursor: "pointer" }}
          >
            <span>{t("themeMode", lang)}</span>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={() => { setDrawerOpen(false); onLogout(); }}
            style={{ color: "var(--color-danger)", borderColor: "rgba(197, 94, 87, 0.15)", gap: "6px" }}
          >
            <LogOut size={14} />
            <span>{t("logout", lang)}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;