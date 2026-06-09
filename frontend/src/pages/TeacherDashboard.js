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

  // Inline Routing State
  const [activeTab, setActiveTab] = useState('overview');

  const [realStats, setRealStats] = useState({
    id: null,
    views: 0,
    degree: "Loading...",
    location: "Loading...",
    reviews: [],
    rating: 5.0
  });
  
  const [myStudents, setMyStudents] = useState([]);

  const syncTeacherPortalPipeline = async () => {
    try {
      // 1. Fetch teacher data
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

      // 2. Fetch all chats to determine "My Students"
      const chatRes = await axios.get(`https://educonnect-backend-qmdv.onrender.com/api/chats/${loggedInUserPhone}?userName=${loggedInUser}`);
      const groupChats = chatRes.data.filter(c => c.isGroup);
      const directChats = chatRes.data.filter(c => !c.isGroup);

      // Extract unique student phones from all active classes
      let studentPhonesInGroups = new Set();
      groupChats.forEach(gc => {
        gc.allowedMembers.forEach(phone => {
          if (phone !== loggedInUserPhone) studentPhonesInGroups.add(phone);
        });
      });

      // Map phones to names using direct chats data
      const activeStudents = Array.from(studentPhonesInGroups).map(phone => {
        const match = directChats.find(dc => dc.studentPhone === phone);
        return {
          phone,
          name: (match && match.studentName && match.studentName !== "Student" && match.studentName !== "Guest Student") 
            ? match.studentName 
            : phone
        };
      });

      setMyStudents(activeStudents);

    } catch (err) {
      console.error("Failed to compile teacher metrics:", err);
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
      
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>🏠 Portal Overview</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/teacher-chats')}>💬 Class Chats</button>
            
            {/* NEW BOOKINGS TAB */}
            <button className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📅 Bookings</button>
            
            <button className="sidebar-nav-item" onClick={() => navigate('/teacher-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

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
            <NotificationBell />
            <button onClick={handleLogout} className="logout-action-link" style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              Logout
            </button>
          </div>
        </header>
        
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

        <div className="lower-dashboard-split-grid">
          
          {/* DYNAMIC TAB RENDERING */}
          {activeTab === 'overview' ? (
            <section className="broad-table-panel">
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>My Students</h3>

              {myStudents.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  No students have been assigned to your class groups yet. Accept requests in the Bookings tab and assign them in Class Chats!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myStudents.map((student, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                      <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem' }}>Student: {student.name}</h4>
                      <button 
                        onClick={() => navigate('/teacher-chats')} 
                        style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        💬 View Classes
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="broad-table-panel" style={{ overflowX: 'auto' }}>
              <h3 style={{ color: '#0f172a', margin: '0 0 20px 0' }}>Incoming Student Requests</h3>
              <Dashboard />
            </section>
          )}

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