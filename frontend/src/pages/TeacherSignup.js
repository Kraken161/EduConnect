import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherSignup = () => {
  const [name, setName] = useState(""); 
  const [degree, setDegree] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(""); 
  
  // --- NEW STATES FOR YOUR UPGRADE ---
  const [teachingLevel, setTeachingLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [bio, setBio] = useState("");

  const navigate = useNavigate();

  // The logic to show the right subjects based on the class level
  const class10Subjects = ["Science", "Mathematics", "English", "Social Science"];
  const class12Subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Social Science"];
  
  const availableSubjects = teachingLevel === "Class (1-10)" ? class10Subjects : 
                            teachingLevel === "Class (11-12)" ? class12Subjects : [];

  const handleSubjectToggle = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject)); // Remove if already checked
    } else {
      setSelectedSubjects([...selectedSubjects, subject]); // Add if not checked
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to teach.");
      return;
    }

    const newTeacher = { 
      name, phone, password, location, degree, 
      teachingLevel, subjects: selectedSubjects, bio 
    };

    try {
      await axios.post('http://localhost:5000/api/teachers', newTeacher);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', 'teacher');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error("Signup error:", err);
      alert("Registration failed. Make sure backend is running!");
    }
  };

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '550px', margin: '0 auto' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>Teacher Registration</h2>
        
        <form onSubmit={handleRegister} style={{ textAlign: 'left' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group">
              <label>Phone Number (+91)</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>City / Town</label>
              <select required value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">-- Select --</option>
                <option value="Guwahati">Guwahati</option>
                <option value="Dibrugarh">Dibrugarh</option>
                <option value="Jorhat">Jorhat</option>
                <option value="Silchar">Silchar</option>
              </select>
            </div>
            <div className="form-group">
              <label>Create Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Highest Qualification</label>
            <select onChange={(e) => setDegree(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">Select Qualification</option>
              <option value="btech">B.Tech</option>
              <option value="bsc">B.Sc</option>
              <option value="masters">Masters / PhD</option>
            </select>
          </div>

          <hr style={{ margin: '25px 0', border: '0.5px solid #e2e8f0' }} />

          {/* --- THE NEW SUBJECT SELECTOR --- */}
          <div className="form-group">
            <label style={{ color: '#1e40af', fontWeight: 'bold' }}>Teaching Level</label>
            <select required value={teachingLevel} onChange={(e) => { setTeachingLevel(e.target.value); setSelectedSubjects([]); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Select Classes to Teach --</option>
              <option value="Class (1-10)">High School: Class (1-10)</option>
              <option value="Class (11-12)">Higher Secondary: Class (11-12)</option>
            </select>
          </div>

          {teachingLevel && (
            <div className="form-group animate-slide">
              <label>Select Subjects (Choose multiple)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {availableSubjects.map(sub => (
                  <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedSubjects.includes(sub)}
                      onChange={() => handleSubjectToggle(sub)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* --- THE NEW BIO TEXTAREA --- */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Professional Bio</label>
            <textarea 
              required
              placeholder="Tell students about your teaching style, experience, and why they should book a demo with you..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="primary-btn full-width" style={{ marginTop: '15px' }}>
            Register as Teacher
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherSignup;