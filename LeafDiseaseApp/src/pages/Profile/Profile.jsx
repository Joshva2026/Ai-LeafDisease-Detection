import { useState, useEffect } from "react";
import { User, MapPin, Bell, Globe, HelpCircle, Shield, LogOut, ChevronRight, Sun, Moon, Award, Activity, Leaf, CheckCircle2 } from "lucide-react";
import api from "../../api/api";
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
      alert("Failed to update profile. Please try again.");
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
          <span>YOUR PLANT HEALTH JOURNEY</span>
        </div>
        <h1 className="profile-hero-title">Farmer Intelligence Dashboard</h1>
        <p className="profile-hero-sub">
          Field diagnostic identity, crop growth statistics, and personal account controls.
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
            </div>

            <div className="identity-info-box">
              <span className="rank-tag">✦ AGRONOMIC EXPLORER</span>
              <h2 className="user-name-title">{user.username}</h2>
              <span className="user-handle">{user.username.toLowerCase()}@leafguard.ai</span>
              
              {user.location && (
                <span className="user-location-tag">
                  <MapPin size={14} color="#10b981" />
                  {user.location}
                </span>
              )}

              <button className="btn-edit-toggle" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Close Form" : "Edit Profile Info"}
              </button>
            </div>
          </div>

          {/* GROWTH & DIAGNOSTIC STATS */}
          <div className="identity-stats-row">
            <div className="id-stat-card glass-card">
              <span className="stat-value">{totalScans}</span>
              <span className="stat-name">Leaf Scans</span>
            </div>

            <div className="id-stat-card glass-card">
              <span className="stat-value">{plantsCount}</span>
              <span className="stat-name">Crop Species</span>
            </div>

            <div className="id-stat-card glass-card healthy-val">
              <span className="stat-value">{healthyCount}</span>
              <span className="stat-name">Healthy Leaves</span>
            </div>

            <div className="id-stat-card glass-card danger-val">
              <span className="stat-value">{diseaseCount}</span>
              <span className="stat-name">Pathologies</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EDIT FORM & PREFERENCES */}
        <div className="identity-right-column">
          
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="edit-profile-card glass-card">
              <h3>Update Field Credentials</h3>
              
              <div className="form-group-field">
                <label>Location (City / Region)</label>
                <input 
                  type="text" 
                  className="input-text-box"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. California, USA"
                />
              </div>

              <div className="form-group-field">
                <label>Avatar Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-upload-input"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving Profile..." : "Save Credentials"}
              </button>
            </form>
          )}

          {/* PREFERENCES PANEL */}
          <div className="preferences-panel glass-card">
            <h3>System Settings & Preferences</h3>

            <div className="pref-item" onClick={() => onLangChange(lang === "en" ? "ta" : "en")}>
              <div className="pref-left">
                <Globe size={18} color="#10b981" />
                <span>Application Language</span>
              </div>
              <span className="pref-val">{lang === "en" ? "English" : "தமிழ்"}</span>
            </div>

            <div className="pref-item" onClick={onToggleTheme}>
              <div className="pref-left">
                {theme === "light" ? <Moon size={18} color="#10b981" /> : <Sun size={18} color="#10b981" />}
                <span>Interface Theme</span>
              </div>
              <span className="pref-val">{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
            </div>

            <div className="pref-item">
              <div className="pref-left">
                <Bell size={18} color="#10b981" />
                <span>Disease Spray Alerts</span>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </div>

            <div className="pref-item">
              <div className="pref-left">
                <Shield size={18} color="#10b981" />
                <span>Data Privacy & Security</span>
              </div>
              <ChevronRight size={16} color="#6b7280" />
            </div>
          </div>

          <button className="btn-logout-identity" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out of Workstation</span>
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;
