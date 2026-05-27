import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('userName');

  // Hide global header nav bar when viewing dashboard spaces to protect grid shell styling
  const isDashboardRoute = location.pathname.includes('dashboard');
  if (isDashboardRoute) return null;

  const handleLogout = () => {
    localStorage.clear(); 
    alert("Logged out successfully!");
    navigate('/');
    window.location.reload(); 
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
            <Link to="/login" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Login</Link>
            <Link to="/signup-choice" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;