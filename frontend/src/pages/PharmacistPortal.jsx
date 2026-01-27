import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../components/Sidebar";
import PrescriptionList from "../components/PrescriptionList";

function PharmacistPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for the Result
  const [searchId, setSearchId] = useState("");
  const [resultId, setResultId] = useState("");

  useEffect(() => {
    // 1. Get user and verify role
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
  }, [navigate]);

  const handleSearch = (e) => {
      e.preventDefault();
      if(!searchId.trim()) {
          toast.error("Please enter a Student ID");
          return;
      }
      // Just set the result ID to trigger the child component update
      setResultId(searchId);
      toast.info(`Searching for Student: ${searchId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
                   <h1 style={{margin: 0, fontSize: '1.8em'}}>Pharmacy</h1>
                   <p style={{margin: '5px 0 0', color: '#666'}}>Dispense Unit</p>
                </div>
                <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    👤 {user.name}
                </div>
            </div>

            <div className="content-box">
                <h3>Prescription Search</h3>
                <p>Enter a Student ID to view their active prescriptions.</p>
                
                <form onSubmit={handleSearch} style={{display: 'flex', gap: '10px', marginTop: '20px', maxWidth: '500px'}}>
                    <input 
                        type="text" 
                        placeholder="Enter Student ID (e.g., 1001)"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={{flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd'}}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            {resultId && (
                <div className="content-box" style={{marginTop: '20px'}}>
                    <div style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px'}}>
                        <h4 style={{margin: 0, color: '#0056b3'}}>Results for Student ID: {resultId}</h4>
                    </div>
                    <PrescriptionList key={resultId} studentId={resultId} />
                </div>
            )}
        </div>
    </div>
  );
}

export default PharmacistPortal;
