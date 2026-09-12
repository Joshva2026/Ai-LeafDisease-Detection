import { useState, useMemo } from "react";
import { FileText, Search, ArrowUpDown, Eye, History as HistoryIcon, Sparkles } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
import diseaseData from "../../data/diseaseData";
import "./History.css";

function History({ history, onViewChange, onSelectPrediction, lang }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

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
      original_url: scan.original_url,
      gradcam_url: scan.gradcam_url,
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
      const isHealthy = scan.disease.toLowerCase().includes("healthy");
      if (filter === "healthy" && !isHealthy) return false;
      if (filter === "diseases" && isHealthy) return false;

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

    result.sort((a, b) => {
      const tsA = (a && a.timestamp) ? String(a.timestamp) : "";
      const tsB = (b && b.timestamp) ? String(b.timestamp) : "";
      if (sortOrder === "newest") {
        return tsB.localeCompare(tsA);
      } else {
        return tsA.localeCompare(tsB);
      }
    });

    return result;
  }, [history, filter, searchQuery, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === "newest" ? "oldest" : "newest");
  };

  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="leaf-memory-container fade-in-section">
      
      {/* HEADER SECTION */}
      <header className="memory-header">
        <div className="memory-badge">
          <span className="badge-pulse-dot"></span>
          <span>{lang === "ta" ? "இலை நினைவகம்" : "LEAF MEMORY ARCHIVE"}</span>
        </div>
        <h1 className="memory-title">{lang === "ta" ? "பரிசோதிக்கப்பட்ட இலைகள்" : "Preserved Leaf Specimens"}</h1>
        <p className="memory-subtitle">
          {lang === "ta" 
            ? "நீங்கள் பரிசோதித்த அனைத்து இலைகளின் வரலாறும் இங்கு பாதுகாக்கப்படும். AI அறிக்கைகளையும் வரைபடங்களையும் மீண்டும் பார்க்கலாம்."
            : '"Every leaf you analyze leaves a memory." Review your historical field pathology scans, Grad-CAM heatmaps, and past diagnoses.'}
        </p>
      </header>

      {/* CONTROLS BAR */}
      <div className="memory-controls-bar glass-card">
        <div className="memory-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ta" ? "தேடுங்கள்..." : "Search specimen archive..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="memory-search-input"
          />
        </div>

        <div className="memory-filter-tabs">
          <button
            className={`memory-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            {lang === "ta" ? "அனைத்தும்" : "All Memory"} ({safeHistory.length})
          </button>
          <button
            className={`memory-tab ${filter === "healthy" ? "active" : ""}`}
            onClick={() => setFilter("healthy")}
          >
            {t("healthyStatus", lang)}
          </button>
          <button
            className={`memory-tab ${filter === "diseases" ? "active" : ""}`}
            onClick={() => setFilter("diseases")}
          >
            {t("diseasedStatus", lang)}
          </button>
        </div>

        <button className="memory-sort-btn" onClick={toggleSort} title="Sort by Timestamp">
          <ArrowUpDown size={15} />
          <span>{sortOrder === "newest" ? "Newest Scans" : "Oldest Scans"}</span>
        </button>
      </div>

      {/* TIMELINE SPECIMEN GRID */}
      <div className="memory-timeline-content">
        {safeHistory.length === 0 ? (
          <div className="memory-empty-card glass-card" style={{ textAlignment: "center", padding: "48px 24px" }}>
            <HistoryIcon size={48} className="empty-icon" style={{ color: "#34d399", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", color: "#ffffff", marginBottom: "8px" }}>
              {lang === "ta" ? "இலை நினைவகம் காலியாக உள்ளது" : "LEAF MEMORY ARCHIVE IS EMPTY"}
            </h3>
            <p style={{ color: "#9ca3af", maxWidth: "460px", margin: "0 auto 20px auto", lineHeight: "1.6" }}>
              {lang === "ta"
                ? "நீங்கள் இன்னும் எந்த இலையையும் பரிசோதிக்கவில்லை. நீங்கள் பரிசோதிக்கும் இலைகள் மற்றும் AI மருத்துவ அறிக்கைகள் இங்கு சேமிக்கப்படும்."
                : "No specimens analyzed yet. Your analyzed leaves, Grad-CAM heatmaps, and AI Farmer Reports will be preserved here."}
            </p>
            <button className="btn btn-primary" onClick={() => onViewChange("scan")} style={{ maxWidth: "240px", margin: "0 auto" }}>
              {lang === "ta" ? "முதல் பரிசோதனையைத் தொடங்கு" : "START FIRST SCAN"}
            </button>
          </div>
        ) : filteredAndSortedList.length === 0 ? (
          <div className="memory-empty-card glass-card" style={{ textAlignment: "center", padding: "40px 24px" }}>
            <Search size={40} className="empty-icon" style={{ color: "#9ca3af", marginBottom: "12px" }} />
            <h3 style={{ color: "#ffffff" }}>No Matching Specimens Found</h3>
            <p style={{ color: "#9ca3af" }}>No scans match "{searchQuery}". Try clearing your search query or switching filters.</p>
          </div>
        ) : (
          <div className="specimen-timeline-list">
            {filteredAndSortedList.map((scan, idx) => {
              const details = mapClassName(scan.disease);
              const isHealthy = details.isHealthy;

              return (
                <div key={idx} className="specimen-card glass-card" onClick={() => handleSelectScan(scan)}>
                  
                  {/* SPECIMEN THUMBNAILS */}
                  <div className="specimen-visual-box">
                    <img 
                      src={getMediaUrl(scan.original_url)} 
                      alt={details.plantName} 
                      className="specimen-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=160";
                      }}
                    />
                    {scan.gradcam_url && (
                      <div className="specimen-overlay-badge">
                        <Sparkles size={12} />
                        <span>Grad-CAM</span>
                      </div>
                    )}
                  </div>

                  {/* SPECIMEN DETAILS */}
                  <div className="specimen-body">
                    <div className="specimen-meta-top">
                      <span className={`specimen-status-tag ${isHealthy ? 'healthy' : 'danger'}`}>
                        {isHealthy ? 'Healthy Specimen' : 'Pathology Detected'}
                      </span>
                      <span className="specimen-date">{scan.timestamp}</span>
                    </div>

                    <h3 className="specimen-plant-title">{details.plantName}</h3>
                    <p className="specimen-disease-subtitle">{details.diseaseName}</p>

                    <div className="specimen-footer">
                      <span className="specimen-conf-score">{Math.round(scan.confidence)}% AI Confidence Match</span>
                      <button className="btn-view-specimen">
                        <Eye size={14} />
                        <span>Open Report</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default History;
