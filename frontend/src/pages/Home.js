import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // 1. THE AUTO-REDIRECT LOGIC
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'student') {
      navigate('/student-dashboard');
    } else if (userRole === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }, [navigate]);

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      
      
      <section style={{ maxWidth: '800px', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '20px' }}>
          🚀 Assam's Premier Learning Platform
        </div>
        
        <h1 style={{ fontSize: '3rem', color: '#0f172a', margin: '0 0 20px 0', lineHeight: '1.2' }}>
          Connect with Expert <span style={{ color: '#2563eb' }}>Educators</span> in Your Neighborhood.
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6' }}>
          EduConnect bridges the gap between eager students and qualified mentors. Whether you are in High School or pursuing higher education, find the perfect tutor today.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/signup-choice" style={{ textDecoration: 'none' }}>
            <button className="primary-btn" style={{ padding: '15px 30px', fontSize: '1.1rem', borderRadius: '30px' }}>
              Join EduConnect Free
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="primary-btn" style={{ padding: '15px 30px', fontSize: '1.1rem', borderRadius: '30px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
              Login to Account
            </button>
          </Link>
        </div>
      </section>

      {/* NON-FUNCTIONAL TRUST STATS TO LOOK PROFESSIONAL */}
      <section style={{ display: 'flex', gap: '40px', marginTop: '50px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '20px 40px', textAlign: 'center', minWidth: '150px' }}>
          <h2 style={{ margin: 0, color: '#2563eb', fontSize: '2rem' }}>500+</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Active Students</p>
        </div>
        <div className="glass-card" style={{ padding: '20px 40px', textAlign: 'center', minWidth: '150px' }}>
          <h2 style={{ margin: 0, color: '#2563eb', fontSize: '2rem' }}>50+</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Verified Mentors</p>
        </div>
        <div className="glass-card" style={{ padding: '20px 40px', textAlign: 'center', minWidth: '150px' }}>
          <h2 style={{ margin: 0, color: '#2563eb', fontSize: '2rem' }}>100%</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Free to Join</p>
        </div>
      </section>

    </div>
  );
};

export default Home;