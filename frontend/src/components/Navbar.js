import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // Check if someone is logged in
  const isLoggedIn = !!localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear(); // Wipes the session
    alert("Logged out successfully!");
    navigate('/');
    window.location.reload(); // Refreshes nav state
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>
        EduConnect
      </Link>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#475569' }}>Login</Link>
            <Link to="/signup-choice" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;