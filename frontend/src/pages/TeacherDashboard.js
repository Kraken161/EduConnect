import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../components/Dashboard'; 

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = localStorage.getItem('userName') || "Teacher";

  const [realStats, setRealStats] = useState({
    views: 0,
    degree: "Loading...",
    location: "Loading...",
    reviews: []
  });

  // Fetch live stats and reviews from the DB
  useEffect(() => {
    const fetchMyData = async () => {
      try {
        // FIXED: Swapped out the static site link for your live cloud database API stream
        const response = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
        const myProfile = response.data.find(t => t.name === loggedInUser);
        
        if (myProfile) {
          setRealStats({
            views: myProfile.profileViews || 0,
            degree: myProfile.degree || "N/A",
            location: myProfile.location || "N/A",
            reviews: myProfile.reviews || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchMyData();
  }, [loggedInUser]);

  const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {location.state?.message && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #166534', textAlign: 'center' }}>
            ✓ {location.state.message}
          </div>
        )}

        <div style={{ FluxMargin: '20px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1e40af', margin: 0 }}>Teacher Portal</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', marginBottom: '30px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4>Profile Status</h4>
            <p style={{ color: '#059669', fontWeight: 'bold', marginBottom: '5px' }}>● Active & Visible</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Welcome, <strong>{loggedInUser}</strong></p>
            <button className="primary-btn" style={{ padding: '8px 15px', fontSize: '0.8rem', marginTop: '10px' }} onClick={() => navigate('/edit-profile')}>
              Edit Profile
            </button>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4>Engagement</h4>
            <h2 style={{ margin: '0', color: '#1e40af' }}>{realStats.views}</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Student profile views</p>
            <p style={{ fontSize: '0.7rem', marginTop: '15px', fontWeight: 'bold', color: '#1e40af' }}>
              {realStats.degree} • {realStats.location}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Incoming Student Requests</h3>
          <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <Dashboard />
          </div>
        </div>

        {/* NEW SECTION: My Reviews */}
        <div style={{ marginTop: '40px', textAlign: 'left' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>My Public Reviews</h3>
          {realStats.reviews.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No reviews yet. Ask your students to leave feedback after a demo class!</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {realStats.reviews.map((rev, index) => (
                <div key={index} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#1e40af' }}>{rev.name}</strong>
                    <span style={{ color: '#f59e0b' }}>{renderStars(rev.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '5px 0', color: '#475569' }}>"{rev.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;