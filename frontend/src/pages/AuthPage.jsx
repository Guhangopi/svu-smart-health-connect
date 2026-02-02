import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";

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
        url = "/api/student/login";
        payload = { studentId: loginStudentId, password: loginPassword };
      } else {
        url = "/api/staff/login";
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
      const response = await axios.post("/api/student/verify", {
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
      await axios.post("/api/student/create-account", {
        studentId: verifyStudentId, password: createPassword
      });
      setActivateStep(3); // Success state
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account.");
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
                : 'Verify identity to create your account'}
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
                   <input type="password" className="form-control" placeholder="••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm">
                   Sign In
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                {loginType === 'student' && (
                  <>
                    <p className="small text-muted mb-0">Don't have an account?</p>
                    <button onClick={() => toggleMode('register')} className="btn btn-auth-action w-100 mt-2 py-2 rounded-3 fw-bold">
                      Activate Student Account
                    </button>
                  </>
                )}
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
                     <input type="password" className="form-control" placeholder="Create a strong password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} required />
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
                   <p className="small text-muted mb-0">Already have an account?</p>
                   <button onClick={() => toggleMode('login')} className="btn btn-auth-action w-100 mt-2 py-2 rounded-3 fw-bold">
                     Back to Sign In
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
