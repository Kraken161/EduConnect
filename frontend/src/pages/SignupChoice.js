import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="glass-card">
        <h2>Join EduConnect as a...</h2>
        <p style={{ marginBottom: '30px', color: '#64748b' }}>
          Please select your role to continue registration.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button className="primary-btn" onClick={() => navigate('/signup-student')}>
            I am a Student
          </button>
          <button className="primary-btn" style={{ background: '#475569' }} onClick={() => navigate('/signup-teacher')}>
            I am a Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupChoice;