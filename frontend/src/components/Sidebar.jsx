import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const menuItems = [
    { label: 'Admin Hub', tab: 'hub', role: 'admin', icon: '⚡' },
    { label: 'Manage Doctors', tab: 'doctors', role: 'admin', icon: '👨‍⚕️' },
    { label: 'Appointments', tab: 'appointments', role: 'admin', icon: '📅' },
    { label: 'Manage Students', tab: 'students', role: 'admin', icon: '🎓' },
    { label: 'Manage Staff', tab: 'staff', role: 'admin', icon: '🛠️' },
    { label: 'Dashboard', tab: 'dashboard', role: 'doctor', icon: '📊' },
    { label: 'My Patients', tab: 'patients', role: 'doctor', icon: '🩺' },
    { label: 'Pharmacy Dashboard', tab: 'dashboard', role: 'pharmacist', icon: '💊' },
    { label: 'Lab Tech Dashboard', tab: 'dashboard', role: 'lab_tech', icon: '🧪' },
    { label: 'Book Appointment', tab: 'book', role: 'student', icon: '➕' },
    { label: 'My History', tab: 'history', role: 'student', icon: '📅' },
    { label: 'Prescriptions', tab: 'prescriptions', role: 'student', icon: '📄' },
    { label: 'Medical Records', tab: 'records', role: 'student', icon: '📂' },
  ];

  const formatRole = (role) => {
    if (!role) return 'USER';
    if (role === 'lab_tech') return 'Lab Technician'; // Special case
    return role.toUpperCase();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} 
        onClick={closeSidebar}
      ></div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
             <div>
                <h2>SmartHealth</h2>
                <span className="badge">{formatRole(userRole)}</span>
             </div>
             {/* Close button inside sidebar for convenience on mobile */}
             <button 
                className="d-md-none" 
                onClick={closeSidebar}
                style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', padding: 0}}
             >
                ✕
             </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.filter(item => item.role === userRole).map((item, idx) => (
            <button 
              key={idx}
              className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.tab);
                closeSidebar(); // Close on selection (mobile)
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
