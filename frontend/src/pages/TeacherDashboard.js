import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../components/Dashboard'; 
import NotificationBell from '../components/NotificationBell';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = localStorage.getItem('userName') || "Teacher";
  const loggedInUserPhone = localStorage.getItem('userPhone') || "";

  const [realStats, setRealStats] = useState({
    id: null,
    views: 0,
    degree: "Loading...",
    location: "Loading...",
    reviews: [],
    rating: 5.0
  });
  
  const [bookings, setBookings] = useState([]);

  const syncTeacherPortalPipeline = async () => {
    try {
      // 1. Fetch teacher data to calculate reviews and views dynamically
      const response = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
      const myProfile = response.data.find(t => t.name === loggedInUser || t.phone === loggedInUserPhone);
      
      if (myProfile) {
        setRealStats({
          id: myProfile._id,
          views: myProfile.profileViews || 0,
          degree: myProfile.degree || "N/A",
          location: myProfile.location || "N/A",
          reviews: myProfile.reviews || [],
          rating: myProfile.rating || 5.0
        });
      }

      // 2. Fetch assigned user appointments lists
      const bookingRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
      const teacherBookings = bookingRes.data.filter(b => b.teacherName === loggedInUser);
      setBookings(teacherBookings);
    } catch (err) {
      console.error("Failed to compile teacher metrics data channel stream:", err);
    }
  };

  useEffect(() => {
    if (loggedInUser) {
      syncTeacherPortalPipeline();
    }
  }, [loggedInUser]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const renderStars = (num) => "★".repeat(Math.round(num)) + "☆".repeat(5 - Math.round(num));

  return (
    <div className="premium-dashboard-wrapper">
      
      {/* COMPACT PINTEREST LEFT NAVIGATION RAIL */}
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className="sidebar-nav-item active">🏠 Portal Overview</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/teacher-chats')}>💬 Class Chats</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/teacher-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      {/* RIGHT WORKSPACE DESK CONTAINER CANVAS AREA */}
      <main className="dashboard-main-content">
        
        {location.state?.message && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', border: '1px solid #166534', textAlign: 'center' }}>
            ✓ {location.state.message}
          </div>
        )}

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.75rem' }}>Teacher Portal</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Approve pending allocations and connect with students inside the chat terminal channels.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* INJECTED DYNAMIC BELL ICON MODULE */}
            <NotificationBell />
            <button onClick={handleLogout} className="logout-action-link" style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              Logout
            </button>
          </div>
        </header>
        
        {/* METRICS ROW SECTION */}
        <section className="summary-metrics-row">
          <div className="metric-card-box">
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>Average Rating</h4>
            <h2 style={{ margin: '8px 0 0 0', color: '#f59e0b', fontSize: '2.25rem', fontWeight: '700' }}>
              ★ {Number(realStats.rating).toFixed(1)}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
              Calculated dynamically from <strong>{realStats.reviews.length}</strong> submitted feedback forms.
            </p>
          </div>
          
          <div className="metric-card-box">
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>Profile Analytics</h4>
            <h2 style={{ margin: '8px 0 0 0', color: '#1e40af', fontSize: '2.25rem', fontWeight: '700' }}>{realStats.views}</h2>
            <p style={{ fontSize: '0.75rem', marginTop: '8px', fontWeight: 'bold', color: '#64748b' }}>
              Bio Scope: {realStats.degree.toUpperCase()} • Region District: {realStats.location}
            </p>
          </div>
        </section>

        {/* TWO COLUMN WORKSPACE SPLIT GRID */}
        <div className="lower-dashboard-split-grid">
          
          {/* BROAD CONTAINER COLUMN AREA: SCHEDULER MATRIX DATA TABLE */}
          <section className="broad-table-panel" style={{ overflowX: 'auto' }}>
            <h3 style={{ color: '#0f172a', margin: '0 0 20px 0' }}>Incoming Student Roster Requests</h3>
            <Dashboard />
          </section>

          {/* NARROW TRACKER SIDEBAR COLUMN AREA: REVIEWS LIST DISPLAY COMPONENT */}
          <section className="narrow-reviews-sidebar-panel">
            <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem' }}>My Public Reviews</h3>
            
            {realStats.reviews.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem', margin: 0 }}>
                No reviews received yet. Dynamic student feedback rows mount inside this panel.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {realStats.reviews.map((rev, index) => (
                  <div key={index} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#1e40af', fontSize: '0.9rem' }}>{rev.name}</strong>
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{renderStars(rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0', color: '#475569', fontStyle: 'italic' }}>
                      "{rev.text}"
                    </p>
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