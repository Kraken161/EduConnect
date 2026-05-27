import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const loggedInStudent = localStorage.getItem('userName') || "Student";
  const studentId = localStorage.getItem('userPhone'); // Tracking phone number as fallback unique reference identifier
  
  // Dual Filter States
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  
  const [allTeachers, setAllTeachers] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
        setAllTeachers(teacherRes.data);
        
        const bookingRes = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
        const studentBookings = bookingRes.data.filter(b => b.studentName === loggedInStudent);
        setMyBookings(studentBookings);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [loggedInStudent]);

  // Permanently delete a student account
  const handleDeleteAccount = async () => {
    if (window.confirm("CRITICAL ACCORD: Are you absolutely certain you want to delete your student account? All booked class data fields will be wiped out permanently.")) {
      try {
        await axios.delete(`https://educonnect-backend-qmdv.onrender.com/api/students/delete-account/${studentId}`);
        alert("Your student profile has been wiped cleanly from the database ecosystem.");
        localStorage.clear();
        navigate('/');
      } catch (err) {
        console.error(err);
        alert("Failed to delete account. Proceed with manual credential review.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const allAvailableSubjects = ["All", "Science", "Mathematics", "English", "Social Science", "Physics", "Chemistry", "Biology"];
  const locations = ["All", "Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur", "Nagaon"];

  const filteredTeachers = allTeachers.filter(t => {
    const matchesLocation = locationFilter === "All" || t.location === locationFilter;
    const matchesSubject = subjectFilter === "All" || (t.subjects && t.subjects.includes(subjectFilter));
    return matchesLocation && matchesSubject;
  });

  return (
    <div className="premium-dashboard-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'inherit' }}>
      
      {/* 1. STICKY LEFT SIDEBAR (Pinterest Layout) */}
      <aside className="pinterest-sidebar" style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', position: 'sticky', top: 0, height: '100vh', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-brand-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', marginBottom: '40px' }}>EduConnect</div>
          <nav className="sidebar-navigation-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="primary-btn" style={{ width: '100%', textAlign: 'left', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '8px', padding: '12px 16px', fontWeight: '600' }}>🏠 Dashboard</button>
            <button className="primary-btn" style={{ width: '100%', textAlign: 'left', background: 'transparent', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px 16px', fontWeight: '500' }} onClick={() => navigate('/search-mentors')}>🔍 Search Tutors</button>
          </nav>
        </div>
        
        {/* DANGER ZONE ACCORD */}
        <button onClick={handleDeleteAccount} className="danger-zone-delete-btn" style={{ backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
          🗑️ Delete Account
        </button>
      </aside>

      {/* 2. CONTENT CONTAINER PANEL (Right Side Area) */}
      <main className="dashboard-main-content" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Horizontal Top Welcomer Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.75rem' }}>Welcome, <span style={{ color: '#1e40af' }}>{loggedInStudent}</span></h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Track your active academic sessions and find verified mentors.</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Logout</button>
        </header>

        {/* METRICS ROW (Structured Row Grid Cards) */}
        <section className="summary-metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="metric-card-box" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Booked Slots</h4>
            <div className="metric-card-number" style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af', marginTop: '8px' }}>{myBookings.length}</div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Total processed tutorial allocations.</p>
          </div>
          <div className="metric-card-box" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h4 style={{ color: '#64748b', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Advisors</h4>
            <div className="metric-card-number" style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b', marginTop: '8px' }}>{allTeachers.length}</div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Verified mentors active across regions.</p>
          </div>
        </section>

        {/* TWO COLUMN SUB GRID SPLITTING DESIGNS */}
        <div className="lower-dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* BROADER AREA: SCHEDULER MANAGEMENT COMPONENT */}
          <section className="broad-table-panel" style={{ background: '#ffffff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>My Demo Classes</h3>
            
            {myBookings.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>You haven't scheduled any sessions yet. Browse the catalog listings to locate a mentor!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myBookings.map((booking) => (
                  <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1e40af' }}>Mentor: {booking.teacherName}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>📅 {booking.date} | ⏰ {booking.time}</p>
                    </div>
                    <div>
                      {booking.status === 'Confirmed' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Approved
                          </span>
                          {booking.meetingLink ? (
                            <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="zoom-connect-btn" style={{ backgroundColor: '#2d8cff', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none' }}>
                              📹 Join Zoom Class
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Waiting for teacher to link Zoom...</span>
                          )}
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

          {/* NARROW SIDE PANEL: QUICK CATALOG CONTROLLER */}
          <section className="narrow-reviews-sidebar-panel" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '1.15rem' }}>Find Your Mentor</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="All">All Subjects</option>
                {allAvailableSubjects.filter(sub => sub !== "All").map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="All">All Cities</option>
                {locations.filter(loc => loc !== "All").map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </section>

        </div>

        {/* RESULTS CATALOG LOWER BOUND ROW */}
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>
            {isLoading ? "Loading Mentors..." : filteredTeachers.length > 0 ? `Available Instructors (${filteredTeachers.length})` : "No Mentors Found Matching Filters"}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLoading && filteredTeachers.map(teacher => (
              <div key={teacher._id} className="glass-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: '0', color: '#1e40af', fontSize: '1.1rem' }}>{teacher.name}</h4>
                    <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold' }}>★ {teacher.rating || 5}.0</span>
                  </div>
                  <p style={{ margin: '6px 0 4px 0', fontSize: '0.85rem', color: '#475569' }}>
                    <strong>Specialization:</strong> {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(", ") : "General"}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>📍 {teacher.location} • {teacher.teachingLevel || "General Studies"}</p>
                </div>
                <button className="primary-btn" style={{ background: '#1e40af', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => navigate(`/profile/${teacher._id}`)}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default StudentDashboard;