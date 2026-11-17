import { useState, useEffect } from "react";
import { Search, MapPin, Plus, Trash2, Camera, X, PlusCircle, Leaf, CheckCircle, AlertTriangle } from "lucide-react";
import { t } from "../../data/translations";
import "./MyPlants.css";

function MyPlants({ user, onViewChange, lang }) {
  const [activeTab, setActiveTab] = useState("plants");
  const [searchQuery, setSearchQuery] = useState("");
  const [plants, setPlants] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [plantName, setPlantName] = useState("");
  const [location, setLocation] = useState("Garden");
  const [customImage, setCustomImage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("tomato");

  const templates = {
    tomato: "https://images.unsplash.com/photo-1592841200221-a6898f307bac?w=150",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150",
    pepper: "https://images.unsplash.com/photo-1617187191101-65ec6e1ea5c3?w=150",
    grape: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=150"
  };

  // Load plants from localStorage
  useEffect(() => {
    const key = `plants_${user.username}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setPlants(JSON.parse(saved));
    } else {
      // Default placeholder plants relevant to farming
      const defaults = [
        {
          id: "1",
          name: "Tomato Plant",
          location: "Garden",
          image: templates.tomato,
          healthStatus: "Healthy",
          lastScanDate: "Today"
        },
        {
          id: "2",
          name: "Potato Patch",
          location: "Field",
          image: templates.potato,
          healthStatus: "Needs attention",
          lastScanDate: "Yesterday"
        }
      ];
      setPlants(defaults);
      localStorage.setItem(key, JSON.stringify(defaults));
    }
  }, [user.username]);

  const savePlantsList = (list) => {
    setPlants(list);
    localStorage.setItem(`plants_${user.username}`, JSON.stringify(list));
  };

  const handleAddPlant = (e) => {
    e.preventDefault();
    if (!plantName.trim()) return;

    const newPlant = {
      id: Date.now().toString(),
      name: plantName,
      location: location,
      image: customImage || templates[selectedTemplate],
      healthStatus: "Healthy",
      lastScanDate: "Just added"
    };

    savePlantsList([newPlant, ...plants]);
    
    // Reset fields
    setPlantName("");
    setLocation("Garden");
    setCustomImage("");
    setShowModal(false);
  };

  const handleDeletePlant = (id, e) => {
    e.stopPropagation();
    const filtered = plants.filter((p) => p.id !== id);
    savePlantsList(filtered);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter list by searchQuery
  const filteredPlants = plants.filter((plant) => {
    const query = searchQuery.toLowerCase();
    return (
      plant.name.toLowerCase().includes(query) ||
      plant.location.toLowerCase().includes(query)
    );
  });

  // Unique sites/locations list
  const sites = Array.from(new Set(plants.map((p) => p.location)));

  return (
    <div className="page-wrapper">
      {/* Header Row */}
      <div className="plants-header-row">
        <h2 className="plants-title">{t("myCollection", lang)}</h2>
      </div>

      {/* Tabs */}
      <div className="plants-tabs">
        <button
          className={`plants-tab-btn ${activeTab === "plants" ? "active" : ""}`}
          onClick={() => setActiveTab("plants")}
        >
          {t("allPlants", lang)} ({plants.length})
        </button>
        <button
          className={`plants-tab-btn ${activeTab === "sites" ? "active" : ""}`}
          onClick={() => setActiveTab("sites")}
        >
          {t("location", lang)} ({sites.length})
        </button>
      </div>

      {/* Floating trigger button */}
      <button 
        className="fab" 
        onClick={() => setShowModal(true)} 
        title={t("addPlant", lang)}
        aria-label={t("addPlant", lang)}
      >
        <Plus size={26} />
      </button>

      {/* Search Input bar */}
      <div className="search-bar-wrap">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder={lang === "ta" ? "பயிரைத் தேடு..." : "Search plants..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search plants"
        />
      </div>

      <div className="fade-in-section">
        {/* Render Plants Cards List */}
        {activeTab === "plants" && (
          <div className="plants-list-grid">
            {filteredPlants.length === 0 ? (
              <div className="plants-empty-state" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 20px" }}>
                <Leaf size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "8px" }}>
                  {lang === "ta" ? "பயிர்கள் எதுவும் இல்லை" : "No Plants Registered"}
                </h3>
                <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
                  {lang === "ta" ? "உங்கள் பயிர்களைச் சேர்க்க '+'-ஐ அழுத்தவும்." : "Add your first plant by tapping the + button."}
                </p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ maxWidth: "240px" }}>
                  <Plus size={18} />
                  <span>{t("addPlant", lang)}</span>
                </button>
              </div>
            ) : (
              filteredPlants.map((plant) => {
                const isHealthy = plant.healthStatus.toLowerCase().includes("healthy");
                return (
                  <div key={plant.id} className="plant-item-card" onClick={() => onViewChange("scan")}>
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="plant-avatar-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=120";
                      }}
                    />
                    <div className="plant-detail-info">
                      <span className="plant-item-title">{plant.name}</span>
                      <span className="plant-item-location">
                        <MapPin size={14} color="var(--primary)" />
                        {plant.location}
                      </span>
                      <div className="plant-health-status-row">
                        <span className={`severity-pill ${isHealthy ? 'healthy' : 'warning'}`}>
                          {isHealthy ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                          {isHealthy ? t("healthyStatus", lang) : (lang === "ta" ? "கவனம் தேவை" : "Needs attention")}
                        </span>
                      </div>
                    </div>
                    <div className="plant-card-actions">
                      <button
                        className="plant-btn-action"
                        onClick={(e) => handleDeletePlant(plant.id, e)}
                        title={lang === "ta" ? "நீக்கு" : "Delete Plant"}
                        style={{ color: "var(--color-danger)" }}
                        aria-label={lang === "ta" ? "பயிரை நீக்கு" : "Delete plant"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Render Locations list */}
        {activeTab === "sites" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
            {sites.length === 0 ? (
              <div className="plants-empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
                <MapPin size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "8px" }}>
                  {lang === "ta" ? "இடங்கள் எதுவும் இல்லை" : "No Locations Found"}
                </h3>
                <p style={{ color: "#9ca3af" }}>
                  {lang === "ta" ? "உங்கள் பயிர்களைச் சேர்க்க '+'-ஐ அழுத்தவும்." : "Add plants to create locations."}
                </p>
              </div>
            ) : (
              sites.map((site) => {
                const count = plants.filter((p) => p.location === site).length;
                return (
                  <div key={site} className="plant-item-card site-card" style={{ gridTemplateColumns: "auto 1fr auto" }}>
                    <div className="action-icon-wrap" style={{ width: "52px", height: "52px", borderRadius: "var(--radius-md)" }}>
                      <MapPin size={22} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>{site}</h4>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {count} {lang === "ta" ? "பயிர்கள்" : (count === 1 ? "plant" : "plants")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Plant Drawer overlay popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 id="modal-title" className="modal-title">{t("addPlant", lang)}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPlant} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="modal-form-group">
                <label>{t("plantName", lang)}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={lang === "ta" ? "எ.க. தோட்டத் தக்காளி, படுக்கை போதோஸ்" : "E.g. Garden Tomato, Bedroom Pothos"}
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>{t("location", lang)}</label>
                <select
                  className="input-field modal-select-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Garden">{lang === "ta" ? "தோட்டம்" : "Garden"}</option>
                  <option value="Field">{lang === "ta" ? "வயல்" : "Field"}</option>
                  <option value="Greenhouse">{lang === "ta" ? "பச்சை வீடு" : "Greenhouse"}</option>
                  <option value="Balcony">{lang === "ta" ? "பால்கனி" : "Balcony"}</option>
                  <option value="Farm">{lang === "ta" ? "பண்ணை" : "Farm"}</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>{lang === "ta" ? "பயிர் படத்தைத் தேர்ந்தெடுக்கவும்" : "Select Plant Icon Template"}</label>
                <select
                  className="input-field modal-select-field"
                  value={selectedTemplate}
                  disabled={!!customImage}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="tomato">{lang === "ta" ? "தக்காளி" : "Tomato Plant"}</option>
                  <option value="potato">{lang === "ta" ? "உருளைக்கிழங்கு" : "Potato Plant"}</option>
                  <option value="pepper">{lang === "ta" ? "மிளகாய்" : "Pepper Plant"}</option>
                  <option value="grape">{lang === "ta" ? "திராட்சை" : "Grape Vine"}</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>{lang === "ta" ? "அல்லது புகைப்படம் பதிவேற்றவும்" : "Or Upload Photo"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: "14px", background: "none", border: "none", padding: "8px 0" }}
                />
                {customImage && (
                  <img
                    src={customImage}
                    alt="Custom upload"
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-md)", marginTop: "8px" }}
                  />
                )}
              </div>

              <button type="submit" className="btn btn-hero" style={{ marginTop: "8px" }}>
                {t("savePlant", lang)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPlants;