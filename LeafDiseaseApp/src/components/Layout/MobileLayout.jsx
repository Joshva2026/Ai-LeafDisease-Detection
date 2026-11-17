import { useState, useEffect } from "react";
import { 
  Home, 
  Camera, 
  History, 
  Leaf, 
  Bot, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  TrendingUp,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  FileText,
  Search,
  Plus
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { t } from "../../data/translations";
import "./MobileLayout.css";

const mainNavigation = [
  { name: "home", href: "/", icon: Home, label: "home" },
  { name: "scan", href: "/scan", icon: Camera, label: "scan" },
  { name: "history", href: "/history", icon: History, label: "history" },
  { name: "plants", href: "/plants", icon: Leaf, label: "myPlants" },
  { name: "help", href: "/help", icon: Bot, label: "help" },
];

export function MobileLayout({ children, user, onLogout, lang, onLangChange, onScanClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleLangChange = (newLang) => {
    onLangChange(newLang);
  };

  // Hide/show header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const handleNavClick = (href) => {
    if (href === "/scan" && onScanClick) {
      onScanClick();
    } else {
      navigate(href);
    }
  };

  return (
    <div className="mobile-layout">
      {/* Status Bar Spacer */}
      <div className="status-bar-spacer" aria-hidden="true" />

      {/* Top Header */}
      <header 
        className={`mobile-header ${headerVisible ? "visible" : "hidden"}`}
        role="banner"
      >
        <div className="header-left">
          <NavLink 
            to="/" 
            className="header-back"
            onClick={() => navigate("/")}
            aria-label={t("backToHome", lang)}
          >
            <Home size={24} />
          </NavLink>
          
          <h1 className="header-title">
            {t("pageTitle", lang) || "LeafGuard AI"}
          </h1>
        </div>

        <div className="header-right">
          <button 
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "light" ? t("darkMode", lang) : t("lightMode", lang)}
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          <div className="lang-selector">
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              aria-label={t("language", lang)}
              className="lang-select"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
            </select>
            <Globe size={16} className="lang-icon" aria-hidden="true" />
          </div>

          <div className="user-menu">
            <button 
              className="user-menu-trigger"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <div className="user-avatar-sm">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" />
                ) : (
                  <span>{user?.username?.charAt(0)?.toUpperCase() || "U"}</span>
                )}
              </div>
            </button>
            <div className="user-dropdown" role="menu">
              <div className="dropdown-header">
                <div className="dropdown-user">
                  <div className="user-avatar">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" />
                    ) : (
                      <span>{user?.username?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div>
                    <span className="dropdown-name">{user?.username}</span>
                    <span className="dropdown-email">{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider" role="separator" />
              <NavLink to="/profile" className="dropdown-item" role="menuitem" onClick={() => navigate("/profile")}>
                <User size={16} />
                <span>{t("profile", lang)}</span>
              </NavLink>
              <NavLink to="/notifications" className="dropdown-item" role="menuitem" onClick={() => navigate("/notifications")}>
                <Bell size={16} />
                <span>{t("notifications", lang)}</span>
              </NavLink>
              <NavLink to="/settings" className="dropdown-item" role="menuitem" onClick={() => navigate("/settings")}>
                <Settings size={16} />
                <span>{t("settings", lang)}</span>
              </NavLink>
              <NavLink to="/help" className="dropdown-item" role="menuitem" onClick={() => navigate("/help")}>
                <HelpCircle size={16} />
                <span>{t("help", lang)}</span>
              </NavLink>
              <div className="dropdown-divider" role="separator" />
              <button className="dropdown-item danger" role="menuitem" onClick={onLogout}>
                <LogOut size={16} />
                <span>{t("logout", lang)}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-main" role="main">
        <div className="mobile-content">
          {children}
        </div>

        {/* Floating Action Button */}
        <button 
          className={`mobile-fab ${showFabMenu ? "expanded" : ""}`}
          onClick={() => setShowFabMenu(!showFabMenu)}
          aria-label={t("scanLeaf", lang)}
          aria-expanded={showFabMenu}
        >
          <Camera size={26} className="fab-icon" />
          {showFabMenu && <X size={26} className="fab-close" />}
        </button>

        {/* FAB Menu */}
        {showFabMenu && (
          <div className="fab-menu" role="menu">
            <button 
              className="fab-menu-item"
              onClick={() => { handleNavClick("/scan"); setShowFabMenu(false); }}
              role="menuitem"
            >
              <Camera size={20} />
              <span>{t("takePhotoAction", lang)}</span>
            </button>
            <button 
              className="fab-menu-item"
              onClick={() => { handleNavClick("/scan"); setShowFabMenu(false); }}
              role="menuitem"
            >
              <FileText size={20} />
              <span>{t("uploadImageAction", lang)}</span>
            </button>
            <button 
              className="fab-menu-item"
              onClick={() => { navigate("/history"); setShowFabMenu(false); }}
              role="menuitem"
            >
              <History size={20} />
              <span>{t("history", lang)}</span>
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="mobile-bottom-nav" role="navigation" aria-label="Main navigation">
          {mainNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`bottom-nav-item ${active ? "active" : ""}`}
                onClick={() => handleNavClick(item.href)}
                aria-current={active ? "page" : undefined}
                aria-label={t(item.label, lang)}
              >
                <span className="nav-icon" aria-hidden="true">
                  <item.icon size={24} />
                </span>
                <span className="nav-label">{t(item.label, lang)}</span>
                {active && <span className="nav-indicator" aria-hidden="true" />}
              </NavLink>
            );
          })}
        </nav>
      </main>

      {/* FAB Overlay */}
      {showFabMenu && (
        <div 
          className="fab-overlay" 
          onClick={() => setShowFabMenu(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default MobileLayout;