import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const loggedInStudent = localStorage.getItem('userName') || "Student";
  
  // Dual Filter States
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  
  const [allTeachers, setAllTeachers] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherRes = await axios.get('http://localhost:5000/api/teachers');
        setAllTeachers(teacherRes.data);
        
        const bookingRes = await axios.get('http://localhost:5000/api/bookings');
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

  const allAvailableSubjects = ["All", "Science", "Mathematics", "English", "Social Science", "Physics", "Chemistry", "Biology"];
  const locations = ["All", "Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur", "Nagaon"];

  const filteredTeachers = allTeachers.filter(t => {
    const matchesLocation = locationFilter === "All" || t.location === locationFilter;
    const matchesSubject = subjectFilter === "All" || (t.subjects && t.subjects.includes(subjectFilter));
    return matchesLocation && matchesSubject;
  });

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
        
        {/* FIXED: Removed the extra logout button here */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#1e40af', margin: 0 }}>Welcome, {loggedInStudent}</h2>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>My Demo Classes</h3>
          
          {myBookings.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>You haven't booked any classes yet. Browse mentors below!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myBookings.map((booking) => (
                <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Mentor: {booking.teacherName}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>📅 {booking.date} | ⏰ {booking.time}</p>
                  </div>
                  <div>
                    {booking.status === 'Confirmed' ? (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Confirmed - WhatsApp Teacher for Link
                      </span>
                    ) : booking.status === 'Cancelled' ? (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Cancelled by Teacher
                      </span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr style={{ border: '0.5px solid #e2e8f0', margin: '30px 0' }} />
        
        <h2 style={{ color: '#1e40af' }}>Find Your Mentor</h2>
        
        <div className="filter-section" style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
          <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="All">Filter by Subject (All)</option>
            {allAvailableSubjects.filter(sub => sub !== "All").map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          
          <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="All">Filter by City (All)</option>
            {locations.filter(loc => loc !== "All").map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="catalog" style={{ marginTop: '30px' }}>
          <h3 style={{ textAlign: 'left' }}>
            {isLoading ? "Loading Mentors..." : filteredTeachers.length > 0 ? `Found ${filteredTeachers.length} Teachers` : "No Teachers Found"}
          </h3>
          
          {!isLoading && filteredTeachers.map(teacher => (
            <div key={teacher._id} className="glass-card" style={{ margin: '20px 0', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: '0', color: '#1e40af', fontSize: '1.2rem' }}>{teacher.name}</h4>
                  <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold' }}>★ {teacher.rating || 5}.0</span>
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#475569' }}>
                  <strong>Subjects:</strong> {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(", ") : "Not specified"}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>📍 {teacher.location} • {teacher.teachingLevel || "General"}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="primary-btn" style={{ background: '#1e40af' }} onClick={() => navigate(`/profile/${teacher._id}`)}>
                  View Profile
                </button>
              </div>
            </div>
          ))}
          
          {!isLoading && filteredTeachers.length === 0 && (
            <p style={{ color: '#ef4444', marginTop: '20px' }}>Try adjusting your filters to find more mentors.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;