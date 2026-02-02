import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../components/Sidebar";
import { API_BASE_URL } from "../config";

function PharmacistPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard State
  const [stats, setStats] = useState({ pending: 0, dispensedToday: 0 });
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "pharmacist") {
      navigate("/");
      return;
    }
    setUser(parsedUser);

    // Fetch Stats & Queue
    fetchData();
  }, [navigate, refreshTrigger]);

  const fetchData = async () => {
      try {
          const statsRes = await axios.get(`${API_BASE_URL}/api/pharmacy/stats`);
          setStats(statsRes.data);

          const queueRes = await axios.get(`${API_BASE_URL}/api/pharmacy/queue`);
          setPendingPrescriptions(queueRes.data);
      } catch (err) {
          console.error("Error fetching pharmacy data:", err);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleDispense = async (id) => {
      if(!window.confirm("Mark this prescription as dispensed?")) return;
      try {
          await axios.post(`${API_BASE_URL}/api/pharmacy/dispense/${id}`);
          toast.success("Prescription Dispensed!");
          setRefreshTrigger(prev => prev + 1); // Refresh data
      } catch (err) {
          console.error(err);
          toast.error("Failed to dispense.");
      }
  };

  if (!user) return <div style={{padding: '20px'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
        <Sidebar 
            userRole="pharmacist" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
        />

        <div className="main-content">
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <div>
                   <h1 style={{margin: 0, fontSize: '1.8em'}}>Pharmacy Dashboard</h1>
                   <p style={{margin: '5px 0 0', color: '#666'}}>Welcome back, {user.name}</p>
                </div>
                <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    📅 {new Date().toDateString()}
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
                <div className="stat-card yellow">
                    <div style={{fontSize: '2.5em', marginRight: '20px'}}>💊</div>
                    <div>
                        <h2 style={{margin: 0, fontSize: '2em'}}>{stats.pending}</h2>
                        <p style={{margin: 0, color: '#666'}}>Pending Prescriptions</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div style={{fontSize: '2.5em', marginRight: '20px'}}>✅</div>
                    <div>
                        <h2 style={{margin: 0, fontSize: '2em'}}>{stats.dispensedToday}</h2>
                        <p style={{margin: 0, color: '#666'}}>Dispensed Today</p>
                    </div>
                </div>
            </div>

            {/* --- PENDING QUEUE --- */}
            <div className="content-box">
                <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                    Pending Orders Queue
                    <button onClick={() => setRefreshTrigger(prev => prev + 1)} style={{float: 'right', fontSize: '0.8em', padding: '5px 10px'}}>↻ Refresh</button>
                </h3>

                {pendingPrescriptions.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#999', padding: '30px'}}>No pending prescriptions. All caught up! 🎉</p>
                ) : (
                    <div className="grid-container">
                        {pendingPrescriptions.map(appt => (
                            <div key={appt._id} className="item-card">
                                <span style={{position: 'absolute', top: '10px', right: '10px', background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75em', fontWeight: 'bold'}}>
                                    ⏳ Pending
                                </span>
                                
                                <h4 style={{margin: '0 0 5px', color: '#0056b3'}}>{appt.studentName}</h4>
                                <p style={{margin: '0 0 10px', fontSize: '0.9em', color: '#666'}}>ID: {appt.studentId}</p>
                                
                                <div style={{background: '#f8f9fa', padding: '10px', borderRadius: '6px', marginBottom: '15px'}}>
                                    <p style={{margin: '0 0 5px', fontWeight: 'bold', fontSize: '0.9em'}}>Medications:</p>
                                    <ul style={{margin: 0, paddingLeft: '20px', fontSize: '0.9em'}}>
                                        {appt.medications.map((med, idx) => (
                                            <li key={idx}>
                                                <strong>{med.name}</strong> - {med.dosage} ({med.frequency}) x {med.duration}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <small style={{color: '#999'}}>Dr. {appt.doctorName}</small>
                                    <button 
                                        onClick={() => handleDispense(appt._id)}
                                        style={{
                                            background: '#28a745', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '8px 16px', 
                                            borderRadius: '20px', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(40,167,69,0.3)'
                                        }}
                                    >
                                        ✓ Dispense Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

export default PharmacistPortal;
