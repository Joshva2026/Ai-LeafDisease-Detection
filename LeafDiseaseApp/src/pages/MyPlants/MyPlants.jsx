import { useState, useEffect } from "react";
import { Search, MapPin, Plus, Trash2, Camera, X, PlusCircle, Leaf } from "lucide-react";
import { t } from "../../data/translationHelper";
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
  const [selectedTemplate, setSelectedTemplate] = useState("monstera");

  const templates = {
    monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=150",
    snake: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=150",
    tomato: "https://images.unsplash.com/photo-1592841200221-a6898f307bac?w=150",
    fig: "https://images.unsplash.com/photo-1597055181300-e3633a207518?w=150"
  };

  // Load plants from localStorage
  useEffect(() => {
    const key = `plants_${user.username}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setPlants(JSON.parse(saved));
    } else {
      // Default placeholder plants
      const defaults = [
        {
          id: "1",
          name: "Monstera Deliciosa",
          location: "Living Room",
          image: templates.monstera,
          healthStatus: "Healthy",
          lastScanDate: "Today"
        },
        {
          id: "2",
          name: "Tomato Patch",
          location: "Garden",
          image: templates.tomato,
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
    e.stopPropagation(); // Avoid triggering any card click
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
          {lang === "ta" ? "இடங்கள்" : "Locations"} ({sites.length})
        </button>
      </div>

      {/* Floating trigger button */}
      <button 
        className="fab" 
        onClick={() => setShowModal(true)} 
        title="Add Plant"
      >
        <Plus size={24} />
      </button>

      {/* Search Input bar */}
      <div className="search-bar-wrap">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={lang === "ta" ? "பயிரைத் தேடு..." : "Search plant..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="fade-in-section">
        {/* Render Plants Cards List */}
        {activeTab === "plants" && (
          <div className="plants-list-grid">
            {filteredPlants.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-light)", gridColumn: "1/-1", padding: "40px 0" }}>
                {lang === "ta" ? "பயிர்கள் எதுவும் இல்லை." : "No plants registered."}
              </p>
            ) : (
              filteredPlants.map((plant) => (
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
                      <MapPin size={12} color="var(--primary)" />
                      {plant.location}
                    </span>
                    <div className="plant-health-status-row">
                      <span className={`severity-pill ${plant.healthStatus.toLowerCase().includes("needs") ? "warning" : "healthy"}`}>
                        {plant.healthStatus.toLowerCase().includes("needs") 
                          ? (lang === "ta" ? "கவனம் தேவை" : "Needs attention") 
                          : t("healthyStatus", lang)}
                      </span>
                    </div>
                  </div>
                  <div className="plant-card-actions">
                    <button
                      className="plant-btn-action"
                      onClick={(e) => handleDeletePlant(plant.id, e)}
                      title="Delete Plant"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Render Locations list */}
        {activeTab === "sites" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
            {sites.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-light)", padding: "40px 0" }}>
                {lang === "ta" ? "இடங்கள் எதுவும் இல்லை." : "No locations found."}
              </p>
            ) : (
              sites.map((site) => {
                const count = plants.filter((p) => p.location === site).length;
                return (
                  <div key={site} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="action-icon-wrap" style={{ width: "42px", height: "42px", borderRadius: "10px" }}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "16px" }}>{site}</h4>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {count} {lang === "ta" ? "பயிர்கள்" : (count === 1 ? "plant" : "plants")}
                        </span>
                      </div>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title">{t("addPlant", lang)}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPlant} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="modal-form-group">
                <label>{t("plantName", lang)}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="E.g. Garden Tomato, Bedroom Pothos"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>{t("location", lang)}</label>
                <select
                  className="modal-select-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Garden">{lang === "ta" ? "தோட்டம்" : "Garden"}</option>
                  <option value="Living Room">{lang === "ta" ? "வரவேற்பு அறை" : "Living Room"}</option>
                  <option value="Bedroom">{lang === "ta" ? "படுக்கை அறை" : "Bedroom"}</option>
                  <option value="Kitchen">{lang === "ta" ? "சமையல் அறை" : "Kitchen"}</option>
                  <option value="Office">{lang === "ta" ? "அலுவலகம்" : "Office"}</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>{lang === "ta" ? "பயிர் படத்தைத் தேர்ந்தெடுக்கவும்" : "Select Plant Icon Template"}</label>
                <select
                  className="modal-select-field"
                  value={selectedTemplate}
                  disabled={!!customImage}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="monstera">Monstera Deliciosa</option>
                  <option value="tomato">Tomato Plant</option>
                  <option value="snake">Snake Plant</option>
                  <option value="fig">Fiddle Leaf Fig</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>{lang === "ta" ? "அல்லது புகைப்படம் பதிவேற்றவும்" : "Or Upload Photo"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: "12px", background: "none", border: "none" }}
                />
                {customImage && (
                  <img
                    src={customImage}
                    alt="Custom upload"
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", marginTop: "4px" }}
                  />
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
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
