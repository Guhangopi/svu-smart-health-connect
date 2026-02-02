import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../components/Sidebar";
import PrescriptionList from "../components/PrescriptionList";
import MedicalRecordsList from "../components/MedicalRecordsList";
import CalendarView from "../components/CalendarView"; // Import CalendarView
import { API_BASE_URL } from "../config";


function PatientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('book');

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form States
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  
  // New State for Calendar
  const [unavailableDates, setUnavailableDates] = useState([]);
  


  // 1. LOAD USER & DATA
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetchDoctors();
    fetchHistory(parsedUser.studentId);
  }, [navigate]);

  // 2. FETCH HELPERS
  const fetchDoctors = () => {
    axios
      .get(`${API_BASE_URL}/api/doctors`)
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  };

  const fetchHistory = (studentId) => {
    axios
      .get(`${API_BASE_URL}/api/appointments/student/${studentId}`)
      .then((res) => setMyAppointments(res.data))
      .catch((err) => console.error(err));
  };

  // 3. FETCH UNAVAILABLE DATES & SLOTS
  // Fetch Unavailable Dates when Doctor Changes
  useEffect(() => {
    if (selectedDocId) {
        axios.get(`${API_BASE_URL}/api/doctor/unavailable/${selectedDocId}`)
            .then(res => setUnavailableDates(res.data))
            .catch(err => console.error("Error fetching unavailable dates:", err));
    } else {
        setUnavailableDates([]);
    }
    // Reset selection when doctor changes
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedTime("");
  }, [selectedDocId]);

  // Fetch Slots when Date is Selected
  useEffect(() => {
    if (selectedDocId && selectedDate) {
      axios
        .post(`${API_BASE_URL}/api/slots`, {
          doctorId: selectedDocId,
          date: selectedDate,
        })
        .then((res) => {
          setAvailableSlots(res.data);
          setSelectedTime(""); // Reset time selection when date changes
        })
        .catch((err) => console.error("Error fetching slots", err));
    }
  }, [selectedDocId, selectedDate]);



  const handleDateClick = (dateStr) => {
      setSelectedDate(dateStr);
  };

  // 4. HANDLE BOOKING
  const handleBook = async (e) => {
    e.preventDefault();

    if (!selectedDocId || !selectedDate || !selectedTime) {
      toast.error("Please select a doctor, date, and time slot.");
      return;
    }

    const doctorObj = doctors.find((d) => d.id === selectedDocId);

    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        studentId: user.studentId,
        studentName: user.name,
        doctorId: selectedDocId,
        doctorName: doctorObj.name,
        date: selectedDate,
        time: selectedTime,
        reason: reason,
      });

      toast.success("Appointment Booked Successfully!");

      // Reset Form
      setReason("");
      setSelectedTime("");
      setAvailableSlots([]); 
      setSelectedDate(""); // Also reset date
      fetchHistory(user.studentId);
      setActiveTab('history'); // Redirect to history tab

    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed.");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };


  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
        <Sidebar 
            userRole={user.role || 'student'} // Fallback for safety
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
        />

        <div className="main-content">
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <div>
                   <h1 style={{margin: 0, fontSize: '1.8em'}}>Student Health Portal</h1>
                   <p style={{margin: '5px 0 0', color: '#666'}}>ID: {user.studentId}</p>
                </div>
                <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    👤 {user.name}
                </div>
            </div>

            {/* --- BOOK APPOINTMENT TAB --- */}
            {activeTab === 'book' && (
                <div className="content-box">
                    <h3>📅 Book an Appointment</h3>
                    <form onSubmit={handleBook} style={{maxWidth: '900px', margin: '0 auto'}}>
                    
                    <div className="form-group">
                        <label>Select Doctor:</label>
                        <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        required
                        >
                        <option value="">-- Choose a Doctor --</option>
                        {doctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                            {doc.name} ({doc.specialization})
                            </option>
                        ))}
                        </select>
                    </div>

                    {selectedDocId && (
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginTop: '20px', flexWrap: 'wrap' }}>
                            {/* Left Side: Calendar */}
                            <div style={{ flex: '0 0 auto' }}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Select Date:</label>
                                <div style={{border: '1px solid #ddd', borderRadius: '12px', padding: '10px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                    <CalendarView 
                                        unavailableDates={unavailableDates}
                                        onDateClick={handleDateClick}
                                    />
                                    <p style={{textAlign: 'center', marginTop: '5px', fontSize: '0.85em', color: '#666'}}>
                                        Selected: <strong>{selectedDate || "None"}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Time Slots */}
                            {selectedDate && (
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Available Time Slots:</label>
                                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                        {unavailableDates.includes(selectedDate) ? (
                                            <p style={{ color: "#dc3545", fontWeight: 'bold', margin: 0 }}>Doctor is unavailable on this date.</p>
                                        ) : (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                    {availableSlots.length > 0 ? (
                                                    availableSlots.map((slot) => (
                                                        <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => setSelectedTime(slot)}
                                                        style={{
                                                            padding: '6px 12px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.85em', 
                                                            fontWeight: 'bold',
                                                            cursor: "pointer",
                                                            border: "none",
                                                            outline: "none",
                                                            transition: 'all 0.2s',
                                                            background: selectedTime === slot 
                                                                ? "linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))" 
                                                                : "white",
                                                            color: selectedTime === slot ? "#2563eb" : "#64748b",
                                                            border: selectedTime === slot ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid #e2e8f0",
                                                            boxShadow: selectedTime === slot ? '0 2px 5px rgba(59, 130, 246, 0.15)' : 'none'
                                                        }}
                                                        >
                                                        {slot}
                                                        </button>
                                                    ))
                                                    ) : (
                                                    <p style={{ color: "#666", margin: 0 }}>No slots available for this date.</p>
                                                    )}
                                                
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason for Visit:</label>
                        <input
                        type="text"
                        placeholder="e.g. High fever..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        />
                    </div>

                        <button 
                            type="submit" 
                            disabled={!selectedTime} 
                            style={{
                                width: '100%', 
                                marginTop: '25px',
                                padding: '12px',
                                fontSize: '1.1em',
                                fontWeight: 'bold',
                                backgroundColor: !selectedTime ? '#ccc' : '#28a745', // Bright Green
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                cursor: !selectedTime ? 'not-allowed' : 'pointer',
                                boxShadow: !selectedTime ? 'none' : '0 4px 10px rgba(40, 167, 69, 0.3)',
                                transition: 'all 0.2s',
                                opacity: 1
                            }}
                        >
                            Confirm Booking
                        </button>
                    </form>
                </div>
            )}


            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="content-box">
                    <h3>My Appointments</h3>
                    {myAppointments.length === 0 ? (
                    <p>No appointments found.</p>
                    ) : (
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date/Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAppointments.map((appt) => (
                                <tr key={appt._id}>
                                    <td><strong>{appt.doctorName}</strong></td>
                                    <td>{appt.date} <br/> <small>{appt.time}</small></td>
                                    <td>{appt.reason}</td>
                                    <td>
                                        <span className="badge" style={{
                                            backgroundColor: appt.status === 'Cancelled' ? '#f8d7da' : '#cff4fc',
                                            color: appt.status === 'Cancelled' ? '#842029' : '#055160',
                                            marginBottom: 0
                                        }}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td>
                                        {appt.status !== 'Cancelled' && (
                                            <button 
                                                className="btn-sm danger"
                                                onClick={() => {
                                                    if(window.confirm('Cancel this appointment?')) {
                                                        axios.post(`${API_BASE_URL}/api/appointments/cancel`, { appointmentId: appt._id })
                                                            .then(() => {
                                                                setMyAppointments(prev => prev.map(a => a._id === appt._id ? {...a, status: 'Cancelled'} : a));
                                                                toast.warn("Appointment Cancelled");
                                                            });
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </button>
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
            
            {/* --- PRESCRIPTIONS TAB --- */}
            {activeTab === 'prescriptions' && (
                <div className="content-box">
                    <h3>My Prescriptions</h3>
                    <PrescriptionList studentId={user.studentId} />
                </div>
            )}

            {/* --- MEDICAL RECORDS TAB --- */}
            {activeTab === 'records' && (
                <div className="content-box">
                    <h3>My Medical Records</h3>
                    <MedicalRecordsList studentId={user.studentId} />
                </div>
            )}
        </div>
    </div>
  );
}

export default PatientPortal;
