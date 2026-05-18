import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProfile = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem('userName');
  
  const [profile, setProfile] = useState({
    name: "", status: "Active & Visible", location: "", university: "", subjects: ""
  });
  const [teacherId, setTeacherId] = useState(null);

  // Fetch real data to fill the form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        const myProfile = response.data.find(t => t.name === loggedInUser);
        
        if (myProfile) {
          setTeacherId(myProfile._id);
          setProfile({
            name: myProfile.name,
            status: "Active & Visible",
            location: myProfile.location || "",
            university: myProfile.degree || "", 
            subjects: myProfile.subjects ? myProfile.subjects.join(", ") : ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile for edit:", err);
      }
    };
    fetchProfile();
  }, [loggedInUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Convert comma string back to an array for the database
      const updatedData = {
        ...profile,
        subjects: profile.subjects.split(',').map(s => s.trim())
      };
      
      if (teacherId) {
        await axios.patch(`http://localhost:5000/api/teachers/${teacherId}`, updatedData);
      }
      
      navigate('/teacher-dashboard', { state: { message: "Profile updated successfully!" } });
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Check backend connection.");
    }
  };

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#1e40af' }}>Edit Your Profile</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
          Update your details so students across Assam can find you.
        </p>
        
        <form onSubmit={handleSave} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Availability Status</label>
            <select value={profile.status} onChange={(e) => setProfile({...profile, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="Active & Visible">Active & Visible</option>
              <option value="Offline">Offline (Hidden)</option>
              <option value="Busy">Busy (Not accepting new students)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Current Teaching District</label>
            <select value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="Guwahati">Guwahati</option>
              <option value="Dibrugarh">Dibrugarh</option>
              <option value="Jorhat">Jorhat</option>
              <option value="Silchar">Silchar</option>
            </select>
          </div>

          <div className="form-group">
            <label>Highest Qualification</label>
            <input type="text" value={profile.university} onChange={(e) => setProfile({...profile, university: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Subjects (Comma separated)</label>
            <input type="text" value={profile.subjects} onChange={(e) => setProfile({...profile, subjects: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="submit" className="primary-btn">Save Changes</button>
            <button type="button" className="primary-btn" style={{ background: '#64748b' }} onClick={() => navigate('/teacher-dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;