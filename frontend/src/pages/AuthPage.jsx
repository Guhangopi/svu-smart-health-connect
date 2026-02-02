import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AuthPage.css";
import { API_BASE_URL } from "../config";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
  </svg>
);

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- GLOBAL STATE ---
  // Default to 'login', can be 'register'
  const [mode, setMode] = useState("login");

  // --- LOGIN LOGIC ---
  const [loginType, setLoginType] = useState("student");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- ACTIVATE (REGISTER) LOGIC ---
  const [activateStep, setActivateStep] = useState(1);
  const [verifyStudentId, setVerifyStudentId] = useState("");
  const [verifyPhone, setVerifyPhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [verifiedName, setVerifiedName] = useState("");

  // --- FORGOT PASSWORD LOGIC ---
  const [resetStep, setResetStep] = useState(1);
  const [resetStudentId, setResetStudentId] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetVerifiedName, setResetVerifiedName] = useState("");

  // --- UI STATE ---
  const [showPassword, setShowPassword] = useState(false);

  // --- FEEDBACK ---
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect if already logged in or check location state
  useEffect(() => {
    // Check for optional state passed (e.g., from "New Student?" link)
    if (location.state?.mode) {
      setMode(location.state.mode);
    } else if (location.pathname === "/activate") {
        setMode("register");
    }

    if (location.state?.loginType) {
        setLoginType(location.state.loginType);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Basic redirect logic (can be refined)
      if (user.role === "student") navigate("/patient-portal");
      else if (user.role === "doctor") navigate("/doctor-portal");
      else navigate("/admin"); // fallback
    }
  }, [navigate, location]);

  const toggleMode = (newMode) => {
    setMode(newMode);
    setError("");
    setMessage("");
    // Reset steps if switching
    if (newMode === "register") setActivateStep(1);
    if (newMode === "forgot") setResetStep(1);
    setShowPassword(false);
  };

  // --- HANDLERS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    setMessage("");

    try {
      let url = "";
      let payload = {};

      if (loginType === "student") {
        url = `${API_BASE_URL}/api/student/login`;
        payload = { studentId: loginStudentId, password: loginPassword };
      } else {
        url = `${API_BASE_URL}/api/staff/login`;
        payload = { email: staffEmail, password: loginPassword };
      }

      const response = await axios.post(url, payload);
      const user = response.data.user;
      const role = user.role;
      const title = location.state?.title; // "Doctor Login", "Staff Login"

      // --- STRICT ROLE VALIDATION ---
      if (title === "Doctor Login" && role !== "doctor") {
        setError("Access Denied: Please use the 'Staff Login' for your role.");
        return;
      }
      
      if (title === "Staff Login" && role === "doctor") {
         setError("Access Denied: Please use the 'Doctor Login' option.");
         return;
      }

      // If we are in "Staff Login", we essentially allow admin, pharmacist, lab_tech
      // but explicitly NOT 'student' (handled by endpoint) or 'doctor' (handled above).

      localStorage.setItem("user", JSON.stringify(user));
      
      // Role redirection
      if (role === "student") navigate("/patient-portal");
      else if (role === "doctor") navigate("/doctor-portal");
      else if (role === "pharmacist") navigate("/pharmacist-portal");
      else if (role === "admin") navigate("/admin");
      else if (role === "lab_tech") navigate("/lab-portal");
      else navigate("/");

    } catch (err) {
      console.error("LOGIN ERROR DETAILS:", {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
          fullError: err
      });
      setError(err.response?.data?.error || `Login failed (${err.response?.status || 'Network Error'}). Check console.`);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/verify`, {
        studentId: verifyStudentId, phone: verifyPhone
      });
      setVerifiedName(response.data.name);
      setActivateStep(2);
      setMessage(`Success! Verified as ${response.data.name}.`);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Details incorrect.");
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await axios.post(`${API_BASE_URL}/api/student/create-account`, {
        studentId: verifyStudentId, password: createPassword
      });
      setActivateStep(3); // Success state
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loginType === 'staff') {
        const confirm = window.confirm("Staff passwords must be reset by the Administrator. Contact IT Support at support@svu.edu");
        return;
    }
    toggleMode('forgot');
  };

  const handleResetVerify = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/verify-reset`, {
        studentId: resetStudentId, phone: resetPhone
      });
      setResetVerifiedName(response.data.name);
      setResetStep(2);
      setMessage(`Identity Verified! Resetting password for ${response.data.name}.`);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Details incorrect.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await axios.post(`${API_BASE_URL}/api/student/reset-password`, {
        studentId: resetStudentId, password: resetNewPassword
      });
      setResetStep(3); // Success state
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className={`auth-card-wrapper ${mode === 'register' ? 'show-register' : ''}`}>
        
        {/* --- LEFT SIDE: BRANDING (Visible on Desktop) --- */}
        <div className="auth-brand-side">
          <div className="overlay-gradient"></div>
          <div className="brand-content">
            <h1 className="display-4 fw-bold">Smart Health</h1>
            <p className="lead">Your wellness journey starts here.</p>
            <div className="mt-4">
              <span className="badge bg-white text-primary px-3 py-2 rounded-pill">Official SVU Portal</span>
            </div>
          </div>
        </div>

        {/* --- MOBILE BANNER (Visible only on Mobile) --- */}
        <div className="d-md-none bg-primary text-white p-4 text-center" style={{background: 'linear-gradient(135deg, #0ca678, #3b5bdb)'}}>
            <h1 className="h3 fw-bold mb-1">Smart Health</h1>
            <p className="small mb-0 opacity-75">Your wellness journey starts here.</p>
        </div>

        {/* --- RIGHT SIDE: FORMS --- */}
        <div className="auth-form-side">
          
          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">
              {mode === 'login' 
                ? (location.state?.title || location.state?.loginType 
                    ? (location.state?.title || (loginType === 'student' ? 'Student Login' : 'Staff Login')) 
                    : 'Welcome Back') 
                : 'Student Activation'}
            </h2>
            <p className="text-muted small">
              {mode === 'login' 
                ? 'Sign in to access your dashboard' 
                : (mode === 'register' ? 'Verify identity to create your account' : 'Reset your password')}
            </p>
          </div>

          {/* MESSAGES */}
          {error && <div className="alert alert-soft-danger text-center p-2 small">{error}</div>}
          {message && <div className="alert alert-soft-success text-center p-2 small">{message}</div>}

          {/* --- LOGIN FORM --- */}
          {mode === 'login' && (
            <div className="animate-fade-in">
              {/* Login Type Toggle - Only show if NO specific login type was passed */}
              {!location.state?.loginType && (
                <div className="d-flex p-1 bg-light rounded-pill mb-4 border">
                   <button 
                     type="button" 
                     onClick={() => setLoginType("student")}
                     className={`flex-fill btn btn-sm rounded-pill fw-bold ${loginType === 'student' ? 'btn-white shadow-sm text-primary' : 'text-muted'}`}
                   >
                     Student
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setLoginType("staff")}
                     className={`flex-fill btn btn-sm rounded-pill fw-bold ${loginType === 'staff' ? 'btn-white shadow-sm text-primary' : 'text-muted'}`}
                   >
                     Staff
                   </button>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {loginType === "student" ? (
                   <div className="mb-3">
                     <label className="form-label small fw-bold text-secondary">Student ID</label>
                     <input type="text" className="form-control" placeholder="1001" value={loginStudentId} onChange={e => setLoginStudentId(e.target.value)} required />
                   </div>
                ) : (
                   <div className="mb-3">
                     <label className="form-label small fw-bold text-secondary">Email Address</label>
                     <input type="email" className="form-control" placeholder="doctor@svu.edu" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} required />
                   </div>
                )}



                <div className="mb-4">
                   <label className="form-label small fw-bold text-secondary">Password</label>
                   <div className="input-group">
                     <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control" 
                        placeholder="••••••" 
                        value={loginPassword} 
                        onChange={e => setLoginPassword(e.target.value)} 
                        required 
                     />
                     <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)} style={{borderLeft: 'none', borderColor: '#ced4da'}}>
                        {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                     </button>
                   </div>
                   <div className="text-end mt-1">
                      <a href="#" className="small text-decoration-none text-muted" onClick={handleForgotPassword}>Forgot Password?</a>
                   </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm">
                   Sign In
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                {loginType === 'student' && (
                  <>
                    <p className="small text-muted mb-2">Don't have an account?</p>
                    <button onClick={() => toggleMode('register')} className="btn btn-primary w-100 py-2 rounded-3 fw-bold">
                      Activate Student Account
                    </button>
                  </>
                )}
                <div className="mt-3">
                    <Link to="/" className="text-decoration-none text-muted small fw-medium">← Back to Home</Link>
                </div>
              </div>
            </div>
          )}

          {/* --- REGISTER FORM --- */}
          {mode === 'register' && (
            <div className="animate-fade-in">
              
              {/* Progress Steps (Simple dots) */}
              {activateStep < 3 && (
                 <div className="d-flex justify-content-center gap-2 mb-4">
                    <div className={`step-dot ${activateStep >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${activateStep >= 2 ? 'active' : ''}`}></div>
                 </div>
              )}

              {activateStep === 1 && (
                <form onSubmit={handleVerify}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Student ID</label>
                    <input type="text" className="form-control" placeholder="1001" value={verifyStudentId} onChange={e => setVerifyStudentId(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">Registered Phone</label>
                    <input type="text" className="form-control" placeholder="9876543210" value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold">Verify Identity</button>
                </form>
              )}

              {activateStep === 2 && (
                <form onSubmit={handleCreateAccount}>
                   <div className="text-center mb-3">
                      <span className="badge bg-soft-success text-success">Verified: {verifiedName}</span>
                   </div>
                   <div className="mb-4">
                     <label className="form-label small fw-bold text-secondary">New Password</label>
                     <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="form-control" 
                            placeholder="Create a strong password" 
                            value={createPassword} 
                            onChange={e => setCreatePassword(e.target.value)} 
                            required 
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)} style={{borderLeft: 'none', borderColor: '#ced4da'}}>
                            {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                        </button>
                     </div>
                   </div>
                   <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-bold">Create Account</button>
                </form>
              )}

              {activateStep === 3 && (
                 <div className="text-center py-4">
                    <div className="mb-3 display-4 text-success">🎉</div>
                    <h4 className="fw-bold text-dark">Success!</h4>
                    <p className="text-muted small">Your account is ready.</p>
                    <button onClick={() => toggleMode('login')} className="btn btn-primary w-100 rounded-3">
                       Go into Login
                    </button>
                 </div>
              )}

              {activateStep < 3 && (
                <div className="text-center mt-4 pt-3 border-top">
                   <p className="small text-muted mb-2">Already have an account?</p>
                   <button onClick={() => navigate('/login', { state: { mode: 'login', loginType: 'student', title: 'Student Login' } })} className="btn btn-primary w-100 py-2 rounded-3 fw-bold">Sign In Here</button>
                </div>
              )}
              <div className="text-center mt-3">
                 <Link to="/" className="text-decoration-none text-muted small fw-medium">← Back to Home</Link>
              </div>
            </div>
          )}

          {/* --- FORGOT PASSWORD FORM --- */}
          {mode === 'forgot' && (
            <div className="animate-fade-in">
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                  {resetStep < 3 && <h5 className="text-primary">Help with your password</h5>}
              </div>

              {resetStep === 1 && (
                <form onSubmit={handleResetVerify}>
                   <div className="alert alert-soft-info p-2 small mb-3">
                      Enter your Student ID and registered phone number to verify it's you.
                   </div>
                   <div className="mb-3">
                     <label className="form-label small fw-bold text-secondary">Student ID</label>
                     <input type="text" className="form-control" placeholder="1001" value={resetStudentId} onChange={e => setResetStudentId(e.target.value)} required />
                   </div>
                   <div className="mb-4">
                     <label className="form-label small fw-bold text-secondary">Registered Phone</label>
                     <input type="text" className="form-control" placeholder="9876543210" value={resetPhone} onChange={e => setResetPhone(e.target.value)} required />
                   </div>
                   <div className="d-grid gap-2">
                       <button type="submit" className="btn btn-primary fw-bold">Verify Identity</button>
                       <button type="button" onClick={() => toggleMode('login')} className="btn btn-primary w-100 py-2 rounded-3 fw-bold">Back to Login</button>
                   </div>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleResetPassword}>
                   <div className="text-center mb-3">
                      <span className="badge bg-soft-success text-success">Verified: {resetVerifiedName}</span>
                   </div>
                   <div className="mb-4">
                     <label className="form-label small fw-bold text-secondary">New Password</label>
                     <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="form-control" 
                            placeholder="Type new password" 
                            value={resetNewPassword} 
                            onChange={e => setResetNewPassword(e.target.value)} 
                            required 
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)} style={{borderLeft: 'none', borderColor: '#ced4da'}}>
                            {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                        </button>
                     </div>
                   </div>
                   <button type="submit" className="btn btn-success w-100 py-2 rounded-3 fw-bold">Update Password</button>
                </form>
              )}

              {resetStep === 3 && (
                 <div className="text-center py-4">
                    <div className="mb-3 display-4 text-success">✅</div>
                    <h4 className="fw-bold text-dark">Password Updated!</h4>
                    <p className="text-muted small">You can now login with your new password.</p>
                    <button onClick={() => toggleMode('login')} className="btn btn-primary w-100 rounded-3">
                       Back to Login
                    </button>
                 </div>
              )}


            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AuthPage;
