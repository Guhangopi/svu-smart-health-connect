import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CalendarView from "../components/CalendarView";
import "../styles/AdminPortal.css";
import Sidebar from "../components/Sidebar";
import { API_BASE_URL } from "../config";

function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hub");
  const [stats, setStats] = useState({ total_users: 0, pending_bookings: 0, total_doctors: 0 });
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Student Management State
  const [students, setStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ studentId: "", name: "", phone: "" });
  const [fileToUpload, setFileToUpload] = useState(null);

  // Staff Management State
  const [staff, setStaff] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "pharmacist" });
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    morningStart: "09:00",
    morningEnd: "13:00",
    eveningStart: "17:00",
    eveningEnd: "21:00",
    specialization: "General"
  });

  const [editingDoctor, setEditingDoctor] = useState(null);
  
  // Calendar Management State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDoctor, setCalendarDoctor] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDoctors();
    fetchAppointments();
    fetchStudents();
    fetchStaff();
    fetchStats();
  }, [navigate]);

  const fetchStats = () => {
    axios.get(`${API_BASE_URL}/api/admin/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  };

  const fetchStudents = () => {
    axios.get(`${API_BASE_URL}/api/admin/university-students`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  };

  const fetchStaff = () => {
    axios.get(`${API_BASE_URL}/api/admin/staff`)
      .then((res) => setStaff(res.data))
      .catch((err) => console.error(err));
  };

  const fetchDoctors = () => {
    axios.get(`${API_BASE_URL}/api/admin/doctors`)
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  };

  const fetchAppointments = () => {
    axios.get(`${API_BASE_URL}/api/admin/appointments`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  };

  const handleCreateDoctor = () => {
    axios.post(`${API_BASE_URL}/api/admin/doctors`, formData)
      .then(() => {
        toast.success("Doctor Created Successfully!");
        setShowAddModal(false);
        fetchDoctors();
        setFormData({ name: "", email: "", password: "", morningStart: "09:00", morningEnd: "13:00", eveningStart: "17:00", eveningEnd: "21:00", specialization: "General" });
      })
      .catch((err) => toast.error(err.response?.data?.error || "Error creating doctor"));
  };

  const handleUpdateDoctor = () => {
    axios.put(`${API_BASE_URL}/api/admin/doctor/${editingDoctor.id}`, formData)
      .then(() => {
        toast.info("Doctor details updated.");
        setShowEditModal(false);
        fetchDoctors();
        setEditingDoctor(null);
      })
      .catch((err) => toast.error("Error updating doctor"));
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm("Are you sure you want to remove this doctor?")) {
      axios.delete(`${API_BASE_URL}/api/admin/doctor/${id}`)
        .then(() => {
            fetchDoctors();
            toast.warn("Doctor removed.");
        })
        .catch((err) => toast.error("Error deleting doctor"));
    }
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this appointment?")) {
        axios.delete(`${API_BASE_URL}/api/admin/appointment/${id}`)
            .then(() => {
                fetchAppointments();
                toast.success("Appointment deleted.");
            })
            .catch((err) => toast.error("Error deleting appointment"));
    }
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      email: doc.email,
      password: "", // Don't show password
      morningStart: doc.morningStart,
      morningEnd: doc.morningEnd,
      eveningStart: doc.eveningStart,
      eveningEnd: doc.eveningEnd,
      specialization: doc.specialization
    });
    setShowEditModal(true);
  };

  // --- STUDENT LOGIC ---
  const handleAddStudent = () => {
      axios.post(`${API_BASE_URL}/api/admin/university-students`, studentForm)
        .then(() => {
            toast.success("Student Added!");
            setShowStudentModal(false);
            fetchStudents();
            setStudentForm({ studentId: "", name: "", phone: "" });
        })
        .catch((err) => toast.error(err.response?.data?.error || "Error adding student"));
  };

  const handleDeleteStudent = (id) => {
      if (window.confirm("Delete this student record?")) {
          axios.delete(`${API_BASE_URL}/api/admin/university-students/${id}`)
           .then(() => {
               toast.success("Student Removed");
               fetchStudents();
           })
           .catch(() => toast.error("Error removing student"));
      }
  };

  const handleUploadCSV = () => {
      if (!fileToUpload) return toast.warning("Please select a file first.");
      
      const formData = new FormData();
      formData.append('file', fileToUpload);

      axios.post(`${API_BASE_URL}/api/admin/university-students/upload`, formData)
        .then((res) => {
            toast.success(res.data.message);
            if (res.data.errors.length > 0) {
                console.warn("Upload warnings:", res.data.errors);
                toast.warning(`Check console for ${res.data.errors.length} skipped rows.`);
            }
            setShowUploadModal(false);
            fetchStudents();
            setFileToUpload(null);
        })
        .catch((err) => toast.error("Upload failed. Ensure CSV format is correct."));
  };

  // --- STAFF MANAGEMENT LOGIC ---
  const handleCreateStaff = () => {
      axios.post(`${API_BASE_URL}/api/admin/staff`, staffForm)
        .then(() => {
            toast.success("Staff member added!");
            setShowAddStaffModal(false);
            fetchStaff();
            setStaffForm({ name: "", email: "", password: "", role: "pharmacist" });
        })
        .catch((err) => toast.error(err.response?.data?.error || "Error adding staff"));
  };

  const handleUpdateStaff = () => {
      axios.put(`${API_BASE_URL}/api/admin/staff/${editingStaff.id}`, staffForm)
        .then(() => {
            toast.info("Staff details updated.");
            setShowEditStaffModal(false);
            fetchStaff();
            setEditingStaff(null);
        })
        .catch(() => toast.error("Error updating staff"));
  };

  const handleDeleteStaff = (id) => {
      if (window.confirm("Remove this staff member?")) {
          axios.delete(`${API_BASE_URL}/api/admin/staff/${id}`)
            .then(() => {
                toast.warn("Staff member removed.");
                fetchStaff();
            })
            .catch(() => toast.error("Error removing staff"));
      }
  };

  const openEditStaffModal = (staffMember) => {
      setEditingStaff(staffMember);
      setStaffForm({
          name: staffMember.name,
          email: staffMember.email,
          password: "", // Leave blank
          role: staffMember.role
      });
      setShowEditStaffModal(true);
  };

  // --- CALENDAR LOGIC ---
  const openCalendarModal = (doc) => {
      setCalendarDoctor(doc);
      // Fetch unavailable dates for this doctor
      axios.get(`${API_BASE_URL}/api/doctor/unavailable/${doc.id}`)
        .then(res => setUnavailableDates(res.data))
        .catch(err => console.error(err));
      setShowCalendarModal(true);
  };

  const toggleUnavailable = (dateStr) => {
      if (!calendarDoctor) return;
      
      axios.post(`${API_BASE_URL}/api/doctor/unavailable`, {
          doctorId: calendarDoctor.id,
          date: dateStr
      }).then(res => {
          if (res.data.action === 'added') {
              setUnavailableDates([...unavailableDates, dateStr]);
              toast.info(`Marked unavailable: ${dateStr}`);
          } else {
              setUnavailableDates(unavailableDates.filter(d => d !== dateStr));
              toast.success(`Marked available: ${dateStr}`);
          }
      });
  };

  const modalStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
  };

  const modalContentStyle = {
    backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };
    
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
        <Sidebar 
            userRole="admin" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
        />
        
        <div className="main-content">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <h1 style={{margin: 0, fontSize: '1.8em'}}>Dashboard Overview</h1>
                <div style={{display: 'flex', gap: '15px'}}>
                     {/* Placeholder for top bar stats or profile info */}
                    <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                        📅 {new Date().toDateString()}
                    </div>
                </div>
            </div>

            {activeTab === "hub" && (
                <div style={{animation: 'fadeIn 0.5s'}}>
                    <div style={{marginBottom: '30px'}}>
                        <h2 style={{fontSize: '2em', marginBottom: '10px'}}>Dashboard</h2>
                        <p style={{color: '#666'}}>Welcome back, SVU! Here's what's happening today.</p>
                    </div>



                    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                        {/* TOTAL USERS CARD */}
                        <div className="dashboard-card" style={{
                            flex: 1, minWidth: '280px', background: 'white', padding: '25px', 
                            borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px',
                            cursor: 'default'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div style={{
                                    background: '#f3e8ff', width: '50px', height: '50px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em',
                                    color: '#6b21a8'
                                }}>👥</div>
                                <span style={{fontSize: '3em', fontWeight: '800', color: '#1f2937'}}>{stats.total_users}</span>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 10px 0', color: '#6b7280', fontSize: '0.9em', letterSpacing: '1px', textTransform: 'uppercase'}}>Total Users</h4>
                                <span 
                                    className="view-details-link"
                                    style={{color: '#0d6efd', fontSize: '0.95em', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}
                                    onClick={() => setActiveTab('students')}
                                >
                                    View Students &rarr;
                                </span>
                            </div>
                        </div>

                        {/* PENDING APPOINTMENTS CARD */}
                        <div className="dashboard-card" style={{
                            flex: 1, minWidth: '280px', background: 'white', padding: '25px', 
                            borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div style={{
                                    background: '#fff7ed', width: '50px', height: '50px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em',
                                    color: '#ea580c'
                                }}>🕒</div>
                                <span style={{fontSize: '3em', fontWeight: '800', color: '#1f2937'}}>{stats.pending_bookings}</span>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 10px 0', color: '#6b7280', fontSize: '0.9em', letterSpacing: '1px', textTransform: 'uppercase'}}>Pending Appointments</h4>
                                <span 
                                    className="view-details-link"
                                    style={{color: '#0d6efd', fontSize: '0.95em', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}
                                    onClick={() => setActiveTab('appointments')}
                                >
                                    Resolve Now &rarr;
                                </span>
                            </div>
                        </div>

                        {/* TOTAL DOCTORS CARD */}
                        <div className="dashboard-card" style={{
                            flex: 1, minWidth: '280px', background: 'white', padding: '25px', 
                            borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div style={{
                                    background: '#eff6ff', width: '50px', height: '50px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em',
                                    color: '#2563eb'
                                }}>🩺</div>
                                <span style={{fontSize: '3em', fontWeight: '800', color: '#1f2937'}}>{stats.total_doctors}</span>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 10px 0', color: '#6b7280', fontSize: '0.9em', letterSpacing: '1px', textTransform: 'uppercase'}}>Total Doctors</h4>
                                <span 
                                    className="view-details-link"
                                    style={{color: '#0d6efd', fontSize: '0.95em', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}
                                    onClick={() => setActiveTab('doctors')}
                                >
                                    View Doctors &rarr;
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "doctors" && (
                <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>My Medical Staff</h2>
                    <button onClick={() => setShowAddModal(true)}>+ Add New Doctor</button>
                </div>

                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Hours</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {doctors.map((doc) => (
                            <tr key={doc.id}>
                            <td>
                                <strong>{doc.name}</strong><br/>
                                <small style={{color: '#666'}}>{doc.email}</small>
                            </td>
                            <td>{doc.specialization}</td>
                            <td>
                                <div style={{fontSize: '0.85em', color: '#555'}}>
                                <span style={{ display: 'block' }}>🌅 {doc.morningStart} - {doc.morningEnd}</span>
                                <span style={{ display: 'block' }}>🌇 {doc.eveningStart} - {doc.eveningEnd}</span>
                                </div>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="btn-compact btn-edit"
                                        onClick={() => openEditModal(doc)} 
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-compact danger"
                                        onClick={() => handleDeleteDoctor(doc.id)}
                                    >
                                        Remove
                                    </button>
                                    <button 
                                        className="btn-compact btn-info"
                                        onClick={() => openCalendarModal(doc)}
                                    >
                                        Manage Leave
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

            {activeTab === "appointments" && (
                <div className="content-box">
                <h2>Master Appointment Schedule</h2>
                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>Doctor</th>
                            <th>Student</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {appointments.map((appt) => (
                            <tr key={appt._id}>
                            <td>{appt.date} <br/> <small>{appt.time}</small></td>
                            <td>{appt.doctorName}</td>
                            <td>{appt.studentName}</td>
                            <td>
                                <span 
                                    style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        fontSize: '0.85em',
                                        backgroundColor: appt.status === 'Cancelled' ? '#f8d7da' : '#d1e7dd',
                                        color: appt.status === 'Cancelled' ? '#842029' : '#0f5132',
                                        fontWeight: '600'
                                    }}
                                >
                                    {appt.status}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="btn-compact danger"
                                        onClick={() => handleDeleteAppointment(appt._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

            {activeTab === "students" && (
                <div className="content-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>University Student Data</h2>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button className="secondary" onClick={() => setShowUploadModal(true)}>📂 Upload CSV</button>
                            <button onClick={() => setShowStudentModal(true)}>+ Add Student</button>
                        </div>
                    </div>
    
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Phone (Auth)</th>
                                <th>Added At</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map((stu) => (
                                <tr key={stu._id}>
                                <td><strong>{stu.studentId}</strong></td>
                                <td>{stu.name}</td>
                                <td>{stu.registeredPhone}</td>
                                <td>{stu.addedAt ? new Date(stu.addedAt).toLocaleDateString() : '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-compact danger"
                                            onClick={() => handleDeleteStudent(stu.studentId)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                                        No students found. Upload a CSV or add manually.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "staff" && (
                <div className="content-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Manage Support Staff</h2>
                        <button onClick={() => setShowAddStaffModal(true)}>+ Add New Staff</button>
                    </div>
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {staff.map((s) => (
                                <tr key={s.id}>
                                <td><strong>{s.name}</strong></td>
                                <td>{s.email}</td>
                                <td>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: '600',
                                        backgroundColor: '#e7f1ff', color: '#0d6efd'
                                    }}>
                                        {s.role.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-compact btn-edit" onClick={() => openEditStaffModal(s)}>Edit</button>
                                        <button className="btn-compact danger" onClick={() => handleDeleteStaff(s.id)}>Remove</button>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No staff members found.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADD DOCTOR MODAL */}
            {showAddModal && (
                <div style={modalStyle}>
                <div style={modalContentStyle}>
                    <h3>Add New Doctor</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Specialization</label>
                        <input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>🌅 Morning Start</label>
                            <input type="time" value={formData.morningStart} onChange={e => setFormData({...formData, morningStart: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>End</label>
                            <input type="time" value={formData.morningEnd} onChange={e => setFormData({...formData, morningEnd: e.target.value})} />
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>🌇 Evening Start</label>
                            <input type="time" value={formData.eveningStart} onChange={e => setFormData({...formData, eveningStart: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>End</label>
                            <input type="time" value={formData.eveningEnd} onChange={e => setFormData({...formData, eveningEnd: e.target.value})} />
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                        <button className="secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button onClick={handleCreateDoctor}>Create Doctor</button>
                    </div>
                </div>
                </div>
            )}

            {/* EDIT DOCTOR MODAL */}
            {showEditModal && (
                <div style={modalStyle}>
                <div style={modalContentStyle}>
                    <h3>Edit Doctor</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Specialization</label>
                        <input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>🌅 Morning Start</label>
                            <input type="time" value={formData.morningStart} onChange={e => setFormData({...formData, morningStart: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>End</label>
                            <input type="time" value={formData.morningEnd} onChange={e => setFormData({...formData, morningEnd: e.target.value})} />
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>🌇 Evening Start</label>
                            <input type="time" value={formData.eveningStart} onChange={e => setFormData({...formData, eveningStart: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>End</label>
                            <input type="time" value={formData.eveningEnd} onChange={e => setFormData({...formData, eveningEnd: e.target.value})} />
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                        <button className="secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button onClick={handleUpdateDoctor}>Save Changes</button>
                    </div>
                </div>
                </div>
            )}

            {/* MANAGE CALENDAR MODAL */}
            {showCalendarModal && calendarDoctor && (
                <div style={modalStyle}>
                <div style={{...modalContentStyle, width: '600px'}}>
                    <h3>Manage Leave: {calendarDoctor.name}</h3>
                    <p style={{fontSize: '0.9em', color: '#666'}}>Click a date to toggle unavailability (Red = Off-Duty).</p>
                    
                    <CalendarView 
                        unavailableDates={unavailableDates}
                        onDateClick={(date) => toggleUnavailable(date)}
                    />
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '15px'}}>
                        <button onClick={() => setShowCalendarModal(false)}>Close</button>
                    </div>
                </div>
                </div>
            )}

            {/* ADD STUDENT MODAL */}
            {showStudentModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Add New Student</h3>
                        <div className="form-group">
                            <label>Student ID</label>
                            <input value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} placeholder="Matches verification phone" />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                            <button className="secondary" onClick={() => setShowStudentModal(false)}>Cancel</button>
                            <button onClick={handleAddStudent}>Add Student</button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPLOAD CSV MODAL */}
            {showUploadModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Upload Student Data (CSV)</h3>
                        <p>File must have headers: <code>studentId,name,phone</code></p>
                        <input type="file" accept=".csv" onChange={e => setFileToUpload(e.target.files[0])} />
                        
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                            <button className="secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            <button onClick={handleUploadCSV}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ADD STAFF MODAL */}
            {showAddStaffModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Add New Staff Member</h3>
                        <div className="form-group">
                            <label>Name</label>
                            <input value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select 
                                value={staffForm.role} 
                                onChange={e => setStaffForm({...staffForm, role: e.target.value})}
                                style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                            >
                                <option value="pharmacist">Pharmacist</option>
                                <option value="lab_tech">Lab Technician</option>
                                <option value="nurse">Nurse</option>
                                <option value="receptionist">Receptionist</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                            <button className="secondary" onClick={() => setShowAddStaffModal(false)}>Cancel</button>
                            <button onClick={handleCreateStaff}>Create Staff</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT STAFF MODAL */}
            {showEditStaffModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Edit Staff Member</h3>
                        <div className="form-group">
                            <label>Name</label>
                            <input value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select 
                                value={staffForm.role} 
                                onChange={e => setStaffForm({...staffForm, role: e.target.value})}
                                style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                            >
                                <option value="pharmacist">Pharmacist</option>
                                <option value="lab_tech">Lab Technician</option>
                                <option value="nurse">Nurse</option>
                                <option value="receptionist">Receptionist</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                            <button className="secondary" onClick={() => setShowEditStaffModal(false)}>Cancel</button>
                            <button onClick={handleUpdateStaff}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
    </div>
  );
}

export default AdminPortal;
