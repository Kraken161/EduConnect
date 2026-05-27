import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../components/Dashboard'; 

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = localStorage.getItem('userName') || "Teacher";

  const [realStats, setRealStats] = useState({
    id: null,
    views: 0,
    degree: "Loading...",
    location: "Loading...",
    reviews: []
  });
  
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
        const myProfile = response.data.find(t => t.name === loggedInUser);
        
        if (myProfile) {
          setRealStats({
            id: myProfile._id,
            views: myProfile.profileViews || 0,
            degree: myProfile.degree || "N/A",
            location: myProfile.location || "N/A",
            reviews: myProfile.reviews || []
          });
        }

        // Fetch bookings assigned explicitly to this teacher
        const bookingRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
        const teacherBookings = bookingRes.data.filter(b => b.teacherName === loggedInUser);
        setBookings(teacherBookings);
      } catch (err) {
        console.error("Failed to sync metrics pipeline:", err);
      }
    };
    fetchMyData();
  }, [loggedInUser]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("CRITICAL ASSORD: Confirm account termination. All database fields and student records will be cleared permanently from MongoDB.")) {
      try {
        await axios.delete(`https://educonnect-backend-qmdv.onrender.com/api/teachers/delete-account/${realStats.id}`);
        alert("Account cleared successfully.");
        localStorage.clear();
        navigate('/');
      } catch (err) {
        alert("Deletion sequence interrupted.");
      }
    }
  };

  const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

  return (
    <div className="premium-dashboard-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* 1. STICKY SIDEBAR LAYOUT FRAME (Pinterest Blueprint matched) */}
      <aside className="pinterest-sidebar" style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', position: 'sticky', top: 0, height: '100vh', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-brand-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', marginBottom: '40px' }}>EduConnect</div>
          <nav className="sidebar-navigation-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="primary-btn" style={{ width: '100%', textAlign: 'left', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '8px', padding: '12px 16px', fontWeight: '600' }}>🏠 Portal Overview</button>
            <button className="primary-btn" style={{ width: '100%', textAlign: 'left', background: 'transparent', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px 16px', fontWeight: '500' }} onClick={() => navigate('/edit-profile')}>⚙️ Edit Profile</button>
          </nav>
        </div>
        
        <button onClick={handleDeleteAccount} className="danger-zone-delete-btn" style={{ backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
          🗑️ Wipe Account
        </button>
      </aside>

      {/* 2. MAIN HUB CONTROLLER (Right Canvas Workspace) */}
      <main className="dashboard-main-content" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {location.state?.message && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', border: '1px solid #166534', textAlign: 'center' }}>
            ✓ {location.state.message}
          </div>
        )}

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.75rem' }}>Teacher Portal</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Review student demo updates and set structural link properties.</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Logout</button>
        </header>
        
        {/* METRICS ROW SECTION */}
        <section className="summary-metrics-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
          <div className="metric-card-box" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>Profile Visibility</h4>
            <p style={{ color: '#059669', fontWeight: 'bold', margin: '12px 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ height: '8px', width: '8px', backgroundColor: '#059669', borderRadius: '50%' }}></span> Active & Public
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Active User Handled: <strong>{loggedInUser}</strong></p>
          </div>
          
          <div className="metric-card-box" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>Profile Views</h4>
            <h2 style={{ margin: '8px 0 0 0', color: '#1e40af', fontSize: '2.25rem', fontWeight: '700' }}>{realStats.views}</h2>
            <p style={{ fontSize: '0.75rem', marginTop: '8px', fontWeight: 'bold', color: '#64748b' }}>
              Credentials Matrix: {realStats.degree.toUpperCase()} • {realStats.location}
            </p>
          </div>
        </section>

        {/* TWO COLUMN COMPONENT BREAKDOWN GRID */}
        <div className="lower-dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* BROAD TRACKER COLUMN: REUSING YOUR CUSTOM INJECTED DASHBOARD COMPONENT */}
          <section className="broad-table-panel" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
            <h3 style={{ color: '#0f172a', margin: '0 0 20px 0' }}>Incoming Student Roster Requests</h3>
            <Dashboard teacherData={{ _id: realStats.id, fullName: loggedInUser, city: realStats.location }} bookings={bookings} setBookings={setBookings} onLogout={handleLogout} />
          </section>

          {/* NARROW TRACKER SIDEBAR COLUMN: REVIEWS WINDOW DISPLAY MODULE */}
          <section className="narrow-reviews-sidebar-panel" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem' }}>My Public Reviews</h3>
            
            {realStats.reviews.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem', margin: 0 }}>No reviews received yet. Student feedback logs display dynamically here.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {realStats.reviews.map((rev, index) => (
                  <div key={index} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#1e40af', fontSize: '0.9rem' }}>{rev.name}</strong>
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{renderStars(rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0', color: '#475569', fontStyle: 'italic' }}>"{rev.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </main>
    </div>
  );
};

export default TeacherDashboard;