import { useState, useEffect } from "react";
import { User, MapPin, Bell, Globe, HelpCircle, Shield, LogOut, ChevronRight, Sun, Moon } from "lucide-react";
import api from "../../api/api";
import "./Profile.css";

function Profile({ user, history, lang, onLangChange, onLogout, onProfileUpdate, theme, onToggleTheme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLocation, setEditLocation] = useState(user.location || "");
  const [editProfileImage, setEditProfileImage] = useState(user.profile_image || "");
  const [plantsCount, setPlantsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load plants count from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`plants_${user.username}`);
    if (saved) {
      setPlantsCount(JSON.parse(saved).length);
    }
  }, [user.username]);

  // Calculations for stats
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
    <div className="page-wrapper">
      <div className="profile-desktop-layout">
        
        {/* Left Column: User details and statistics */}
        <div className="profile-left-col">
          {/* Header Info */}
          <div className="profile-header card">
            {user.profile_image ? (
              <img src={user.profile_image} alt={user.username} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
            )}

            <div className="profile-info">
              <h3 className="profile-name">{user.username}</h3>
              <span className="profile-email">{user.username.toLowerCase()}@leafguard.ai</span>
              {user.location && (
                <span className="profile-location">
                  <MapPin size={14} color="var(--primary)" />
                  {user.location}
                </span>
              )}
              <button className="profile-edit-btn" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Close Form" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-number">{totalScans}</div>
              <div className="stat-label">Scans</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{plantsCount}</div>
              <div className="stat-label">Plants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{healthyCount}</div>
              <div className="stat-label">Healthy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{diseaseCount}</div>
              <div className="stat-label">Diseases</div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings and forms */}
        <div className="profile-right-col">
          {/* Editing Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="edit-form-card">
              <h3>Edit Profile Details</h3>
              
              <div className="modal-form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="E.g. London, UK"
                />
              </div>

              <div className="modal-form-group">
                <label>Avatar Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ fontSize: "12px", border: "none", background: "none" }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* Settings list */}
          <div className="settings-list-card">
            <button className="setting-item" onClick={() => onLangChange(lang === "en" ? "ta" : "en")}>
              <div className="setting-label-row">
                <Globe size={18} className="setting-icon" />
                <span>Language</span>
              </div>
              <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "700" }}>
                {lang === "en" ? "English" : "தமிழ்"}
              </span>
            </button>

            <button className="setting-item" onClick={onToggleTheme}>
              <div className="setting-label-row">
                {theme === "light" ? <Moon size={18} className="setting-icon" /> : <Sun size={18} className="setting-icon" />}
                <span>Theme Mode</span>
              </div>
              <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "700" }}>
                {theme === "light" ? "Light" : "Dark"}
              </span>
            </button>

            <div className="setting-item">
              <div className="setting-label-row">
                <Bell size={18} className="setting-icon" />
                <span>Notifications</span>
              </div>
              <ChevronRight size={16} color="var(--text-light)" />
            </div>

            <div className="setting-item">
              <div className="setting-label-row">
                <Shield size={18} className="setting-icon" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight size={16} color="var(--text-light)" />
            </div>

            <div className="setting-item">
              <div className="setting-label-row">
                <HelpCircle size={18} className="setting-icon" />
                <span>Help & Support</span>
              </div>
              <ChevronRight size={16} color="var(--text-light)" />
            </div>
          </div>

          {/* Logout button */}
          <button 
            className="btn btn-secondary" 
            onClick={onLogout} 
            style={{ color: "var(--color-danger)", borderColor: "rgba(197, 94, 87, 0.2)", gap: "6px" }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;
