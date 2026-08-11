import { useState } from "react";
import { FileText, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translationHelper";
import diseaseData from "../../data/diseaseData";
import "./History.css";

function History({ history, onViewChange, onSelectPrediction, lang }) {
  const [filter, setFilter] = useState("all");

  const handleSelectScan = (scan) => {
    const info = diseaseData[scan.disease] || {
      description: "No specific description available.",
      symptoms: ["No symptoms available."],
      treatment: "Consult local agricultural extensions.",
      prevention: "Maintain crop hygiene and ventilation."
    };

    onSelectPrediction({
      success: true,
      disease: scan.disease,
      confidence: scan.confidence,
      original_url: scan.thumbnail_base64,
      gradcam_url: scan.gradcam_base64,
      description: info.description,
      symptoms: info.symptoms,
      treatment: info.treatment,
      prevention: info.prevention,
      timestamp: scan.timestamp
    });
    
    // Switch to diagnosis detailed view
    onViewChange("diagnosis");
  };

  // Filter history list
  const filteredList = history.filter(scan => {
    const isHealthy = scan.disease.toLowerCase().includes("healthy");
    if (filter === "healthy") return isHealthy;
    if (filter === "diseases") return !isHealthy;
    return true;
  });

  // Chronological grouping helper
  const getTimelineGroup = (timestamp) => {
    if (!timestamp) return "earlier";
    try {
      const parts = timestamp.split(" ")[0].split("-");
      const scanDate = new Date(parts[0], parts[1] - 1, parts[2]);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (scanDate.getTime() === today.getTime()) {
        return "today";
      } else if (scanDate.getTime() === yesterday.getTime()) {
        return "yesterday";
      }
    } catch (e) {
      console.error("Date parse error:", e);
    }
    return "earlier";
  };

  // Grouped maps
  const groups = {
    today: [],
    yesterday: [],
    earlier: []
  };

  filteredList.forEach(scan => {
    const groupKey = getTimelineGroup(scan.timestamp);
    groups[groupKey].push(scan);
  });

  const getGroupLabel = (key) => {
    const labels = {
      today: lang === "ta" ? "இன்று" : "Today",
      yesterday: lang === "ta" ? "நேற்று" : "Yesterday",
      earlier: lang === "ta" ? "முன்னர்" : "Earlier"
    };
    return labels[key] || key;
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div>
        <h2 className="history-title">{t("history", lang)}</h2>
        <p className="history-subtitle">
          {lang === "ta" 
            ? "நீங்கள் முன்பு பகுப்பாய்வு செய்த இலைகளின் வரலாற்றுப் பதிவுகள்." 
            : "Review records of plant scans and health diagnoses over time."}
        </p>
      </div>

      {/* Tabs */}
      <div className="history-tabs-row">
        <button
          className={`history-tab-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {lang === "ta" ? "அனைத்தும்" : "All"} ({history.length})
        </button>
        <button
          className={`history-tab-btn ${filter === "healthy" ? "active" : ""}`}
          onClick={() => setFilter("healthy")}
        >
          {t("healthyStatus", lang)} ({history.filter(s => s.disease.toLowerCase().includes("healthy")).length})
        </button>
        <button
          className={`history-tab-btn ${filter === "diseases" ? "active" : ""}`}
          onClick={() => setFilter("diseases")}
        >
          {t("diseasedStatus", lang)} ({history.filter(s => !s.disease.toLowerCase().includes("healthy")).length})
        </button>
      </div>

      {/* Groups List */}
      <div className="fade-in-section" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filteredList.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-light)" }}>
            <FileText size={32} style={{ marginBottom: "12px", color: "var(--border-color-hover)" }} />
            <p>{lang === "ta" ? "வரலாற்றுப் பதிவுகள் எதுவும் இல்லை." : "No history logs found matching filters."}</p>
          </div>
        ) : (
          Object.keys(groups).map(groupKey => {
            const list = groups[groupKey];
            if (list.length === 0) return null;
            return (
              <div key={groupKey} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h4 className="history-group-title">{getGroupLabel(groupKey)}</h4>
                <div className="history-list-vertical">
                  {list.map((scan, idx) => {
                    const details = mapClassName(scan.disease);
                    const isHealthy = details.isHealthy;
                    return (
                      <div 
                        key={idx} 
                        className="history-log-card"
                        onClick={() => handleSelectScan(scan)}
                      >
                        <img 
                          src={scan.thumbnail_base64} 
                          alt={details.plantName} 
                          className="history-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=120";
                          }}
                        />
                        <div className="history-info">
                          <span className="history-plant">{details.plantName}</span>
                          <span className="history-condition">{details.diseaseName}</span>
                        </div>
                        <div className="history-meta">
                          <span className={`history-confidence-tag ${isHealthy ? "healthy" : "danger"}`} style={{ color: isHealthy ? "var(--color-healthy)" : "var(--color-danger)" }}>
                            {scan.confidence}%
                          </span>
                          <span className="history-time">{scan.timestamp.split(" ")[1] || ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default History;
