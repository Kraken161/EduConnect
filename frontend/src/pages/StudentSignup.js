import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    educationLevel: '',
    specificClass: '',
    location: '' 
  });
  
  // NEW SECURITY INTEGRATION: Dual password confirmation matching
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    
    if (formData.password !== confirmPassword) {
      alert("⚠️ Password Matching Mismatch: Please ensure Create Password and Confirm Password matches exactly.");
      return;
    }

    try {
     
      await axios.post('http://localhost:5000/api/students', formData);
      
     
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userPhone', formData.phone); 
      localStorage.setItem('userRole', 'student');
      
      navigate('/student-dashboard');
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Registration failed. Please make sure the backend is running.");
    }
  };

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>Student Registration</h2>
        
        <form onSubmit={handleSignup} style={{ textAlign: 'left' }}>
          
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="First and Last Name" required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Phone Number (+91)</label>
            <input type="tel" placeholder="Enter 10 digit number" required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Create Password</label>
            <input type="password" placeholder="Min. 6 characters" required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          {/* DYNAMIC CONFIRMATION FIELD REQUIREMENT */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Retype created password to confirm accuracy" required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Education Level</label>
            <select required value={formData.educationLevel} onChange={(e) => setFormData({...formData, educationLevel: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">Select Level</option>
              <option value="school">School (Class 1-10)</option>
              <option value="college">Higher Secondary (11-12)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select City / Town</label>
            <select required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Select Location --</option>
              <option value="Guwahati">Guwahati</option>
              <option value="Dibrugarh">Dibrugarh</option>
              <option value="Jorhat">Jorhat</option>
              <option value="Silchar">Silchar</option>
            </select>
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%' }}>
            Complete Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentSignup;