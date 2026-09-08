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
    <div className="leaf-memory-container fade-in-section">
      
      {/* HEADER SECTION */}
      <header className="memory-header">
        <div className="memory-badge">
          <span className="badge-pulse-dot"></span>
          <span>LEAF MEMORY ARCHIVE</span>
        </div>
        <h1 className="memory-title">Preserved Leaf Specimens</h1>
        <p className="memory-subtitle">
          "Every leaf you analyze leaves a memory." Review your historical field pathology scans, Grad-CAM heatmaps, and past diagnoses.
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
            {lang === "ta" ? "அனைத்தும்" : "All Memory"} ({history.length})
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
        {filteredAndSortedList.length === 0 ? (
          <div className="memory-empty-card glass-card">
            <HistoryIcon size={40} className="empty-icon" />
            <h3>No Leaf Memory Records Found</h3>
            <p>No scans match your current filter or search terms. Perform a new diagnostic scan to add specimens.</p>
            <button className="btn btn-primary mt-3" onClick={() => onViewChange("scan")}>
              Launch Scan Chamber
            </button>
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
