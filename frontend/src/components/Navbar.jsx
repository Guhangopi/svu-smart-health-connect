import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const navStyle = {
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", // Exact match to Sidebar
    height: "70px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 900,
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)" // Match sidebar header border
  };

  const containerStyle = {
    width: "100%",
    // maxWidth: "1200px",  <-- REMOVED constrained width
    margin: "0",
    padding: "0 2rem",     // Increased padding for better edge spacing
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const linkStyle = {
    color: "#d4af37", // Matte Metallic Gold
    textDecoration: "none",
    marginLeft: "30px", // More spacing
    fontWeight: "500",
    fontSize: "1rem",
    transition: "color 0.2s"
  };

  const activeLinkStyle = {
      ...linkStyle,
      color: "#ffffff", // White for Active
      fontWeight: "700"
      // Removed textShadow
  };
  
  // Helper to determine if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        {/* Brand / Logo Area - Left End */}
        <Link
          to="/"
          style={{
            color: "#d4af37", // Matte Metallic Gold
            textDecoration: "none",
            fontSize: "1.4rem",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            letterSpacing: "-0.02em"
          }}
        >
          <img 
            src="/svu_logo.jpg" 
            alt="SVU Logo" 
            style={{ height: "45px", marginRight: "12px", borderRadius: "4px", border: "1px solid #d4af37" }} 
          />
          SVU Smart Health Connect
        </Link>

        {/* Navigation Links - Right End */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={isActive('/') ? activeLinkStyle : linkStyle}>
            Home
          </Link>
          <Link to="/about" style={isActive('/about') ? activeLinkStyle : linkStyle}>
            About
          </Link>
          <Link to="/services" style={isActive('/services') ? activeLinkStyle : linkStyle}>
            Services
          </Link>
          <Link to="/contact" style={isActive('/contact') ? activeLinkStyle : linkStyle}>
            Contact
          </Link>
          

          
          {user && user.role === 'admin' && (
             <Link to="/admin" style={isActive('/admin') ? activeLinkStyle : linkStyle}>Admin Portal</Link>
          )}

          {user ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link 
                to={
                  user.role === 'student' ? '/patient-portal' :
                  user.role === 'doctor' ? '/doctor-portal' :
                  user.role === 'pharmacist' ? '/pharmacist-portal' :
                  user.role === 'lab_tech' ? '/lab-portal' :
                  user.role === 'admin' ? '/admin' : '/'
                }
                style={{
                  textDecoration: 'none',
                  marginLeft: "25px",
                  backgroundColor: "#3b82f6", // Primary Blue
                  color: "white", 
                  padding: "0.5rem 1.25rem",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  boxShadow: "0 2px 5px rgba(59, 130, 246, 0.4)"
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  color: "#fca5a5", // Soft Red
                  padding: "0.5rem 1rem",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginLeft: "10px",
                  fontSize: "0.85rem",
                  boxShadow: "none"
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div 
              style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => {
                if (window.dropdownTimeout) clearTimeout(window.dropdownTimeout);
                setShowDropdown(true);
              }}
              onMouseLeave={() => {
                window.dropdownTimeout = setTimeout(() => {
                  setShowDropdown(false);
                }, 300); // 300ms delay to allow moving to the menu
              }}
            >
              <div
                style={{
                  ...linkStyle,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  height: "100%"
                }}
              >
                Sign In <span style={{ fontSize: "0.8rem", marginTop: "2px" }}>▼</span>
              </div>

              {showDropdown && (
                <div 
                  style={{
                    position: "absolute",
                    top: "60px", // Pushed down slightly
                    right: "-10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: "180px",
                    zIndex: 1000,
                    // Invisible bridge area to catch mouse movement
                    paddingTop: "10px",
                    marginTop: "-10px" 
                  }}
                  onMouseEnter={() => {
                    if (window.dropdownTimeout) clearTimeout(window.dropdownTimeout);
                  }}
                  onMouseLeave={() => {
                     window.dropdownTimeout = setTimeout(() => {
                      setShowDropdown(false);
                    }, 300);
                  }}
                >
                  <div style={{ backgroundColor: "#fff", borderRadius: "0.5rem", overflow: "hidden" }}>
                    <Link 
                      to="/login"
                      state={{ loginType: 'student', title: 'Student Login' }}
                      style={{
                        padding: "12px 20px",
                        display: "block",
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                      onMouseLeave={(e) => e.target.style.background = "#fff"}
                      onClick={() => setShowDropdown(false)} // Close on click
                    >
                      Student Login
                    </Link>
                    <Link 
                      to="/login"
                      state={{ loginType: 'staff', title: 'Doctor Login' }}
                      style={{
                        padding: "12px 20px",
                        display: "block",
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                      onMouseLeave={(e) => e.target.style.background = "#fff"}
                      onClick={() => setShowDropdown(false)}
                    >
                      Doctor Login
                    </Link>
                    <Link 
                      to="/login"
                      state={{ loginType: 'staff', title: 'Staff Login' }}
                      style={{
                        padding: "12px 20px",
                        display: "block",
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                      onMouseLeave={(e) => e.target.style.background = "#fff"}
                      onClick={() => setShowDropdown(false)}
                    >
                      Staff Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
