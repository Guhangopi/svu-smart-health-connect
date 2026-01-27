import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import PatientPortal from "./pages/PatientPortal";
import DoctorPortal from "./pages/DoctorPortal";
import PharmacistPortal from "./pages/PharmacistPortal";
import AdminPortal from "./pages/AdminPortal";
import LabTechnicianPortal from "./pages/LabTechnicianPortal";

function App() {
  return (
    <div>
      {/* The Navbar will always be visible */}
      <Navbar />

      {/* The main content area */}
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/activate" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="/doctor-portal" element={<DoctorPortal />} />
          <Route path="/pharmacist-portal" element={<PharmacistPortal />} />
          <Route path="/lab-portal" element={<LabTechnicianPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
