import { useState, useMemo } from "react";
import { Search, ArrowLeft, Info, Activity, Stethoscope, ShieldCheck, Maximize2, X, Sparkles, Filter, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { plantGuideData } from "../../data/plantGuideData";
import diseaseData from "../../data/diseaseData";
import { t } from "../../data/translations";
import { getMediaUrl } from "../../utils/mediaUrl";
import "./PlantGuide.css";

function PlantGuide({ onViewChange, lang }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecimen, setActiveSpecimen] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Available unique species
  const speciesList = useMemo(() => {
    const set = new Set();
    plantGuideData.forEach(item => set.add(item.species));
    return ["all", ...Array.from(set)];
  }, []);

  const categories = [
    { id: "all", label: t("allCrops", lang) },
    { id: "healthy", label: t("healthyStatus", lang) },
    { id: "bacterial", label: t("bacterial", lang) },
    { id: "fungal", label: t("fungal", lang) },
    { id: "viral", label: t("viral", lang) }
  ];

  const filteredSpecimens = useMemo(() => {
    return plantGuideData.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.species.toLowerCase().includes(query) ||
        item.diseaseName.toLowerCase().includes(query) ||
        item.latin.toLowerCase().includes(query);

      const matchesCategory = (selectedCategory === "all") || (item.category === selectedCategory);
      const matchesSpecies = (selectedSpecies === "all") || (item.species.toLowerCase() === selectedSpecies.toLowerCase());

      return matchesSearch && matchesCategory && matchesSpecies;
    });
  }, [searchQuery, selectedCategory, selectedSpecies]);

  // Group specimens by species if showing all or specific species
  const groupedBySpecies = useMemo(() => {
    const map = {};
    filteredSpecimens.forEach(item => {
      if (!map[item.species]) map[item.species] = [];
      map[item.species].push(item);
    });
    return map;
  }, [filteredSpecimens]);

  return (
    <div className="botanical-archive-page fade-in-section">
      
      {/* ARCHIVE HERO HEADER */}
      <header className="archive-hero">
        <div className="archive-badge">
          <span className="badge-pulse-dot"></span>
          <span>{t("guides", lang)}</span>
        </div>
        <h1 className="archive-title">
          {lang === "ta" 
            ? "தாவர நோய்கள் பற்றி அனைத்தையும் அறியுங்கள்" 
            : "Know The Leaf. Understand The Disease."
          }
        </h1>
        <p className="archive-subtitle">
          {lang === "ta" 
            ? "38 வகையான பயிர் நோய்கள் மற்றும் 14 வகையான பயிர்களைப் பற்றிய விரிவான தகவல்கள்." 
            : "Learn about 38 plant diseases across 14 major crops. Detailed symptoms, causes, treatments, and prevention."
          }
        </p>
      </header>

      {/* ARCHIVE CONTROLS & FILTERING BAR */}
      <div className="archive-bar glass-card">
        {/* Search Input */}
        <div className="archive-search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ta" ? "பயிர் அல்லது நோயை தேடுங்கள்..." : "Search crops, diseases, or symptoms..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="archive-search-input"
            aria-label="Search plant guide"
          />
        </div>

        {/* Category Tabs */}
        <div className="archive-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`archive-cat-tab ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Species Filter Pills */}
        <div className="archive-species-pills">
          <span className="species-filter-lbl">{lang === "ta" ? "பயிர் வகைகள்:" : "CROPS:"}</span>
          {speciesList.map((sp) => (
            <button
              key={sp}
              className={`species-pill ${selectedSpecies === sp ? "active" : ""}`}
              onClick={() => setSelectedSpecies(sp)}
            >
              {sp === "all" ? (lang === "ta" ? "அனைத்து பயிர்கள்" : "ALL CROPS") : sp.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* BOTANICAL SPECIMENS GRID BY SPECIES */}
      <div className="archive-specimen-viewport">
        {Object.keys(groupedBySpecies).length === 0 ? (
          <div className="archive-empty-card glass-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Leaf size={56} color="#22c55e" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", color: "#fff", marginBottom: "10px" }}>
              {lang === "ta" ? "நீங்கள் தேடிய பயிர் அல்லது நோய் கிடைக்கவில்லை" : "No Matching Records Found"}
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
              {lang === "ta" ? "தேடல் வார்த்தையை மாற்றி முயற்சிக்கவும்" : "Try searching for another plant species or resetting your filter tabs."}
            </p>
            <button className="btn btn-secondary" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedSpecies("all"); }}>
              {t("resetFilters", lang)}
            </button>
          </div>
        ) : (
          Object.entries(groupedBySpecies).map(([speciesName, items]) => (
            <section key={speciesName} className="species-block-section">
              
              <div className="species-block-header">
                <div className="species-title-group">
                  <h2 className="species-main-name">{speciesName.toUpperCase()}</h2>
                  <span className="species-latin-name">{items[0]?.latin}</span>
                </div>
                <span className="species-count-badge">{items.length} {lang === "ta" ? "நோய் வகைகள்" : "Conditions"}</span>
              </div>

              <div className="specimens-editorial-grid">
                {items.map((specimen) => {
                  const diseaseMeta = diseaseData[specimen.key] || {};
                  
                  return (
                    <div 
                      key={specimen.id} 
                      className={`editorial-specimen-card glass-card ${specimen.category}`}
                      onClick={() => setActiveSpecimen(specimen)}
                    >
                      <div className="specimen-img-frame">
                        <img 
                          src={getMediaUrl(specimen.image)} 
                          alt={`${specimen.species} - ${specimen.diseaseName}`}
                          className="specimen-real-img" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=300";
                          }}
                        />
                        <div className={`category-tag ${specimen.category}`}>
                          {specimen.category.toUpperCase()}
                        </div>
                        <button 
                          className="btn-zoom-img"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(getMediaUrl(specimen.image));
                          }}
                          title={lang === "ta" ? "படத்தை பெரிதாக்கு" : "Zoom Specimen Image"}
                          aria-label={lang === "ta" ? "படத்தை பெரிதாக்கு" : "Zoom image"}
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>

                      <div className="specimen-card-content">
                        <span className="specimen-crop-tag">{specimen.species}</span>
                        <h3 className="specimen-disease-heading">{specimen.diseaseName}</h3>
                        
                        <p className="specimen-visual-desc">
                          {specimen.visuals}
                        </p>

                        <div className="specimen-card-footer">
                          <span className="specimen-key-code">#{specimen.key.split('___')[1] || 'healthy'}</span>
                          <button className="btn-explore-specimen">
                            <span>{t("learnMore", lang)}</span>
                            <Sparkles size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          ))
        )}
      </div>

      {/* SPECIMEN EXPANDABLE DETAIL MODAL */}
      {activeSpecimen && (
        <div className="specimen-detail-modal-overlay" onClick={() => setActiveSpecimen(null)} role="dialog" aria-modal="true" aria-labelledby="specimen-title">
          <div className="specimen-detail-modal glass-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-top-bar">
              <span className="modal-specimen-code">{lang === "ta" ? "தாவர பதிவு" : "Botanical Record"} #{activeSpecimen.key}</span>
              <button className="modal-close-btn" onClick={() => setActiveSpecimen(null)} aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <div className="modal-body-layout">
              <div className="modal-img-column">
                <img 
                  src={getMediaUrl(activeSpecimen.image)} 
                  alt={activeSpecimen.diseaseName} 
                  className="modal-specimen-img"
                  onClick={() => setFullscreenImage(getMediaUrl(activeSpecimen.image))}
                />
                <span className="modal-zoom-hint">{lang === "ta" ? "படத்தை காணקלிக் செய்யவும்" : "Click image to enlarge"}</span>
              </div>

              <div className="modal-info-column">
                <span className="modal-species-tag">{activeSpecimen.species} ({activeSpecimen.latin})</span>
                <h2 id="specimen-title" className="modal-disease-title">{activeSpecimen.diseaseName}</h2>

                <div className="modal-section">
                  <h4><Info size={18} color="#22c55e" /> {t("summary", lang)}</h4>
                  <p>{activeSpecimen.description}</p>
                </div>

                <div className="modal-section">
                  <h4><Activity size={18} color="#f59e0b" /> {t("symptoms", lang)}</h4>
                  <p>{activeSpecimen.visuals}</p>
                </div>

                {diseaseData[activeSpecimen.key] && (
                  <>
                    <div className="modal-section">
                      <h4><Stethoscope size={18} color="#3b82f6" /> {t("treatmentManagement", lang)}</h4>
                      <p>{diseaseData[activeSpecimen.key].treatment}</p>
                    </div>

                    <div className="modal-section">
                      <h4><ShieldCheck size={18} color="#10b981" /> {t("prevention", lang)}</h4>
                      <p>{diseaseData[activeSpecimen.key].prevention}</p>
                    </div>
                  </>
                )}

                <button 
                  className="btn btn-hero btn-modal-scan-this"
                  onClick={() => {
                    setActiveSpecimen(null);
                    onViewChange("scan");
                  }}
                >
                  <Sparkles size={18} />
                  <span>{lang === "ta" ? "போலிய இலை ஸ்கேன் செய்க" : "Scan Similar Leaf"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN HIGH-RES IMAGE VIEWER */}
      {fullscreenImage && (
        <div className="fullscreen-viewer slide-section" onClick={() => setFullscreenImage(null)} role="dialog" aria-modal="true" aria-label={t("fullscreenView", lang)}>
          <div className="fs-header">
            <span>{lang === "ta" ? "உயர் துணுக்கம் படம்" : "High-Resolution Specimen"}</span>
            <button className="fs-close" onClick={() => setFullscreenImage(null)} aria-label="Close"><X size={26}/></button>
          </div>
          <div className="fs-img-container">
            <img src={fullscreenImage} alt={t("fullscreenSpecimen", lang)} className="fs-img" />
          </div>
        </div>
      )}

    </div>
  );
}

export default PlantGuide;