import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const TeacherList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(""); 
  const [teachers, setTeachers] = useState([]); // Real data state
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate(); 

  // Fetch from database on load
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // FIXED: Pointed endpoint to your actual live cloud backend service URL
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher => {
    const searchString = (teacher.degree || "") + " " + (teacher.name || "");
    const matchesSearch = searchString.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "" || (teacher.location && teacher.location.includes(selectedCity));
    
    return matchesSearch && matchesCity;
  });

  return (
    <div className="search-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search subjects or names..." 
          className="search-bar"
          style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        
        <select 
          className="search-bar"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">All Cities</option>
          <option value="Guwahati">Guwahati</option>
          <option value="Dibrugarh">Dibrugarh</option>
          <option value="Jorhat">Jorhat</option>
          <option value="Silchar">Silchar</option>
        </select>
      </div>

      <div className="results-area">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading mentors...</p>
        ) : filteredTeachers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No teachers available yet in this area.</p>
        ) : (
          filteredTeachers.map(t => (
            <div key={t._id} className="teacher-card glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '15px 20px' }}>
              
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>{t.name}</h3>
                <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>{t.degree} • 📍 {t.location}</p>
              </div>

              <button 
                onClick={() => navigate(`/profile/${t._id}`)} 
                className="primary-btn"
                style={{ padding: '8px 15px', fontSize: '0.9rem' }}
              >
                View Profile
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherList;