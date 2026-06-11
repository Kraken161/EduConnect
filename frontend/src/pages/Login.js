import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Swapped out the static site link for your live cloud backend login service endpoint
      const response = await axios.post('http://localhost:5000/api/login', credentials);
      
      // If successful, save the real user data to memory
      localStorage.setItem('userRole', credentials.role);
      localStorage.setItem('userName', response.data.name); 
      // SAVING REAL PHONE PARAMETERS FROM SERVER RESPONSE PAYLOAD
      localStorage.setItem('userPhone', response.data.phone || credentials.phone);

      // Route to the correct dashboard
      if (credentials.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid phone number or password. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ color: '#1e40af' }}>Login to EduConnect</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
          Welcome back! Please enter your details.
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Login as:</label>
            <select 
              value={credentials.role} 
              onChange={(e) => setCredentials({...credentials, role: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              placeholder="Enter 10-digit number" 
              required
              value={credentials.phone}
              onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              required
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '0.8rem' }}>
          <p>Don't have an account? 
            <span 
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }} 
              onClick={() => navigate('/signup-choice')}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;