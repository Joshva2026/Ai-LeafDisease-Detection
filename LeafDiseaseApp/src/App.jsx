import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { t } from "./data/translations";
import Auth from "./components/Auth/Auth";
import api from "./api/api";
import historyService from "./services/historyService";
import Home from "./pages/Home/Home";
import Scan from "./pages/Scan/Scan";
import Diagnosis from "./pages/Diagnosis/Diagnosis";
import MyPlants from "./pages/MyPlants/MyPlants";
import History from "./pages/History/History";
import PlantGuide from "./pages/PlantGuide/PlantGuide";
import Profile from "./pages/Profile/Profile";
import About from "./pages/About/About";
import Chatbot from "./components/Chatbot/Chatbot";
import { Loader2 } from "lucide-react";
import SlideIndicator from "./components/SlideIndicator/SlideIndicator";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import HowTo from "./pages/HowTo/HowTo";
import { WebLayout } from "./components/Layout/WebLayout";
import { MobileLayout } from "./components/Layout/MobileLayout";
import "./styles/designSystem.css";
import "./App.css";

function AppRoutes({ user, setUser, lang, setLang, theme, setTheme, onLogout, toggleTheme, prediction, setPrediction, history, setHistory }) {
  // Load scan history from local storage (IndexedDB/Capacitor)
  const loadHistory = async () => {
    if (!user) return;
    try {
      const scans = await historyService.getScans(user.username);
      // Deduplicate by firestoreId or id
      const seen = new Set();
      const uniqueScans = scans.filter(scan => {
        const key = scan.firestoreId || scan.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setHistory(uniqueScans);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory([]);
    }
  };

  // Track current user to prevent stale requests
  const currentUserRef = useRef(null);
  const loadHistoryRef = useRef(0);

  useEffect(() => {
    if (user) {
      currentUserRef.current = user.username;
      const loadId = ++loadHistoryRef.current;
      loadHistory().then(() => {
        // Only update state if this is still the latest request for the current user
        if (loadId === loadHistoryRef.current && currentUserRef.current === user.username) {
          // State already updated in loadHistory
        }
      });
    } else {
      currentUserRef.current = null;
      setHistory([]);
    }
  }, [user]);

  const handleScanSuccess = (result) => {
    // Always set prediction state first — prediction succeeded
    const predictionForState = {
      success: true,
      disease: result.disease || "Unknown",
      plant: result.plant || "Unknown Plant",
      health_status: result.health_status || "Unknown",
      disease_formatted: result.disease_formatted || result.disease || "Unknown Disease",
      severity: result.severity || "Unknown",
      confidence: result.confidence || 0,
      top_predictions: result.top_predictions || [],
      gradcam_url: result.gradcam_url || "",
      original_url: result.original_url || ""
    };
    setPrediction(predictionForState);

    // Save to history - failure must NOT block prediction
    if (user) {
      (async () => {
        try {
          const historyEntry = {
            disease: result.disease || "Unknown",
            plant: result.plant || "Unknown Plant",
            confidence: result.confidence || 0,
            original_url: result.original_url || "",
            gradcam_url: result.gradcam_url || "",
            disease_formatted: result.disease_formatted || result.disease || "Unknown Disease",
            health_status: result.health_status || "Unknown",
            severity: result.severity || "Unknown",
            top_predictions: result.top_predictions || [],
            timestamp: new Date().toISOString()
          };
          const firestoreId = await historyService.addScan(historyEntry);
          // Optimistically add to local state to avoid full reload
          const newEntry = {
            ...historyEntry,
            id: firestoreId,
            firestoreId: firestoreId
          };
          setHistory(prev => {
            // Deduplicate by firestoreId
            const seen = new Set();
            return [newEntry, ...prev].filter(scan => {
              const key = scan.firestoreId || scan.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        } catch (e) {
          console.warn("History could not be saved", e);
        }
      })();
    }

    // Navigation to diagnosis will be handled by Scan component via navigate
  };

  return (
    <ErrorBoundary lang={lang}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Auth onLoginSuccess={setUser} />} />
        <Route path="/register" element={<Auth onLoginSuccess={setUser} mode="register" />} />
        <Route path="/forgot-password" element={<Auth onLoginSuccess={setUser} mode="forgot" />} />
        
        {/* Protected Routes - Desktop */}
        <Route 
          path="/dashboard" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Home 
                user={user} 
                history={history} 
                onSelectPrediction={setPrediction}
                lang={lang}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/scan" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Scan 
                onPredictionSuccess={handleScanSuccess}
                lang={lang}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/diagnosis" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Diagnosis 
                prediction={prediction} 
                lang={lang}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/history" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <History 
                history={history} 
                onSelectPrediction={setPrediction}
                lang={lang}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/plants" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <MyPlants 
                user={user} 
                history={history}
                lang={lang}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Chatbot currentDisease={prediction?.disease || null} lang={lang} />
            </WebLayout>
          } 
        />
        <Route 
          path="/guides" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <PlantGuide lang={lang} />
            </WebLayout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Profile 
                user={user} 
                history={history} 
                lang={lang} 
                onLangChange={setLang} 
                onLogout={onLogout} 
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <Profile 
                user={user} 
                history={history} 
                lang={lang} 
                onLangChange={setLang} 
                onLogout={onLogout} 
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </WebLayout>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <div className="page-wrapper">
                <h1 className="page-title">{t("notifications", lang)}</h1>
                <p className="page-subtitle">Coming soon...</p>
              </div>
            </WebLayout>
          } 
        />
        <Route 
          path="/help" 
          element={
            <WebLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
            >
              <About />
            </WebLayout>
          } 
        />

        {/* Protected Routes - Mobile */}
        <Route 
          path="/m/*" 
          element={
            <MobileLayout 
              user={user} 
              onLogout={onLogout} 
              lang={lang} 
              onLangChange={setLang}
              onScanClick={() => {}}
            >
              <Routes>
                <Route path="home" element={<Home user={user} history={history} onSelectPrediction={setPrediction} lang={lang} />} />
                <Route path="scan" element={<Scan onPredictionSuccess={handleScanSuccess} lang={lang} />} />
                <Route path="history" element={<History history={history} onSelectPrediction={setPrediction} lang={lang} />} />
                <Route path="plants" element={<MyPlants user={user} history={history} lang={lang} />} />
                <Route path="help" element={<div>Help</div>} />
              </Routes>
            </MobileLayout>
          } 
        />

        {/* Landing Page - Redirect to dashboard if logged in */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "ta";
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Apply theme settings
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist Language
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // Check user session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // IntersectionObserver scroll triggers
  useEffect(() => {
    // Fade-in sections Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.05 }
    );

    const observeSections = () => {
      const sections = document.querySelectorAll(".fade-in-section");
      sections.forEach((sec) => observer.observe(sec));
    };

    // Brief delay to allow React viewport changes to mount elements
    const timer = setTimeout(observeSections, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPrediction(null);
    setHistory([]);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!user) {
    return (
      <BrowserRouter>
        <Auth
          onLoginSuccess={(u) => {
            setUser(u);
            const hasSeen = localStorage.getItem(`onboarded_${u.username}`);
            if (!hasSeen) {
              setShowOnboarding(true);
            }
          }}
        />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <AppRoutes 
          user={user} 
          setUser={setUser}
          lang={lang} 
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          toggleTheme={toggleTheme}
          prediction={prediction}
          setPrediction={setPrediction}
          history={history}
          setHistory={setHistory}
        />

        {showOnboarding && (
          <div className="onboarding-overlay">
            <div className="onboarding-modal">
              <div className="onboarding-content">
                <h2>{t("welcome", lang)}</h2>
                <p>{t("onboardingText", lang)}</p>
                <button 
                  className="btn btn-primary btn-lg btn-block"
                  onClick={() => {
                    setShowOnboarding(false);
                    if (user) {
                      localStorage.setItem(`onboarded_${user.username}`, "true");
                    }
                  }}
                >
                  {t("getStarted", lang)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic chat helper widget */}
        <Chatbot currentDisease={prediction?.disease || null} lang={lang} />

        {/* Slide Indicator (only shows if multiple slides are detected) */}
        <SlideIndicator />
      </div>
    </BrowserRouter>
  );
}

export default App;