import { useState } from "react";
import { Search, ArrowLeft, Info, HelpCircle, Activity, Stethoscope, ShieldCheck, AlertOctagon } from "lucide-react";
import { mapClassName, getSeverityStyle } from "../../data/diseaseHelper";
import { t } from "../../data/translations";
import diseaseData from "../../data/diseaseData";
import "./PlantGuide.css";

function PlantGuide({ onViewChange, lang }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiseaseKey, setActiveDiseaseKey] = useState(null);

  // Map the 38 classes dynamically from diseaseData keys
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
    { id: "all", label: lang === "ta" ? "அனைத்தும்" : "All" },
    { id: "healthy", label: lang === "ta" ? "ஆரோக்கியமான" : "Healthy" },
    { id: "fungal", label: lang === "ta" ? "பூஞ்சை" : "Fungal" },
    { id: "bacterial", label: lang === "ta" ? "பாக்டீரியா" : "Bacterial" },
    { id: "viral", label: lang === "ta" ? "வைரஸ்" : "Viral" },
    { id: "pest", label: lang === "ta" ? "பூச்சிகள்" : "Pests" }
  ];

  // Filtering logic
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
    // Unsplash covers
    const urls = {
      "Apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150",
      "Blueberry": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=150",
      "Cherry": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=150",
      "Corn": "https://images.unsplash.com/photo-1551754625-702377370d6a?w=150",
      "Grape": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=150",
      "Orange": "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?w=150",
      "Peach": "https://images.unsplash.com/photo-1595124250246-70cf3c437780?w=150",
      "Pepper": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150",
      "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150",
      "Raspberry": "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=150",
      "Soybean": "https://images.unsplash.com/photo-1599933333938-4c919a3b6ef9?w=150",
      "Squash": "https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?w=150",
      "Strawberry": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150",
      "Tomato": "https://images.unsplash.com/photo-1592841200221-a6898f307bac?w=150"
    };

    // Fallback dictionary for translated crop values
    const tKeys = {
      "ஆப்பிள்": urls["Apple"],
      "புளூபெர்ரி": urls["Blueberry"],
      "செர்ரி": urls["Cherry"],
      "சோளம்": urls["Corn"],
      "திராட்சை": urls["Grape"],
      "ஆரஞ்சு": urls["Orange"],
      "பீச்": urls["Peach"],
      "குடைமிளகாய்": urls["Pepper"],
      "மிளகு": urls["Pepper"],
      "உருளைக்கிழங்கு": urls["Potato"],
      "ராஸ்பெர்ரி": urls["Raspberry"],
      "சோயாபீன்ஸ்": urls["Soybean"],
      "ஸ்குவாஷ்": urls["Squash"],
      "ஸ்ட்ராபெரி": urls["Strawberry"],
      "தக்காளி": urls["Tomato"]
    };

    return urls[plantName] || tKeys[plantName] || "https://images.unsplash.com/photo-1530708112151-5b9b7405267e?w=150";
  };

  if (activeDisease) {
    return (
      <div className="page-wrapper">
        <div className="detail-header-row">
          <button className="detail-back-btn" onClick={() => setActiveDiseaseKey(null)}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="plants-title">{lang === "ta" ? "நோய் விவரங்கள்" : "Disease Details"}</h2>
        </div>

        <div className="guide-detail-desktop-grid">
          <div className="detail-img-card">
            <img src={getPlantUrl(activeDisease.plantName)} alt={activeDisease.plantName} />
            <div className="detail-img-overlay">
              <span className="detail-plant-type">{activeDisease.plantName}</span>
              <h3 className="detail-title">{activeDisease.diseaseName}</h3>
            </div>
          </div>

          <div className="detail-scroll-content">
            <div className="detail-info-block">
              <div className="detail-info-title">
                <Info size={14} /> {lang === "ta" ? "விளக்கம்" : "Description"}
              </div>
              <p className="detail-info-body">{activeDisease.description}</p>
            </div>

            {!activeDisease.isHealthy && (
              <>
                <div className="detail-info-block">
                  <div className="detail-info-title">
                    <Activity size={14} /> {lang === "ta" ? "அறிகுறிகள்" : "Symptoms"}
                  </div>
                  <ul className="detail-info-body detail-symptoms-list">
                    {activeDisease.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="detail-info-block">
                  <div className="detail-info-title">
                    <Stethoscope size={14} /> {lang === "ta" ? "சிகிச்சை முறை" : "Treatment"}
                  </div>
                  <p className="detail-info-body">{activeDisease.treatment}</p>
                </div>
              </>
            )}

            <div className="detail-info-block">
              <div className="detail-info-title">
                <ShieldCheck size={14} /> {lang === "ta" ? "தடுப்பு குறிப்புகள்" : "Prevention"}
              </div>
              <p className="detail-info-body">{activeDisease.prevention}</p>
            </div>

            <div className="detail-info-block" style={{ borderLeft: "4px solid var(--accent)" }}>
              <div className="detail-info-title" style={{ color: "var(--accent-dark)" }}>
                <HelpCircle size={14} /> {lang === "ta" ? "நிபுணர் ஆலோசனை" : "Expert Advice"}
              </div>
              <p className="detail-info-body">
                {lang === "ta" 
                  ? "அறிகுறிகள் தொடர்ந்தாலோ அல்லது உங்கள் பயிர்களில் 15% க்கும் அதிகமாக வேகமாகப் பரவினாலோ, பாதிக்கப்பட்ட பகுதியைத் தனிமைப்படுத்தி, குறிப்பிட்ட உயிரியல் தீர்வுகளுக்கு உங்கள் உள்ளூர் வேளாண்மை விரிவாக்க அலுவலகத்தைத் தொடர்பு கொள்ளவும்." 
                  : "If symptoms persist or spread rapidly across more than 15% of your crops, isolate the affected zone and contact your local agricultural extension office for specific biological cures."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div>
        <h2 className="guide-title">{t("guides", lang)}</h2>
        <p className="guide-subtitle">
          {lang === "ta" ? "நோய்களைக் கண்டறிந்து பயிர் பராமரிப்பு பரிந்துரைகளைப் படிக்கவும்." : "Identify diseases and study care recommendations."}
        </p>
      </div>

      {/* Search */}
      <div className="search-bar-wrap" style={{ marginBottom: "16px" }}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder={lang === "ta" ? "நோய்கள் அல்லது பயிர்களைத் தேடுக..." : "Search diseases or plants"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Categories */}
      <div className="guide-categories-row">
        {categories.map((cat) => (
          <button 
            key={cat.id} 
            className={`guide-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Diseases List */}
      <div className="guide-cards-grid">
        {filteredDiseases.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textStyle: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-light)" }}>
            <AlertOctagon size={48} />
            <p style={{ textAlign: "center" }}>{lang === "ta" ? "வடிகட்டல்களுக்கு ஏற்ற நோய்கள் எதுவும் இல்லை." : "No diseases matched your filters."}</p>
          </div>
        ) : (
          filteredDiseases.map((item) => {
            const isItemHealthy = item.isHealthy;
            return (
              <div 
                key={item.key} 
                className="disease-item-card"
                onClick={() => setActiveDiseaseKey(item.key)}
              >
                <img 
                  src={getPlantUrl(item.plantName)} 
                  alt={item.plantName} 
                  className="disease-card-img" 
                />
                
                <div className="disease-card-info">
                  <span className="disease-card-plant">{item.plantName}</span>
                  <span className="disease-card-name">{item.diseaseName}</span>
                  <p className="disease-card-desc">{item.description}</p>
                </div>

                <div className="disease-card-meta">
                  <span className={`severity-pill ${isItemHealthy ? "healthy" : item.severity === "High" ? "danger" : "warning"}`}>
                    {isItemHealthy ? (lang === "ta" ? "நலம்" : "Healthy") : item.severity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PlantGuide;
