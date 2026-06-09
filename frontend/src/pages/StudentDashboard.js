import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const loggedInStudent = localStorage.getItem('userName') || "Student";
  const loggedInStudentPhone = localStorage.getItem('userPhone') || "";

  const [activeTab, setActiveTab] = useState('overview'); 
  const [myBookings, setMyBookings] = useState([]);
  
  // Now stores entire Direct Chat room objects so we can delete them
  const [myMentors, setMyMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const bookingRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
      const studentBookings = bookingRes.data.filter(b => b.studentName === loggedInStudent);
      setMyBookings(studentBookings);

      // Fetch 1-on-1 Direct Chat connections to define active Mentors
      const chatRes = await axios.get(`https://educonnect-backend-qmdv.onrender.com/api/chats/${loggedInStudentPhone}?userName=${loggedInStudent}`);
      const directConnections = chatRes.data.filter(c => !c.isGroup);
      setMyMentors(directConnections);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading student panel stats:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInStudent) {
      fetchDashboardData();
    }
  }, [loggedInStudent]);

  // NEW: Quick remove mentor function from the Dashboard
  const handleRemoveMentor = async (roomId, mentorName) => {
    if (!window.confirm(`Are you sure you want to permanently remove Mentor ${mentorName}?`)) return;
    
    try {
      await axios.delete(`https://educonnect-backend-qmdv.onrender.com/api/chats/channels/${roomId}`);
      alert("Mentor connection removed successfully.");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to remove mentor. Check connection.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="premium-dashboard-wrapper">

      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>🏠 Dashboard Overview</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/search-mentors')}>🔍 Search Tutors</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-chats')}>💬 Class Chats</button>
            <button className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📅 Bookings</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      <main className="dashboard-main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.75rem' }}>
              Welcome, <span style={{ color: '#1e40af' }}>{loggedInStudent}</span>
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Track approved class schedules and communicate securely with advisors.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NotificationBell />
            <button onClick={handleLogout} className="logout-action-link" style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              Logout
            </button>
          </div>
        </header>

        <div className="lower-dashboard-split-grid" style={{ gridTemplateColumns: '1fr' }}>

          {activeTab === 'overview' ? (
            <section className="broad-table-panel">
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>My Mentors</h3>

              {isLoading ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Syncing active curriculum classes...</p>
              ) : myMentors.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  You don't have any active mentor connections yet. Book a demo to connect!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myMentors.map((room) => (
                    <div key={room._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                      <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem' }}>Instructor: {room.teacherName}</h4>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => navigate('/student-chats')} 
                          style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          💬 Go to Chat
                        </button>
                        <button 
                          onClick={() => handleRemoveMentor(room._id, room.teacherName)} 
                          style={{ backgroundColor: '#f8fafc', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          ❌ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="broad-table-panel">
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>My Bookings</h3>

              {isLoading ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Syncing appointments calendar data tracks...</p>
              ) : myBookings.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  You haven't scheduled any demo requests yet. Head to the "Search Tutors" tab in the sidebar to explore advisors!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myBookings.map((booking) => (
                    <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1e40af' }}>Mentor Instructor: {booking.teacherName}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>📅 Slotted Date: {booking.date} | ⏰ Window: {booking.time}</p>
                      </div>

                      <div>
                        {booking.status === 'Confirmed' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              Approved
                            </span>
                            {booking.waitTime === 0 ? (
                              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 'bold' }}>🚀 Class starts NOW.</span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold' }}>⏳ Class begins in {booking.waitTime} mins.</span>
                            )}
                            <button 
                              onClick={() => navigate('/student-chats')} 
                              style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                            >
                              💬 Go to Chats
                            </button>
                          </div>
                        ) : booking.status === 'Cancelled' ? (
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Cancelled</span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pending Review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;