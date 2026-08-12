import { useState, useEffect } from "react";
import Auth from "./components/Auth/Auth";
import api from "./api/api";
import Home from "./pages/Home/Home";
import Scan from "./pages/Scan/Scan";
import Diagnosis from "./pages/Diagnosis/Diagnosis";
import MyPlants from "./pages/MyPlants/MyPlants";
import History from "./pages/History/History";
import PlantGuide from "./pages/PlantGuide/PlantGuide";
import Profile from "./pages/Profile/Profile";
import About from "./pages/About/About";
import Navbar from "./components/Navbar/navbar";
import Chatbot from "./components/Chatbot/Chatbot";
import { Loader2 } from "lucide-react";
import SlideIndicator from "./components/SlideIndicator/SlideIndicator";

import MobileHeader from "./components/Navbar/MobileHeader";
import BottomNav from "./components/Navbar/BottomNav";

function App() {
  const [user, setUser] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState("en"); // "en" or "ta"
  const [translatedPred, setTranslatedPred] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [view, setView] = useState("home"); // "home", "myplants", "scan", "history", "profile", "diagnosis"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

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

  // Check user session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Parallax background glows & IntersectionObserver scroll triggers
  useEffect(() => {
    let tick = false;
    const handleScroll = () => {
      if (!tick) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const blob1 = document.querySelector(".glow-blob-1");
          const blob2 = document.querySelector(".glow-blob-2");
          const blob4 = document.querySelector(".glow-blob-4");
          if (blob1) blob1.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
          if (blob2) blob2.style.transform = `translate3d(0, ${-y * 0.06}px, 0)`;
          if (blob4) blob4.style.transform = `translate3d(0, ${y * 0.1}px, 0)`;
          tick = false;
        });
        tick = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

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
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [view]); // Run re-binding whenever the view swaps

  // Fetch scan history
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/history?username=${user.username}`);
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, prediction]);

  // Translate prediction details
  useEffect(() => {
    const translatePrediction = async () => {
      if (!prediction || !prediction.success) {
        setTranslatedPred(null);
        return;
      }

      if (lang === "ta") {
        setTranslating(true);
        try {
          const translateText = async (text) => {
            const res = await api.post("/api/chat", {
              message: `Translate the following text to Tamil. Output ONLY the translated Tamil text. Do not add any introductory message, chat text, or quotes:\n\n${text}`
            });
            return res.data.success ? res.data.reply.trim() : text;
          };

          const transDisease = await translateText(prediction.disease);
          const transDesc = await translateText(prediction.description);
          const transTreatment = await translateText(prediction.treatment);
          const transPrevention = await translateText(prediction.prevention);

          const transSymptoms = [];
          for (const sym of prediction.symptoms) {
            const ts = await translateText(sym);
            transSymptoms.push(ts);
          }

          setTranslatedPred({
            ...prediction,
            disease: transDisease,
            description: transDesc,
            treatment: transTreatment,
            prevention: transPrevention,
            symptoms: transSymptoms
          });
        } catch (err) {
          console.error("Auto translation failed:", err);
          setTranslatedPred(prediction);
        } finally {
          setTranslating(false);
        }
      } else {
        setTranslatedPred(null);
      }
    };

    translatePrediction();
  }, [lang, prediction]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPrediction(null);
    setHistory([]);
    setView("home");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  const activePred = (lang === "ta" && translatedPred) ? translatedPred : prediction;

  return (
    <div className="app-container">
      {/* Ambient Lighting Background Glows */}
      <div className="ambient-glow-container">
        <div className="glow-blob glow-blob-1"></div>
        <div className="glow-blob glow-blob-2"></div>
        <div className="glow-blob glow-blob-3"></div>
        <div className="glow-blob glow-blob-4"></div>
      </div>

      {/* Desktop Navbar (hidden on mobile via CSS) */}
      <Navbar 
        activeView={view} 
        onViewChange={setView} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onLogout={handleLogout} 
        lang={lang}
        onLangChange={setLang}
      />

      {/* Mobile Header (hidden on desktop via CSS) */}
      <MobileHeader 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onViewChange={setView} 
        lang={lang} 
      />

      {/* Mobile Bottom Navigation (hidden on desktop via CSS) */}
      <BottomNav 
        activeView={view} 
        onViewChange={setView} 
        lang={lang} 
      />

      {/* Dynamic Translation Progress Overlay */}
      {translating && (
        <div style={{
          position: "fixed",
          top: "96px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(22, 34, 29, 0.95)",
          padding: "8px 18px",
          borderRadius: "30px",
          boxShadow: "var(--shadow-medium)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-white)",
          fontSize: "12px",
          fontWeight: "600",
          zIndex: 9999
        }}>
          <Loader2 size={14} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />
          <span>ஆவணங்கள் மொழியாக்கம் செய்யப்படுகிறது... (Translating...)</span>
        </div>
      )}

      {/* Main Pages scroll viewport container */}
      <div className="scroll-container">
        {view === "home" && (
          <Home 
            user={user} 
            history={history} 
            onViewChange={setView} 
            onSelectPrediction={(scan) => {
              setPrediction(scan);
              setView("diagnosis");
            }}
            lang={lang}
          />
        )}

        {view === "scan" && (
          <Scan 
            onPredictionSuccess={(result) => {
              setPrediction(result);
              setView("diagnosis");
            }}
            lang={lang}
          />
        )}

        {view === "diagnosis" && (
          <Diagnosis 
            prediction={activePred} 
            onViewChange={setView} 
            lang={lang}
          />
        )}

        {view === "myplants" && (
          <MyPlants 
            user={user} 
            onViewChange={setView} 
            lang={lang}
          />
        )}

        {view === "history" && (
          <History 
            history={history} 
            onViewChange={setView} 
            onSelectPrediction={(scan) => {
              setPrediction(scan);
              setView("diagnosis");
            }}
            lang={lang}
          />
        )}

        {view === "guide" && (
          <PlantGuide 
            onViewChange={setView} 
            lang={lang}
          />
        )}

        {view === "about" && (
          <About />
        )}

        {view === "profile" && (
          <Profile 
            user={user} 
            history={history} 
            lang={lang} 
            onLangChange={setLang} 
            onLogout={handleLogout} 
            onProfileUpdate={(updatedUser) => setUser(updatedUser)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
      </div>

      {/* Dynamic chat helper widget */}
      <Chatbot currentDisease={prediction?.disease || null} />

      {/* Slide Indicator (only shows if multiple slides are detected) */}
      <SlideIndicator />
    </div>
  );
}

export default App;