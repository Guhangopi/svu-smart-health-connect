import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile State
  const location = useLocation();
  const navigate = useNavigate();

  // Check auth state whenever the route changes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setMobileMenuOpen(false); // Close mobile menu on route change
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <Link to="/" className="brand-link">
          <img src="/svu_logo.jpg" alt="SVU Logo" className="brand-logo" />
          SVU Smart Health Connect
        </Link>
        
        {/* Mobile Toggle Button */}
        <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>About</Link>
          <Link to="/services" className={`nav-item ${isActive('/services') ? 'active' : ''}`}>Services</Link>
          <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
          
          {user && user.role === 'admin' && (
             <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>Admin Portal</Link>
          )}

          {/* Auth Section Desktop */}
          {user ? (
            <div className="auth-container">
              <Link 
                to={
                  user.role === 'student' ? '/patient-portal' :
                  user.role === 'doctor' ? '/doctor-portal' :
                  user.role === 'pharmacist' ? '/pharmacist-portal' :
                  user.role === 'lab_tech' ? '/lab-portal' :
                  user.role === 'admin' ? '/admin' : '/'
                }
                className="btn-dashboard"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          ) : (
            <div className="signin-wrapper">
              <div className="signin-trigger">
                Sign In <span style={{ fontSize: "0.8rem", marginTop: "2px", marginLeft: "5px" }}>▼</span>
              </div>

              <div className="signin-dropdown">
                  <Link to="/login" state={{ loginType: 'student', title: 'Student Login' }} className="dropdown-item">Student Login</Link>
                  <Link to="/login" state={{ loginType: 'staff', title: 'Doctor Login' }} className="dropdown-item">Doctor Login</Link>
                  <Link to="/login" state={{ loginType: 'staff', title: 'Staff Login' }} className="dropdown-item">Staff Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (Visible only when open on mobile) */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>About</Link>
            <Link to="/services" className={`nav-item ${isActive('/services') ? 'active' : ''}`}>Services</Link>
            <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
            
            {user && user.role === 'admin' && (
                <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>Admin Portal</Link>
            )}

            <div className="mobile-auth-section">
                {user ? (
                    <>
                        <Link 
                            to={user.role === 'student' ? '/patient-portal' : user.role === 'doctor' ? '/doctor-portal' : user.role === 'pharmacist' ? '/pharmacist-portal' : user.role === 'lab_tech' ? '/lab-portal' : '/admin'}
                            className="btn-dashboard"
                            style={{textAlign: 'center'}}
                        >
                            Go to Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn-logout" style={{width: '100%'}}>Logout</button>
                    </>
                ) : (
                    <>
                        <div style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold'}}>Sign In As:</div>
                        <div className="dropdown-group">
                            <Link to="/login" state={{ loginType: 'student', title: 'Student Login' }} className="dropdown-item">Student</Link>
                            <Link to="/login" state={{ loginType: 'staff', title: 'Doctor Login' }} className="dropdown-item">Doctor</Link>
                            <Link to="/login" state={{ loginType: 'staff', title: 'Staff Login' }} className="dropdown-item">Staff</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
