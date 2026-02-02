import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function LabTechnicianPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  
  // Dashboard State
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const [labOrders, setLabOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Upload State (for "Process" modal/view)
  const [processingOrder, setProcessingOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch Data on Load & Refresh
  useEffect(() => {
      fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
      try {
          const statsRes = await axios.get('/api/lab/stats');
          setStats(statsRes.data);

          const ordersRes = await axios.get('/api/lab/requests');
          // Filter for pending orders for the main list, or show all with status
          // The API returns all, sorted by status (Pending first).
          setLabOrders(ordersRes.data);
      } catch (err) {
          console.error("Error fetching lab data:", err);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleProcess = (order) => {
      setProcessingOrder(order);
      setActiveTab("upload"); // Switch to upload view/modal
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!processingOrder || !file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", processingOrder.studentId);
    formData.append("testName", processingOrder.testType);
    formData.append("remarks", remarks);
    formData.append("labTechId", user.id);
    formData.append("requestId", processingOrder._id); // Link to request

    try {
      setLoading(true);
      await axios.post("/api/lab/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report uploaded & Order Completed!");
      
      // Reset & Refresh
      setFile(null);
      setRemarks("");
      setProcessingOrder(null);
      setActiveTab("dashboard");
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload report.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar
        userRole="lab_tech"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
             <div>
                <h1 style={{margin: 0, fontSize: '1.8em'}}>Lab Technician Dashboard</h1>
                <p style={{margin: '5px 0 0', color: '#666'}}>Welcome back, {user.name}</p>
             </div>
             <div style={{background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                 📅 {new Date().toDateString()}
             </div>
         </div>

        {activeTab === 'dashboard' && (
            <>
                {/* --- STATS CARDS --- */}
                <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
                    <div className="stat-card yellow">
                        <div style={{fontSize: '2.5em', marginRight: '20px'}}>🧪</div>
                        <div>
                            <h2 style={{margin: 0, fontSize: '2em'}}>{stats.pending}</h2>
                            <p style={{margin: 0, color: '#666'}}>Pending Tests</p>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <div style={{fontSize: '2.5em', marginRight: '20px'}}>📉</div>
                        <div>
                            <h2 style={{margin: 0, fontSize: '2em'}}>{stats.completed}</h2>
                            <p style={{margin: 0, color: '#666'}}>Completed Tests</p>
                        </div>
                    </div>
                </div>

                {/* --- LAB ORDERS LIST --- */}
                <div className="content-box">
                    <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                        Lab Orders
                        <button onClick={() => setRefreshTrigger(prev => prev + 1)} style={{float: 'right', fontSize: '0.8em', padding: '5px 10px'}}>↻ Refresh</button>
                    </h3>

                    {labOrders.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#999', padding: '30px'}}>No active lab orders.</p>
                    ) : (
                        <div className="table-container">
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Test Type</th>
                                        <th>Ordered By</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>
                                                <strong>{order.studentName}</strong><br/>
                                                <small style={{color: '#999'}}>{order.studentId}</small>
                                            </td>
                                            <td>{order.testType}</td>
                                            <td>Dr. {order.doctorName}</td>
                                            <td>{order.date}</td>
                                            <td>
                                                <span className={`badge ${order.status === 'Pending' ? 'badge-warning' : 'badge-success'}`} 
                                                      style={{background: order.status === 'Pending' ? '#fff3cd' : '#d4edda', color: order.status === 'Pending' ? '#856404' : '#155724'}}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                {order.status === 'Pending' ? (
                                                    <button 
                                                        className="btn-sm" 
                                                        style={{background: '#007bff'}}
                                                        onClick={() => handleProcess(order)}
                                                    >
                                                        Process Now
                                                    </button>
                                                ) : (
                                                    <span style={{color: '#28a745', fontWeight: 'bold'}}>✔ Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </>
        )}

        {/* --- UPLOAD FORM (PROCESS MODE) --- */}
        {activeTab === "upload" && processingOrder && (
          <div className="content-box" style={{ maxWidth: "800px", margin: '0 auto' }}>
            <button onClick={() => { setActiveTab('dashboard'); setProcessingOrder(null); }} style={{marginBottom: '20px', background: 'none', color: '#666', padding: 0, boxShadow: 'none'}}>← Back to Dashboard</button>
            
            <h2 style={{marginBottom: '20px', color: '#0056b3'}}>Upload Report for {processingOrder.studentName}</h2>
            
            <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div><strong>Student ID:</strong> {processingOrder.studentId}</div>
                <div><strong>Test Type:</strong> {processingOrder.testType}</div>
                <div><strong>Doctor:</strong> {processingOrder.doctorName}</div>
                <div><strong>Order Date:</strong> {processingOrder.date}</div>
                <div style={{gridColumn: '1 / -1'}}><strong>Clinical Notes:</strong> {processingOrder.notes || 'None'}</div>
            </div>

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Select Report File (PDF/Image)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                  style={{ padding: '10px' }}
                />
              </div>

              <div className="form-group">
                <label>Technician Remarks (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Results summary or notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px', background: '#28a745' }}>
                {loading ? "Uploading..." : "✅ Upload & Complete Order"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default LabTechnicianPortal;


