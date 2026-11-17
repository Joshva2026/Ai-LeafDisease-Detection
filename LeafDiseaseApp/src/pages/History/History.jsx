import { useState, useMemo } from "react";
import { FileText, Search, ArrowUpDown, Eye, History as HistoryIcon, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
import "./History.css";

function History({ history, onViewChange, onSelectPrediction, lang }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const handleSelectScan = (scan) => {
    const details = mapClassName(scan.disease);
    onSelectPrediction({
      success: true,
      disease: scan.disease,
      confidence: scan.confidence,
      original_url: scan.original_url,
      gradcam_url: scan.gradcam_url,
      timestamp: scan.timestamp,
      disease_formatted: details.displayName,
      health_status: details.isHealthy ? "Healthy" : "Diseased",
      plant: details.plantName,
      severity: details.severity || "Unknown"
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
          <span>{t("history", lang)}</span>
        </div>
        <h1 className="memory-title">{t("recentDiagnoses", lang)}</h1>
        <p className="memory-subtitle">
          {lang === "ta"
            ? "நீங்கள் பரிசோதித்த அனைத்து இலைகளின் வரலாற்றையும் இங்கு பாதுகாக்கப்படும்."
            : "All your analyzed leaves are preserved here. Review past diagnoses, Grad-CAM heatmaps, and AI Farmer Reports."}
        </p>
      </header>

      {/* CONTROLS BAR */}
      <div className="memory-controls-bar glass-card">
        <div className="memory-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t("scanGuidance", lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="memory-search-input"
            aria-label="Search history"
          />
        </div>

        <div className="memory-filter-tabs">
          <button
            className={`memory-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            {t("allCrops", lang)} ({safeHistory.length})
          </button>
          <button
            className={`memory-tab ${filter === "healthy" ? "active" : ""}`}
            onClick={() => setFilter("healthy")}
          >
            <CheckCircle size={14} /> {t("healthyStatus", lang)}
          </button>
          <button
            className={`memory-tab ${filter === "diseases" ? "active" : ""}`}
            onClick={() => setFilter("diseases")}
          >
            <AlertTriangle size={14} /> {t("diseasedStatus", lang)}
          </button>
        </div>

        <button className="memory-sort-btn" onClick={toggleSort} title={t("scanGuidanceShort", lang)}>
          <ArrowUpDown size={16} />
          <span>{sortOrder === "newest" ? t("newestFirst", lang) : t("oldestFirst", lang)}</span>
        </button>
      </div>

      {/* TIMELINE SPECIMEN GRID */}
      <div className="memory-timeline-content">
        {safeHistory.length === 0 ? (
          <div className="memory-empty-card glass-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <HistoryIcon size={56} className="empty-icon" style={{ color: "#22c55e", marginBottom: "20px" }} />
            <h3 style={{ fontSize: "22px", color: "#ffffff", marginBottom: "10px" }}>
              {lang === "ta" ? "வரலாறு காலியாக உள்ளது" : "No Scan History Yet"}
            </h3>
            <p style={{ color: "#9ca3af", maxWidth: "460px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
              {lang === "ta"
                ? "நீங்கள் இன்னும் எந்த இலையையும் பரிசோதிக்கவில்லை. முதலில் ஒரு இலை படம் எடுத்து நோய் கண்டறிதலைத் தொடங்கவும்."
                : "You haven't scanned any leaves yet. Start by taking a photo of a leaf to detect diseases."}
            </p>
            <button className="btn btn-hero" onClick={() => onViewChange("scan")} style={{ maxWidth: "280px", margin: "0 auto" }}>
              <Sparkles size={20} />
              <span>{lang === "ta" ? "முதல் স্কேன் தொடங்கு" : "Start First Scan"}</span>
            </button>
          </div>
        ) : filteredAndSortedList.length === 0 ? (
          <div className="memory-empty-card glass-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <Search size={44} className="empty-icon" style={{ color: "#9ca3af", marginBottom: "16px" }} />
            <h3 style={{ color: "#ffffff" }}>{lang === "ta" ? "பொருத்தமான முறைகள் இல்லை" : "No Matching Specimens"}</h3>
            <p style={{ color: "#9ca3af" }}>{lang === "ta" ? "தேடல் வார்த்தையை மாற்றி முயற்சிக்கவும்" : `No scans match "${searchQuery}". Try clearing your search or switching filters.`}</p>
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
                        <Sparkles size={14} />
                        <span>Grad-CAM</span>
                      </div>
                    )}
                  </div>

                  {/* SPECIMEN DETAILS */}
                  <div className="specimen-body">
                    <div className="specimen-meta-top">
                      <span className={`specimen-status-tag ${isHealthy ? 'healthy' : 'danger'}`}>
                        {isHealthy ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {isHealthy ? t("healthy", lang) : t("diseaseDetected", lang)}
                      </span>
                      <span className="specimen-date">{scan.timestamp}</span>
                    </div>

                    <h3 className="specimen-plant-title">{details.plantName}</h3>
                    <p className="specimen-disease-subtitle">{details.diseaseName}</p>

                    <div className="specimen-footer">
                      <span className="specimen-conf-score">{Math.round(scan.confidence)}% {t("confidence", lang)}</span>
                      <button className="btn-view-specimen">
                        <Eye size={16} />
                        <span>{t("openReport", lang)}</span>
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