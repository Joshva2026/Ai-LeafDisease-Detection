import { useState } from "react";
import { Search, ArrowLeft, Info, HelpCircle, Activity, Stethoscope, ShieldCheck, AlertOctagon, BookOpen } from "lucide-react";
import { mapClassName } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import diseaseData from "../../data/diseaseData";
import "./PlantGuide.css";

function PlantGuide({ onViewChange, lang }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiseaseKey, setActiveDiseaseKey] = useState(null);

  const diseasesList = Object.keys(diseaseData).map(key => {
    const parsed = mapClassName(key, lang);
    return {
      key,
      ...parsed,
      description: diseaseData[key].description,
      symptoms: diseaseData[key].symptoms,
      treatment: diseaseData[key].treatment,
      prevention: diseaseData[key].prevention
    };
  });

  const categories = [
    { id: "all", label: lang === "ta" ? "அனைத்தும்" : "All Species" },
    { id: "healthy", label: lang === "ta" ? "ஆரோக்கியமான" : "Healthy" },
    { id: "fungal", label: lang === "ta" ? "பூஞ்சை" : "Fungal" },
    { id: "bacterial", label: lang === "ta" ? "பாக்டீரியா" : "Bacterial" },
    { id: "viral", label: lang === "ta" ? "வைரஸ்" : "Viral" }
  ];

  const filteredDiseases = diseasesList.filter(item => {
    const matchesSearch = 
      item.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "healthy") return matchesSearch && item.isHealthy;
    
    return matchesSearch && item.status.toLowerCase() === selectedCategory.toLowerCase();
  });

  const activeDisease = diseasesList.find(d => d.key === activeDiseaseKey);

  const getPlantUrl = (plantName) => {
    const urls = {
      "Apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200",
      "Blueberry": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200",
      "Cherry": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200",
      "Corn": "https://images.unsplash.com/photo-1551754625-702377370d6a?w=200",
      "Grape": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200",
      "Orange": "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?w=200",
      "Peach": "https://images.unsplash.com/photo-1595124250246-70cf3c437780?w=200",
      "Pepper": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200",
      "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200",
      "Raspberry": "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=200",
      "Soybean": "https://images.unsplash.com/photo-1599933333938-4c919a3b6ef9?w=200",
      "Squash": "https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?w=200",
      "Strawberry": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200",
      "Tomato": "https://images.unsplash.com/photo-1592841200221-a6898f307bac?w=200"
    };

    return urls[plantName] || "https://images.unsplash.com/photo-1530708112151-5b9b7405267e?w=200";
  };

  if (activeDisease) {
    return (
      <div className="botanical-archive-container fade-in-section">
        <div className="archive-detail-header">
          <button className="btn-back-archive" onClick={() => setActiveDiseaseKey(null)}>
            <ArrowLeft size={18} />
            <span>Back to Botanical Archive</span>
          </button>
          <span className="archive-specimen-id">TAXONOMY RECORD #{activeDisease.key.toUpperCase()}</span>
        </div>

        <div className="archive-detail-card glass-card">
          <div className="detail-hero-box">
            <img src={getPlantUrl(activeDisease.plantName)} alt={activeDisease.plantName} className="detail-hero-img" />
            <div className="detail-hero-overlay">
              <span className="detail-plant-tag">{activeDisease.plantName}</span>
              <h2>{activeDisease.diseaseName}</h2>
            </div>
          </div>

          <div className="detail-sections-grid">
            <div className="d-section-block">
              <div className="d-sec-head">
                <Info size={16} color="#10b981" />
                <h4>Description & Pathology Overview</h4>
              </div>
              <p>{activeDisease.description}</p>
            </div>

            {!activeDisease.isHealthy && (
              <>
                <div className="d-section-block">
                  <div className="d-sec-head">
                    <Activity size={16} color="#f59e0b" />
                    <h4>Recognized Symptoms</h4>
                  </div>
                  <ul>
                    {activeDisease.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="d-section-block">
                  <div className="d-sec-head">
                    <Stethoscope size={16} color="#34d399" />
                    <h4>Recommended Agronomic Treatment</h4>
                  </div>
                  <p>{activeDisease.treatment}</p>
                </div>
              </>
            )}

            <div className="d-section-block">
              <div className="d-sec-head">
                <ShieldCheck size={16} color="#10b981" />
                <h4>Long-Term Prevention Strategy</h4>
              </div>
              <p>{activeDisease.prevention}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="botanical-archive-container fade-in-section">
      
      {/* HEADER */}
      <header className="archive-header">
        <div className="archive-badge">
          <span className="badge-pulse-dot"></span>
          <span>BOTANICAL ARCHIVE & ENCYCLOPEDIA</span>
        </div>
        <h1 className="archive-title">Explore Plant Intelligence</h1>
        <p className="archive-subtitle">
          A living botanical library covering 38 crop pathology classifications, symptoms, organic care, and disease prevention.
        </p>
      </header>

      {/* CONTROLS */}
      <div className="archive-controls glass-card">
        <div className="archive-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ta" ? "நோய்கள் அல்லது பயிர்களைத் தேடுக..." : "Search crops, pathogens, or symptoms..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="archive-search-input"
          />
        </div>

        <div className="archive-categories-row">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`archive-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* SPECIES CARDS GRID */}
      <div className="archive-grid">
        {filteredDiseases.length === 0 ? (
          <div className="archive-empty glass-card">
            <AlertOctagon size={36} color="#9ca3af" />
            <p>No botanical records found matching criteria.</p>
          </div>
        ) : (
          filteredDiseases.map((item) => (
            <div 
              key={item.key} 
              className="species-card glass-card"
              onClick={() => setActiveDiseaseKey(item.key)}
            >
              <div className="species-img-box">
                <img src={getPlantUrl(item.plantName)} alt={item.plantName} />
              </div>
              
              <div className="species-info">
                <span className="species-crop-name">{item.plantName}</span>
                <h4 className="species-disease-name">{item.diseaseName}</h4>
                <p className="species-desc-snippet">{item.description}</p>
              </div>

              <div className="species-footer">
                <span className={`status-pill ${item.isHealthy ? 'healthy' : 'danger'}`}>
                  {item.isHealthy ? 'Healthy' : item.severity || 'Condition'}
                </span>
                <span className="btn-read-more">View Profile →</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default PlantGuide;
