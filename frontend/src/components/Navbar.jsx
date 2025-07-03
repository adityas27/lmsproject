import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from '../assets/logo.svg'
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('access');
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Courses' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/"><img style={{"width":"60px","height":"50px", "borderRadius":"50%"}} src={Logo} /></Link>
      </div>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={location.pathname === link.to ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {!isAuthenticated ? (
          <>
          <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
          <li><Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>Sign up</Link></li>
          </>
        ) : (
          <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
        )}
      </ul>
    </nav>
  );
}
