import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'student';
  const loggedInUserName = localStorage.getItem('userName') || '';
  const loggedInUserPhone = localStorage.getItem('userPhone') || '';

  // Tab View Controller State
  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' or 'profile'

  // Security Form States
  const [passwordFields, setPasswordFields] = useState({ newPassword: '', confirmPassword: '' });
  const [availabilityStatus, setAvailabilityStatus] = useState('Active & Visible');

  // Profile Management States
  const [selectedCity, setSelectedCity] = useState('Guwahati');
  const [technicalId, setTechnicalId] = useState(null); // Used to track Mongo _id for teachers

  // Hydrate initial configurations on load
  useEffect(() => {
    const fetchProfileContext = async () => {
      try {
        if (userRole === 'teacher') {
          const response = await axios.get('http://localhost:5000/api/teachers');
          const myProfile = response.data.find(t => t.name === loggedInUserName);
          if (myProfile) {
            setTechnicalId(myProfile._id);
            setSelectedCity(myProfile.location || 'Guwahati');
            setAvailabilityStatus(myProfile.status || 'Active & Visible');
          }
        } else {
          // For students, fetch current location data from the database list if needed
          const response = await axios.get('http://localhost:5000/api/teachers'); // fallback channel read
          // Defaults to session string parameters or local defaults gracefully
          setSelectedCity('Guwahati');
        }
      } catch (err) {
        console.error("Error reading settings profile data matrix:", err);
      }
    };
    fetchProfileContext();
  }, [userRole, loggedInUserName]);

  // HANDLE PASSWORD AND AVAILABILITY SAVES
  const handleSavePrivacySettings = async (e) => {
    e.preventDefault();

    // DUAL NEW PASSWORD MATCH VERIFICATION CHECK
    if (passwordFields.newPassword) {
      if (passwordFields.newPassword !== passwordFields.confirmPassword) {
        alert("⚠️ Verification Error: New Password and Confirm Password fields must match exactly!");
        return;
      }
    }

    try {
      let updatePayload = {};
      if (passwordFields.newPassword) updatePayload.password = passwordFields.newPassword;
      
      if (userRole === 'teacher') {
        updatePayload.status = availabilityStatus;
        await axios.patch(`http://localhost:5000/api/teachers/update-profile/${technicalId}`, updatePayload);
      } else {
        await axios.patch(`http://localhost:5000/api/students/update-profile/${loggedInUserPhone}`, updatePayload);
      }

      alert("🔒 Security parameters and privacy updates saved successfully!");
      setPasswordFields({ newPassword: '', confirmPassword: '' }); // Clear inputs
    } catch (err) {
      console.error(err);
      alert("Failed to patch security settings profile records.");
    }
  };

  // HANDLE LOCATION UPDATE MANIPULATION
  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    try {
      if (userRole === 'teacher') {
        await axios.patch(`http://localhost:5000/api/teachers/update-profile/${technicalId}`, { location: selectedCity });
      } else {
        await axios.patch(`http://localhost:5000/api/students/update-profile/${loggedInUserPhone}`, { location: selectedCity });
      }
      alert("📍 District location configurations updated cleanly!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile changes.");
    }
  };

  // CLEAN PERMANENT DELETE ACCOUNT LIFECYCLE (Wipes from MongoDB clusters instantly)
  const handleDeleteAccountExecution = async () => {
    const confirmationPrompt = window.confirm(
      "🚨 CRITICAL ACTION REQUIRED: Are you absolutely certain you want to permanently delete your EduConnect Account? This will remove all your data records from our cloud database. This process cannot be undone."
    );
    
    if (confirmationPrompt) {
      try {
        if (userRole === 'teacher') {
          await axios.delete(`http://localhost:5000/api/teachers/delete-account/${technicalId}`);
        } else {
          await axios.delete(`http://localhost:5000/api/students/delete-account/${loggedInUserPhone}`);
        }
        
        alert("Account records cleared. We are sorry to see you go!");
        localStorage.clear();
        navigate('/');
      } catch (err) {
        console.error(err);
        alert("Error executing database removal pipeline operations.");
      }
    }
  };

  const locations = ["Guwahati", "Dibrugarh", "Jorhat", "Silchar"];

  return (
    <div className="premium-dashboard-wrapper">
      
      {/* COMPACT STICKY LEFT SIDEBAR NAVIGATION RAIL */}
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className="sidebar-nav-item" onClick={() => navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}>🏠 Dashboard Overview</button>
            {userRole === 'student' && <button className="sidebar-nav-item" onClick={() => navigate('/search-mentors')}>🔍 Search Tutors</button>}
            <button className="sidebar-nav-item" onClick={() => navigate(userRole === 'teacher' ? '/teacher-chats' : '/student-chats')}>💬 Class Chats</button>
            <button className="sidebar-nav-item active">⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      {/* RE-CONSTRAINED WORKSPACE CONTENT SPACE */}
      <main className="dashboard-main-content">
        <header style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h2>Portal Settings</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage security vectors, adjust geographical preferences, and handle account properties.</p>
        </header>

        <div className="settings-workspace-card">
          {/* TAB BAR SPLIT CONTROLS HEADER */}
          <div className="settings-tab-header-row">
            <button 
              className={`settings-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              🔒 Privacy & Security
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile Management
            </button>
          </div>

          {/* TAB 1 CONTENT BODY PANEL: PRIVACY & SECURITY */}
          {activeTab === 'privacy' && (
            <div className="settings-panel-body">
              <form onSubmit={handleSavePrivacySettings} style={{ textAlign: 'left', maxWidth: '500px' }}>
                
                {userRole === 'teacher' && (
                  <div className="form-group">
                    <label>Availability System Status</label>
                    <select 
                      value={availabilityStatus} 
                      onChange={(e) => setAvailabilityStatus(e.target.value)}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                    >
                      <option value="Active & Visible">Active & Visible (Open to Public)</option>
                      <option value="Offline">Offline (Hidden From Search Loops)</option>
                      <option value="Busy">Busy (Roster Full)</option>
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label>Update Account Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new account password string" 
                    value={passwordFields.newPassword}
                    onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm password string for accuracy verification" 
                    value={passwordFields.confirmPassword}
                    onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <button type="submit" className="primary-btn" style={{ marginTop: '12px' }}>
                  Save Security Updates
                </button>
              </form>

              <hr style={{ margin: '40px 0 24px 0', border: '0.5px solid #f1f5f9' }} />

              {/* CLEAN DANGER ZONE AREA PLACEMENT */}
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#e53e3e', fontWeight: '700', marginBottom: '8px' }}>Danger Zone</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>Permanently remove your identity data parameters out of the platform cluster databases.</p>
                <button 
                  onClick={handleDeleteAccountExecution}
                  className="primary-btn" 
                  style={{ backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7' }}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT BODY PANEL: PROFILE PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="settings-panel-body">
              <form onSubmit={handleSaveProfileSettings} style={{ textAlign: 'left', maxWidth: '500px' }}>
                <div className="form-group">
                  <label>Current Registered District City</label>
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>Adjusting this re-routes which neighborhood clusters can discover you.</p>
                </div>

                <button type="submit" className="primary-btn" style={{ marginTop: '12px' }}>
                  Update District Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;