import { useState, useEffect } from "react";
import { 
  Home, 
  Search, 
  History, 
  Leaf, 
  Bot, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
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
  FileText
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { t } from "../../data/translations";
import "./WebLayout.css";

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { name: "scan", href: "/scan", icon: Search, label: "Scan Leaf" },
  { name: "diagnosis", href: "/diagnosis", icon: Leaf, label: "Diagnosis" },
  { name: "history", href: "/history", icon: History, label: "Scan History" },
  { name: "plants", href: "/plants", icon: Leaf, label: "My Plants" },
  { name: "chat", href: "/chat", icon: Bot, label: "AI Assistant" },
  { name: "guides", href: "/guides", icon: FileText, label: "Guides" },
  { name: "settings", href: "/settings", icon: Settings, label: "Settings" },
];

const userNavigation = [
  { name: "profile", href: "/profile", icon: User, label: "Profile" },
  { name: "notifications", href: "/notifications", icon: Bell, label: "Notifications" },
  { name: "help", href: "/help", icon: HelpCircle, label: "Help & Support" },
];

export function WebLayout({ children, user, onLogout, lang, onLangChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const location = useLocation();

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

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="web-layout">
      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`web-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <div className="brand-icon">
                <Leaf size={28} color="#22c55e" />
              </div>
              <span className="brand-text">LeafGuard AI</span>
            </div>
          )}
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? t("expandSidebar", lang) : t("collapseSidebar", lang)}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Primary">
          <ul className="nav-list" role="list">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name} className="nav-item">
                  <NavLink
                    to={item.href}
                    className={`nav-link ${active ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      <item.icon size={20} />
                    </span>
                    {!sidebarCollapsed && (
                      <span className="nav-label">{t(item.label.toLowerCase().replace(/\s+/g, ""), lang) || item.label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <span className="nav-indicator" aria-hidden="true" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {!sidebarCollapsed && (
            <div className="nav-divider" role="separator" />
          )}

          <ul className="nav-list" role="list">
            {userNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name} className="nav-item">
                  <NavLink
                    to={item.href}
                    className={`nav-link ${active ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      <item.icon size={20} />
                    </span>
                    {!sidebarCollapsed && (
                      <span className="nav-label">{t(item.label.toLowerCase().replace(/\s+/g, ""), lang) || item.label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <span className="nav-indicator" aria-hidden="true" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-user">
              <div className="user-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" />
                ) : (
                  <span>{user?.username?.charAt(0)?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.username || "User"}</span>
                <span className="user-role">{t("farmer", lang) || "Farmer"}</span>
              </div>
            </div>
          )}
          <div className="sidebar-actions">
            <button 
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "light" ? t("darkMode", lang) : t("lightMode", lang)}
              title={theme === "light" ? t("darkMode", lang) : t("lightMode", lang)}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              className="icon-btn"
              onClick={() => handleLangChange(lang === "ta" ? "en" : "ta")}
              aria-label={lang === "ta" ? "English" : "தமிழ்"}
              title={lang === "ta" ? "English" : "தமிழ்"}
            >
              <Globe size={20} />
            </button>
            {!sidebarCollapsed && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>{t("logout", lang)}</span>
              </button>
            )}
            {sidebarCollapsed && (
              <button 
                className="icon-btn danger"
                onClick={onLogout}
                aria-label={t("logout", lang)}
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Top Header */}
      <header className="web-header" role="banner">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t("openMenu", lang)}
            aria-expanded={mobileMenuOpen}
            aria-controls="sidebar"
          >
            <Menu size={24} />
          </button>
          
          {!sidebarCollapsed && (
            <div className="header-title">
              <h1>{t("pageTitle", lang) || "LeafGuard AI"}</h1>
            </div>
          )}
        </div>

        <div className="header-center">
          {/* Search placeholder - can be expanded */}
          <div className="header-search" role="search">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input 
              type="search" 
              placeholder={t("searchPlaceholder", lang) || "Search diseases, plants..."}
              className="search-input"
              aria-label={t("searchPlaceholder", lang) || "Search"}
            />
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button 
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "light" ? t("darkMode", lang) : t("lightMode", lang)}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
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
                {!sidebarCollapsed && <span className="user-name-header">{user?.username}</span>}
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
                <a href="/profile" className="dropdown-item" role="menuitem">
                  <User size={16} />
                  <span>{t("profile", lang)}</span>
                </a>
                <a href="/notifications" className="dropdown-item" role="menuitem">
                  <Bell size={16} />
                  <span>{t("notifications", lang)}</span>
                </a>
                <a href="/settings" className="dropdown-item" role="menuitem">
                  <Settings size={16} />
                  <span>{t("settings", lang)}</span>
                </a>
                <a href="/help" className="dropdown-item" role="menuitem">
                  <HelpCircle size={16} />
                  <span>{t("help", lang)}</span>
                </a>
                <div className="dropdown-divider" role="separator" />
                <button className="dropdown-item danger" role="menuitem" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>{t("logout", lang)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="web-main" role="main">
        <div className="main-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default WebLayout;