import { useState, useEffect } from "react";
import { User, MapPin, Bell, Globe, HelpCircle, Shield, LogOut, ChevronRight, Sun, Moon, Award, Activity, Leaf, CheckCircle2, Camera, Edit2 } from "lucide-react";
import api from "../../api/api";
import { t } from "../../data/translations";
import "./Profile.css";

function Profile({ user, history, lang, onLangChange, onLogout, onProfileUpdate, theme, onToggleTheme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLocation, setEditLocation] = useState(user.location || "");
  const [editProfileImage, setEditProfileImage] = useState(user.profile_image || "");
  const [plantsCount, setPlantsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`plants_${user.username}`);
    if (saved) {
      setPlantsCount(JSON.parse(saved).length);
    }
  }, [user.username]);

  const totalScans = history.length;
  const healthyCount = history.filter(s => s.disease.toLowerCase().includes("healthy")).length;
  const diseaseCount = totalScans - healthyCount;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 120;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          setEditProfileImage(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/auth/update", {
        username: user.username,
        location: editLocation,
        profile_image: editProfileImage
      });

      if (response.data.success) {
        onProfileUpdate(response.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(lang === "ta" ? "சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-identity-container fade-in-section">
      
      {/* HEADER */}
      <header className="profile-hero-header">
        <div className="identity-badge">
          <span className="badge-pulse-dot"></span>
          <span>{t("profile", lang)}</span>
        </div>
        <h1 className="profile-hero-title">{t("editProfile", lang)}</h1>
        <p className="profile-hero-sub">
          {lang === "ta"
            ? "உங்கள் விவரங்கள், பயிர் புள்ளிவிவரங்கள், மற்றும் அமைப்புகளை நிர்வகிக்கவும்."
            : "Manage your profile, crop statistics, and preferences."}
        </p>
      </header>

      <div className="profile-identity-grid">
        
        {/* LEFT COLUMN: IDENTITY CARD & GROWTH METRICS */}
        <div className="identity-left-column">
          
          <div className="identity-user-card glass-card">
            <div className="avatar-wrapper">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.username} className="user-avatar-img" />
              ) : (
                <div className="user-avatar-initial">{user.username.charAt(0).toUpperCase()}</div>
              )}
              {isEditing && (
                <label className="avatar-edit-label" title={lang === "ta" ? "படத்தைப் புதுப்பிக்க" : "Change photo"}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  <Camera size={18} />
                </label>
              )}
            </div>

            <div className="identity-info-box">
              <span className="rank-tag">{lang === "ta" ? "பயிர் ஆரோக்கிய ஆராய்ச்சியாளர்" : "PLANT HEALTH EXPLORER"}</span>
              <h2 className="user-name-title">{user.username}</h2>
              <span className="user-handle">{user.username.toLowerCase()}@leafguard.ai</span>
              
              {user.location && (
                <span className="user-location-tag">
                  <MapPin size={14} color="#22c55e" />
                  {user.location}
                </span>
              )}

              <button className="btn-edit-toggle" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 size={16} />
                <span>{isEditing ? t("cancel", lang) : t("editProfile", lang)}</span>
              </button>
            </div>
          </div>

          {/* GROWTH & DIAGNOSTIC STATS */}
          <div className="identity-stats-row">
            <div className="id-stat-card glass-card">
              <span className="stat-value">{totalScans}</span>
              <span className="stat-name">{t("totalScans", lang)}</span>
            </div>

            <div className="id-stat-card glass-card">
              <span className="stat-value">{plantsCount}</span>
              <span className="stat-name">{t("plantsCount", lang)}</span>
            </div>

            <div className="id-stat-card glass-card healthy-val">
              <span className="stat-value">{healthyCount}</span>
              <span className="stat-name">{t("healthyCount", lang)}</span>
            </div>

            <div className="id-stat-card glass-card danger-val">
              <span className="stat-value">{diseaseCount}</span>
              <span className="stat-name">{t("diseasesCount", lang)}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EDIT FORM & PREFERENCES */}
        <div className="identity-right-column">
          
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="edit-profile-card glass-card">
              <h3>{t("editProfile", lang)}</h3>
              
              <div className="form-group-field">
                <label>{t("location", lang)}</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder={lang === "ta" ? "எ.க. சென்னை, தமிழ்நாடு" : "e.g. California, USA"}
                />
              </div>

              <div className="form-group-field">
                <label>{t("profilePhoto", lang)}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-upload-input"
                />
                {editProfileImage && (
                  <img src={editProfileImage} alt="Preview" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", marginTop: "8px", border: "2px solid var(--border-color)" }} />
                )}
              </div>

              <button type="submit" className="btn btn-hero" disabled={loading} style={{ marginTop: "8px" }}>
                {loading ? t("saving", lang) : t("saveChangesBtn", lang)}
              </button>
            </form>
          )}

          {/* PREFERENCES PANEL */}
          <div className="preferences-panel glass-card">
            <h3>{t("settingsPreferences", lang)}</h3>

            <div className="pref-item" onClick={() => onLangChange(lang === "en" ? "ta" : "en")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onLangChange(lang === "en" ? "ta" : "en")}>
              <div className="pref-left">
                <Globe size={20} color="#22c55e" />
                <span>{t("language", lang)}</span>
              </div>
              <span className="pref-val">{lang === "en" ? "English" : "தமிழ்"}</span>
              <ChevronRight size={16} color="#6b7280" />
            </div>

            <div className="pref-item" onClick={onToggleTheme} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onToggleTheme()}>
              <div className="pref-left">
                {theme === "light" ? <Moon size={20} color="#22c55e" /> : <Sun size={20} color="#22c55e" />}
                <span>{t("themeMode", lang)}</span>
              </div>
              <span className="pref-val">{theme === "light" ? t("lightMode", lang) : t("darkMode", lang)}</span>
              <ChevronRight size={16} color="#6b7280" />
            </div>

            <div className="pref-item">
              <div className="pref-left">
                <Bell size={20} color="#22c55e" />
                <span>{t("diseaseAlerts", lang)}</span>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </div>

            <div className="pref-item">
              <div className="pref-left">
                <Shield size={20} color="#22c55e" />
                <span>{t("privacy", lang)}</span>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </div>

            <div className="pref-item">
              <div className="pref-left">
                <HelpCircle size={20} color="#22c55e" />
                <span>{t("help", lang)}</span>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </div>
          </div>

          <button className="btn-logout-identity" onClick={onLogout}>
            <LogOut size={18} />
            <span>{t("logout", lang)}</span>
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;