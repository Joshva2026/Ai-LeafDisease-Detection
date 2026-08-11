import { Home, Camera, Leaf, History, User } from "lucide-react";
import "./BottomNav.css";

function BottomNav({ activeView, onViewChange }) {
  const navItems = [
    { id: "home", label: "Home", icon: <Home size={20} /> },
    { id: "myplants", label: "My Plants", icon: <Leaf size={20} /> },
    { id: "scan", label: "Scan", icon: <Camera size={22} />, isScan: true },
    { id: "history", label: "History", icon: <History size={20} /> },
    { id: "profile", label: "Profile", icon: <User size={20} /> }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        if (item.isScan) {
          return (
            <button
              key={item.id}
              className={`bottom-nav-item scan-item ${activeView === "scan" ? "active" : ""}`}
              onClick={() => onViewChange("scan")}
            >
              <div className="scan-circle">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
