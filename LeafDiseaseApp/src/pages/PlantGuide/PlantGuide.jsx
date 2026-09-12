import { useState, useMemo } from "react";
import { Search, ArrowLeft, Info, Activity, Stethoscope, ShieldCheck, Maximize2, X, Sparkles, Filter, Leaf } from "lucide-react";
import { plantGuideData } from "../../data/plantGuideData";
import diseaseData from "../../data/diseaseData";
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
    { id: "all", label: lang === "ta" ? "அனைத்தும்" : "ALL" },
    { id: "healthy", label: lang === "ta" ? "ஆரோக்கியமான" : "HEALTHY" },
    { id: "bacterial", label: lang === "ta" ? "பாக்டீரியா" : "BACTERIAL" },
    { id: "fungal", label: lang === "ta" ? "பூஞ்சை" : "FUNGAL" },
    { id: "viral", label: lang === "ta" ? "வைரஸ்" : "VIRAL" }
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
          <span>{lang === "ta" ? "பயிர் நோய்கள் களஞ்சியம்" : "BOTANICAL ARCHIVE"}</span>
        </div>
        <h1 className="archive-title">{lang === "ta" ? "இலையை அறியுங்கள். நோயைப் புரிந்து கொள்ளுங்கள்." : "Know The Leaf. Understand The Disease."}</h1>
        <p className="archive-subtitle">
          {lang === "ta" ? "38 வகையான பயிர் நோய்கள் மற்றும் 14 வகையான பயிர்களைப் பற்றிய விரிவான தகவல்களை உள்ளடக்கிய டிஜிட்டல் நூலகம்." : "An editorial specimen library powered by 38 dataset leaf pathology classes. Inspect real leaf specimens across 14 crop species."}
        </p>
      </header>

      {/* ARCHIVE CONTROLS & FILTERING BAR */}
      <div className="archive-bar glass-card">
        {/* Search Input */}
        <div className="archive-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ta" ? "பயிர் அல்லது நோயை தேடுங்கள்..." : "Search botanical archive (e.g. Tomato, Early Blight)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="archive-search-input"
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
          <span className="species-filter-lbl">{lang === "ta" ? "பயிர் வகைகள்:" : "SPECIES:"}</span>
          {speciesList.map((sp) => (
            <button
              key={sp}
              className={`species-pill ${selectedSpecies === sp ? "active" : ""}`}
              onClick={() => setSelectedSpecies(sp)}
            >
              {sp === "all" ? "ALL SPECIES" : sp.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* BOTANICAL SPECIMENS GRID BY SPECIES */}
      <div className="archive-specimen-viewport">
        {Object.keys(groupedBySpecies).length === 0 ? (
          <div className="archive-empty-card glass-card">
            <Leaf size={44} style={{ color: "#34d399", marginBottom: "12px" }} />
            <h3>{lang === "ta" ? "நீங்கள் தேடிய நோய் அல்லது பயிர் கிடைக்கவில்லை." : "No specimens found matching your criteria."}</h3>
            <p>Try searching for another plant species or resetting your filter tabs.</p>
          </div>
        ) : (
          Object.entries(groupedBySpecies).map(([speciesName, items]) => (
            <section key={speciesName} className="species-block-section">
              
              <div className="species-block-header">
                <div className="species-title-group">
                  <h2 className="species-main-name">{speciesName.toUpperCase()}</h2>
                  <span className="species-latin-name">{items[0]?.latin}</span>
                </div>
                <span className="species-count-badge">{items.length} REAL DATASET SPECIMENS</span>
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
                          src={specimen.image} 
                          alt={`${specimen.species} - ${specimen.diseaseName}`}
                          className="specimen-real-img" 
                        />
                        <div className={`category-tag ${specimen.category}`}>
                          {specimen.category.toUpperCase()}
                        </div>
                        <button 
                          className="btn-zoom-img"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(specimen.image);
                          }}
                          title="Zoom Specimen Image"
                        >
                          <Maximize2 size={14} />
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
                            <span>Inspect</span>
                            <Sparkles size={12} />
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
        <div className="specimen-detail-modal-overlay" onClick={() => setActiveSpecimen(null)}>
          <div className="specimen-detail-modal glass-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-top-bar">
              <span className="modal-specimen-code">BOTANICAL RECORD #{activeSpecimen.key}</span>
              <button className="modal-close-btn" onClick={() => setActiveSpecimen(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-layout">
              <div className="modal-img-column">
                <img 
                  src={activeSpecimen.image} 
                  alt={activeSpecimen.diseaseName} 
                  className="modal-specimen-img"
                  onClick={() => setFullscreenImage(activeSpecimen.image)}
                />
                <span className="modal-zoom-hint">Click image to enlarge high-res specimen</span>
              </div>

              <div className="modal-info-column">
                <span className="modal-species-tag">{activeSpecimen.species} ({activeSpecimen.latin})</span>
                <h2 className="modal-disease-title">{activeSpecimen.diseaseName}</h2>

                <div className="modal-section">
                  <h4><Info size={16} color="#10b981" /> Description</h4>
                  <p>{activeSpecimen.description}</p>
                </div>

                <div className="modal-section">
                  <h4><Activity size={16} color="#f59e0b" /> Visual Pathology Characteristics</h4>
                  <p>{activeSpecimen.visuals}</p>
                </div>

                {diseaseData[activeSpecimen.key] && (
                  <>
                    <div className="modal-section">
                      <h4><Stethoscope size={16} color="#34d399" /> Agronomic Treatment</h4>
                      <p>{diseaseData[activeSpecimen.key].treatment}</p>
                    </div>

                    <div className="modal-section">
                      <h4><ShieldCheck size={16} color="#60a5fa" /> Prevention Strategy</h4>
                      <p>{diseaseData[activeSpecimen.key].prevention}</p>
                    </div>
                  </>
                )}

                <button 
                  className="btn btn-primary btn-modal-scan-this"
                  onClick={() => {
                    setActiveSpecimen(null);
                    onViewChange("scan");
                  }}
                >
                  <Sparkles size={16} />
                  <span>Scan A Similar Specimen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN HIGH-RES IMAGE VIEWER */}
      {fullscreenImage && (
        <div className="fullscreen-viewer slide-section" onClick={() => setFullscreenImage(null)}>
          <div className="fs-header">
            <span>High-Resolution Dataset Specimen</span>
            <button className="fs-close" onClick={() => setFullscreenImage(null)}><X size={24}/></button>
          </div>
          <div className="fs-img-container">
            <img src={fullscreenImage} alt="Fullscreen Specimen" className="fs-img" />
          </div>
        </div>
      )}

    </div>
  );
}

export default PlantGuide;
