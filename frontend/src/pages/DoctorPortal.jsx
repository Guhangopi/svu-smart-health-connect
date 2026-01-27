import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrescriptionForm from "../components/PrescriptionForm";
import CalendarView from "../components/CalendarView";
import Sidebar from "../components/Sidebar";
import MedicalRecordsList from "../components/MedicalRecordsList";

function DoctorPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // NEW STATE
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [daySlots, setDaySlots] = useState([]); // Available slots for selected date
  const [viewingRecordsStudentId, setViewingRecordsStudentId] = useState(null);

  useEffect(() => {
    // 1. Get user from storage
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // 2. Security Check
    if (parsedUser.role !== "doctor") {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    // 3. FETCH APPOINTMENTS FOR THIS DOCTOR
    axios
      .get(`http://127.0.0.1:5000/api/appointments/doctor/${parsedUser.id}`)
      .then((res) => {
        // Filter: Show only Today and Future appointments
        const today = new Date().toISOString().split('T')[0];
        const upcoming = res.data.filter(appt => appt.date >= today);
        setAppointments(upcoming);
      })
      .catch((err) => console.error("Error fetching schedule:", err));
      
    // 4. FETCH UNAVAILABLE DATES
    axios.get(`http://127.0.0.1:5000/api/doctor/unavailable/${parsedUser.id}`)
        .then(res => setUnavailableDates(res.data))
        .catch(err => console.error("Error fetching unavailable dates:", err));
        
  }, [navigate]);

  // Handle Date Click
  const handleDateClick = (dateStr) => {
      setSelectedDate(dateStr);
      
      // Fetch available slots for this date
      axios.post('http://127.0.0.1:5000/api/slots', {
          doctorId: user.id,
          date: dateStr
      }).then(res => {
          setDaySlots(res.data);
      }).catch(err => console.error("Error fetching slots:", err));
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };


  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
        <Sidebar 
            userRole="doctor" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
        />
        
        <div className="main-content">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <div>
                   <h1 style={{margin: 0, fontSize: '1.8em'}}>Doctor Dashboard</h1>
                   <p style={{margin: '5px 0 0', color: '#666'}}>Welcome back, Dr. {user.name}</p>
                </div>
                <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    📅 {new Date().toDateString()}
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <>
                {/* --- CALENDAR SECTION --- */}
                <div className="content-box">
                    <h3>Manage Availability & Schedule</h3>
                    <p style={{marginBottom: '10px', fontSize: '0.9em', color: '#666'}}>
                        Click on a date to view your schedule and available slots.
                    </p>
                    
                    <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
                        <div style={{flex: 1, minWidth: '350px'}}>
                             <CalendarView 
                                unavailableDates={unavailableDates} 
                                onDateClick={handleDateClick} 
                            />
                        </div>
                        
                        <div style={{flex: 1, minWidth: '300px'}}>
                             {selectedDate ? (
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                                    <h4 style={{marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '10px'}}>
                                        📅 {selectedDate}
                                    </h4>
                                    
                                    {unavailableDates.includes(selectedDate) ? (
                                        <div style={{padding: '15px', background: '#ffebee', borderRadius: '8px', color: '#c62828'}}>
                                            <strong>DO NOT BOOK</strong><br/>
                                            You are marked as OFF-DUTY.
                                        </div>
                                    ) : (
                                        <>
                                            <h5>Appointments:</h5>
                                            <ul style={{paddingLeft: '20px', marginBottom: '20px'}}>
                                                {appointments.filter(a => a.date === selectedDate).length > 0 ? (
                                                    appointments.filter(a => a.date === selectedDate).map(a => (
                                                        <li key={a._id} style={{marginBottom: '5px'}}>
                                                            <strong>{a.time}</strong> - {a.studentName}
                                                        </li>
                                                    ))
                                                ) : <li style={{color: '#999'}}>No appointments booked.</li>}
                                            </ul>
                                            
                                            <h5>Open Slots:</h5>
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                                {daySlots.length > 0 ? daySlots.map(slot => (
                                                    <span key={slot} style={{padding: '6px 12px', background: '#e3f2fd', color: '#1565c0', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold'}}>
                                                        {slot}
                                                    </span>
                                                )) : <span style={{color: '#999'}}>No slots available.</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', border: '2px dashed #eee', borderRadius: '12px'}}>
                                    Select a date to view details
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}

            {activeTab === 'patients' && (
                <div className="content-box">
                    <h3>My Appointment Schedule</h3>

                    {appointments.length === 0 ? (
                    <p>No appointments found.</p>
                    ) : (
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>Student Name</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {appointments.map((appt) => (
                                <tr key={appt._id}>
                                <td>
                                    {appt.date} <br/> <small>{appt.time}</small>
                                </td>
                                <td>
                                    {appt.studentName} <br />
                                    <small style={{ color: "#777" }}>ID: {appt.studentId}</small>
                                </td>
                                <td>{appt.reason}</td>
                                <td>
                                    <span 
                                        style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px',
                                            fontSize: '0.85em',
                                            backgroundColor: appt.status === 'Cancelled' ? '#f8d7da' : '#cff4fc',
                                            color: appt.status === 'Cancelled' ? '#842029' : '#055160',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {appt.status}
                                    </span>
                                </td>
                                <td>
                                    {appt.status !== 'Cancelled' && (
                                    <>
                                        <button 
                                            className="btn-sm"
                                            style={{ backgroundColor: '#17a2b8', marginRight: '5px' }}
                                            onClick={() => setViewingRecordsStudentId(appt.studentId)}
                                        >
                                            📂 Records
                                        </button>
                                        <button 
                                            className="btn-sm"
                                            style={{ backgroundColor: '#28a745' }}
                                            onClick={() => setSelectedAppointment(appt)}
                                        >
                                            Prescribe
                                        </button>
                                    </>
                                    )}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            )}

            {/* --- RECORDS MODAL --- */}
            {viewingRecordsStudentId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                            <h3 style={{margin: 0}}>Medical Records (ID: {viewingRecordsStudentId})</h3>
                            <button 
                                onClick={() => setViewingRecordsStudentId(null)} 
                                style={{
                                    background: '#f8d7da', 
                                    border: 'none', 
                                    color: '#721c24',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '1em',
                                    fontWeight: 'bold'
                                }}
                            >
                                Close ✕
                            </button>
                        </div>
                        <MedicalRecordsList studentId={viewingRecordsStudentId} />
                        
                        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                            <button 
                                onClick={() => setViewingRecordsStudentId(null)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '1em'
                                }}
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRESCRIPTION FORM POPUP/SECTION --- */}
            {selectedAppointment && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                        <h3 style={{margin: 0}}>Write Prescription</h3>
                        <button onClick={() => setSelectedAppointment(null)} style={{background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer'}}>×</button>
                    </div>
                    <PrescriptionForm 
                        studentId={selectedAppointment.studentId}
                        studentName={selectedAppointment.studentName}
                        doctorId={user.id}
                        doctorName={user.name}
                        onSuccess={() => {
                            toast.success("Prescription sent successfully!");
                            setSelectedAppointment(null);
                        }}
                        onCancel={() => setSelectedAppointment(null)}
                    />
                </div>
                </div>
            )}
        </div>
    </div>
  );
}

export default DoctorPortal;
