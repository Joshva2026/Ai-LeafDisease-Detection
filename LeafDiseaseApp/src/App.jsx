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
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });
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
      if (response.data.success && response.data.history && response.data.history.length > 0) {
        setHistory(response.data.history);
      } else {
        const localHist = JSON.parse(localStorage.getItem(`history_${user.username}`) || "[]");
        setHistory(localHist);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      const localHist = JSON.parse(localStorage.getItem(`history_${user.username}`) || "[]");
      setHistory(localHist);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, prediction]);



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

  const activePred = prediction;

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
              if (user) {
                const localHist = JSON.parse(localStorage.getItem(`history_${user.username}`) || "[]");
                const newEntry = {
                  ...result,
                  date: new Date().toISOString()
                };
                localHist.unshift(newEntry);
                localStorage.setItem(`history_${user.username}`, JSON.stringify(localHist.slice(0, 50)));
                setHistory(localHist);
              }
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
