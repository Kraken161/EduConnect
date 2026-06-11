import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchMentors = () => {
  const navigate = useNavigate();
  const loggedInStudentName = localStorage.getItem('userName') || "Student";
  const loggedInStudentPhone = localStorage.getItem('userPhone') || "";

  // Data Pipeline States
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Roster Filter Alignment States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  // 5-CARD PAGINATION STATE TRACKING
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error pulling catalog entries:", err);
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // FIXED & BULLETPROOF Filter Algorithm
  const filteredTeachers = teachers.filter(t => {
    // 1. Safe Search Match (checks name, degree, and ignores case)
    const searchString = `${t.name || ""} ${t.degree || ""} ${t.subjects || ""}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase().trim());
    
    // 2. Safe City Match
    const matchesCity = selectedCity === "All" || (t.location && t.location.toLowerCase() === selectedCity.toLowerCase());
    
    // 3. Safe Subject Match (Handles "All", Arrays, and pure Strings flawlessly)
    let matchesSubject = selectedSubject === "All";
    if (selectedSubject !== "All" && t.subjects) {
        if (Array.isArray(t.subjects)) {
            matchesSubject = t.subjects.some(sub => sub.toLowerCase() === selectedSubject.toLowerCase());
        } else if (typeof t.subjects === 'string') {
            matchesSubject = t.subjects.toLowerCase().includes(selectedSubject.toLowerCase());
        }
    }

    return matchesSearch && matchesCity && matchesSubject;
  });

  // MATHEMATICAL SLICING FOR THE 5-ITEM PAGINATION SPLIT
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachersPageSlice = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setCurrentPage(1);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setCurrentPage(1);
  };

  const handleInitiateChatRequest = async (teacher) => {
    if (!loggedInStudentPhone) {
      alert("⚠️ Error: Student identity session is missing. Please log out and sign back in.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        teacherName: teacher.name,
        studentName: loggedInStudentName,
        studentPhone: loggedInStudentPhone,
        date: "Chat Request Thread",
        time: "Real-time Inbox Invitation",
        status: "Pending"
      });

      alert(`🎉 Invitation delivered successfully to Instructor ${teacher.name}! A secure 1-on-1 private chat channel will open automatically the moment they accept your request on their dashboard.`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit chat invitation parameter stack to backend.");
    }
  };

  const allAvailableSubjects = ["All", "Science", "Mathematics", "English", "Social Science", "Physics", "Chemistry", "Biology"];
  const locations = ["All", "Guwahati", "Dibrugarh", "Jorhat", "Silchar"];

  return (
    <div className="premium-dashboard-wrapper">
      
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className="sidebar-nav-item" onClick={() => navigate('/student-dashboard')}>🏠 Dashboard Overview</button>
            <button className="sidebar-nav-item active">🔍 Search Tutors</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-chats')}>💬 Class Chats</button>
            <button className="sidebar-nav-item" onClick={() => navigate('/student-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      <main className="dashboard-main-content">
        <header style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h2>Find Your Mentor</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Browse verified educators across Assam using subject parameters.</p>
        </header>

        {/* TOP FILTER BAR GRID ROW */}
        <section className="search-filter-top-bar">
          <input 
            type="text" 
            placeholder="Search credentials, subjects or names..." 
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          
          <select value={selectedSubject} onChange={handleSubjectChange} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
            <option value="All">Filter by Subject (All)</option>
            {allAvailableSubjects.filter(s => s !== "All").map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <select value={selectedCity} onChange={handleCityChange} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
            <option value="All">Filter by City (All)</option>
            {locations.filter(c => c !== "All").map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </section>

        <section className="mentor-search-cards-grid">
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Syncing mentor database entries...</p>
          ) : currentTeachersPageSlice.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ef4444', fontWeight: '500' }}>No teachers match your search query filters in this territory layer.</p>
          ) : (
            currentTeachersPageSlice.map(teacher => (
              <div key={teacher._id} className="glass-card" style={{ margin: '0', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', textAlign: 'left', maxWidth: '100%', boxId: 'cards-container' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.2rem', fontWeight: '700' }}>{teacher.name}</h4>
                    <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '700' }}>
                      ★ {teacher.rating ? Number(teacher.rating).toFixed(1) : "5.0"} Rating
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0 4px 0', fontSize: '0.9rem', color: '#334155' }}>
                    <strong>Specialization Path:</strong> {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects : "General Matrix"}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    🎓 {teacher.degree ? teacher.degree.toUpperCase() : 'DEGREE'} • 📍 District Zone: {teacher.location} • {teacher.teachingLevel || "General Core"}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleInitiateChatRequest(teacher)}
                    className="primary-btn" 
                    style={{ backgroundColor: '#10b981', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                  >
                    💬 Chat Request
                  </button>
                  <button 
                    onClick={() => navigate(`/profile/${teacher._id}`)} 
                    className="primary-btn"
                    style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {totalPages > 1 && (
          <div className="pagination-controls-row">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              ← Previous
            </button>
            <span className="pagination-text-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next →
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default SearchMentors;