import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const loggedInStudent = localStorage.getItem('userName') || "Student";
  const loggedInStudentPhone = localStorage.getItem('userPhone') || "";

  const [myBookings, setMyBookings] = useState([]);
  const [mentoredTeachersCount, setMentoredTeachersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch active booking schedules linked to this student
      const bookingRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
      const studentBookings = bookingRes.data.filter(b => b.studentName === loggedInStudent);
      setMyBookings(studentBookings);

      // 2. Fetch all teachers to check active long-term mentor tracking array alignments
      const teacherRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
      const activeMentors = teacherRes.data.filter(t => t.myMentoredStudents && t.myMentoredStudents.includes(loggedInStudentPhone));
      setMentoredTeachersCount(activeMentors.length);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="premium-dashboard-wrapper">

      {/* COMPACT STICKY LEFT SIDEBAR NAVIGATION RAIL */}
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className="sidebar-nav-item active">🏠 Dashboard Overview</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/search-mentors')}>🔍 Search Tutors</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-chats')}>💬 Class Chats</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      {/* RIGHT DISPLAY CANVASES CONTENT REGION */}
      <main className="dashboard-main-content">

        {/* Horizontal Top Header Bar Grid */}
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
            {/* INJECTED DYNAMIC BELL ICON CONFIGURATION */}
            <NotificationBell />
            <button onClick={handleLogout} className="logout-action-link" style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              Logout
            </button>
          </div>
        </header>

        {/* METRICS ROW (Pinterest Square Cards Grid Format Layout) */}
        <section className="summary-metrics-row">
          <div className="metric-card-box">
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Booked Classes</h4>
            <div className="metric-card-number">{myBookings.length}</div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Total slot reservations saved in records.</p>
          </div>

          <div className="metric-card-box">
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Active Mentors</h4>
            <div className="metric-card-number" style={{ color: '#10b981' }}>{mentoredTeachersCount}</div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Instructors accepted long-term.</p>
          </div>
        </section>

        {/* LOWER SPLIT AREA DATA VIEW PANELS */}
        <div className="lower-dashboard-split-grid" style={{ gridTemplateColumns: '1fr' }}>

          <section className="broad-table-panel">
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>My Demo Classes</h3>

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
                            ✅ Request Accepted
                          </span>

                          {/* --- PHASE 3 DYNAMIC UI: Wait Time Display --- */}
                          {booking.waitTime === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 'bold' }}>
                              🚀 Class starts NOW. Link sent to Class Chats!
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold' }}>
                              ⏳ Class begins in {booking.waitTime} mins. Link sent to Class Chats!
                            </span>
                          )}

                          {/* Action Buttons Row */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            
                            {/* New Shortcut to Chats */}
                            <button 
                              onClick={() => navigate('/student-chats')} 
                              style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              💬 Go to Chats
                            </button>

                            {/* Existing Fixed Mentor Binding Button */}
                            <button
                              onClick={async () => {
                                if (!loggedInStudentPhone) {
                                  alert("Session error: Phone number is missing. Please log out and log back in.");
                                  return;
                                }
                                try {
                                  await axios.patch('https://educonnect-backend-qmdv.onrender.com/api/teachers/accept-mentor-status', {
                                    studentPhone: loggedInStudentPhone,
                                    studentName: loggedInStudent,
                                    teacherName: booking.teacherName
                                  });
                                  alert("Success! You are now bound to this mentor.");
                                  window.location.reload();
                                } catch (err) {
                                  alert("Binding Error: " + (err.response?.data?.error || "Server connection failed"));
                                }
                              }}
                              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              🤝 Accept as My Mentor
                            </button>
                          </div>
                        </div>
                      ) : booking.status === 'Cancelled' ? (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Cancelled
                        </span>
                      ) : (
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Pending Review
                        </span>
                      )}
                    </div>
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

export default StudentDashboard;