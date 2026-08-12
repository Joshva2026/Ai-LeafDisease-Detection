import { useState, useMemo } from "react";
import { FileText, Search, ArrowUpDown, Eye } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import diseaseData from "../../data/diseaseData";
import "./History.css";

function History({ history, onViewChange, onSelectPrediction, lang }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

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
    
    onViewChange("diagnosis");
  };

  const filteredAndSortedList = useMemo(() => {
    let result = history.filter(scan => {
      // 1. Status Filter
      const isHealthy = scan.disease.toLowerCase().includes("healthy");
      if (filter === "healthy" && !isHealthy) return false;
      if (filter === "diseases" && isHealthy) return false;

      // 2. Search Filter
      if (searchQuery.trim() !== "") {
        const details = mapClassName(scan.disease);
        const query = searchQuery.toLowerCase();
        if (
          !details.plantName.toLowerCase().includes(query) &&
          !details.diseaseName.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });

    // 3. Sort
    result.sort((a, b) => {
      // Very simple string comparison for "YYYY-MM-DD HH:MM:SS"
      if (sortOrder === "newest") {
        return b.timestamp.localeCompare(a.timestamp);
      } else {
        return a.timestamp.localeCompare(b.timestamp);
      }
    });

    return result;
  }, [history, filter, searchQuery, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === "newest" ? "oldest" : "newest");
  };

  return (
    <div className="page-wrapper fade-in-section">
      <div className="history-header-block">
        <div>
          <h2 className="history-title">{t("history", lang)}</h2>
          <p className="history-subtitle">
            {lang === "ta" 
              ? "நீங்கள் முன்பு பகுப்பாய்வு செய்த இலைகளின் வரலாற்றுப் பதிவுகள்." 
              : "Review records of plant scans and health diagnoses over time."}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="history-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ta" ? "தேடுங்கள்..." : "Search scans..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
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
            {t("healthyStatus", lang)}
          </button>
          <button
            className={`history-tab-btn ${filter === "diseases" ? "active" : ""}`}
            onClick={() => setFilter("diseases")}
          >
            {t("diseasedStatus", lang)}
          </button>
        </div>
        
        <button className="sort-btn" onClick={toggleSort} title="Sort by Date">
          <ArrowUpDown size={16} />
          <span>{sortOrder === "newest" ? (lang === "ta" ? "புதியது" : "Newest") : (lang === "ta" ? "பழையது" : "Oldest")}</span>
        </button>
      </div>

      {/* History Content */}
      <div className="history-content">
        {filteredAndSortedList.length === 0 ? (
          <div className="card empty-state">
            <FileText size={36} className="empty-icon" />
            <p>{lang === "ta" ? "வரலாற்றுப் பதிவுகள் எதுவும் இல்லை." : "No history logs found matching criteria."}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{lang === "ta" ? "படம்" : "Image"}</th>
                    <th>{lang === "ta" ? "தாவரம் & நோய்" : "Plant & Disease"}</th>
                    <th>{lang === "ta" ? "நம்பிக்கை" : "Confidence"}</th>
                    <th>{lang === "ta" ? "நிலை" : "Status"}</th>
                    <th>{lang === "ta" ? "தேதி" : "Date"}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedList.map((scan, idx) => {
                    const details = mapClassName(scan.disease);
                    const isHealthy = details.isHealthy;
                    return (
                      <tr key={idx} className="history-table-row" onClick={() => handleSelectScan(scan)}>
                        <td>
                          <img 
                            src={scan.thumbnail_base64} 
                            alt={details.plantName} 
                            className="history-thumb-table"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=120";
                            }}
                          />
                        </td>
                        <td>
                          <div className="history-plant-info">
                            <span className="history-plant">{details.plantName}</span>
                            <span className="history-condition">{details.diseaseName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="confidence-text">{scan.confidence}%</span>
                        </td>
                        <td>
                          <span className={`status-pill ${isHealthy ? 'healthy' : 'danger'}`}>
                            {isHealthy ? t("healthyStatus", lang) : t("diseasedStatus", lang)}
                          </span>
                        </td>
                        <td>
                          <span className="history-time-table">{scan.timestamp}</span>
                        </td>
                        <td className="history-action-cell">
                          <button className="view-btn">
                            <Eye size={16} />
                            <span>{lang === "ta" ? "காண்க" : "View"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View */}
            <div className="history-mobile-list">
              {filteredAndSortedList.map((scan, idx) => {
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
                      <span className="history-time-mobile">{scan.timestamp.split(" ")[0]}</span>
                    </div>
                    <div className="history-meta">
                      <span className={`status-pill-mobile ${isHealthy ? 'healthy' : 'danger'}`}>
                        {isHealthy ? "Healthy" : "Diseased"}
                      </span>
                      <span className="confidence-text-mobile">{scan.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;
