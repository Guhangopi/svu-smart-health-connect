import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Manage Doctors', tab: 'doctors', role: 'admin', icon: '👨‍⚕️' },
    { label: 'Appointments', tab: 'appointments', role: 'admin', icon: '📅' },
    { label: 'Dashboard', tab: 'dashboard', role: 'doctor', icon: '📊' },
    { label: 'My Patients', tab: 'patients', role: 'doctor', icon: '🩺' },
    { label: 'Pharmacy Dashboard', tab: 'dashboard', role: 'pharmacist', icon: '💊' },
    { label: 'Upload Reports', tab: 'upload', role: 'lab_tech', icon: '🧪' },
    { label: 'Book Appointment', tab: 'book', role: 'student', icon: '➕' },
    { label: 'My History', tab: 'history', role: 'student', icon: '📅' },
    { label: 'Prescriptions', tab: 'prescriptions', role: 'student', icon: '📄' },
    { label: 'Medical Records', tab: 'records', role: 'student', icon: '📂' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>SmartHealth</h2>
        <span className="badge">{userRole ? userRole.toUpperCase() : 'USER'}</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.filter(item => item.role === userRole).map((item, idx) => (
          <button 
            key={idx}
            className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
            onClick={() => setActiveTab(item.tab)}
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
  );
};

export default Sidebar;
