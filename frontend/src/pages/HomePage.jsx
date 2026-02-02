import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

// Using the Authenticity of the SVU Admin Block for trust
const HERO_IMAGE = "/svu_admin.jpg"; 

function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [doctors, setDoctors] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
      })
      .catch(err => console.error("Failed to load doctors", err));
  }, []);

  const handleDashboardClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const roleRoutes = {
      student: '/patient-portal',
      doctor: '/doctor-portal',
      pharmacist: '/pharmacist-portal',
      lab_tech: '/lab-portal',
      admin: '/admin'
    };
    if (roleRoutes[user.role]) {
      window.location.href = roleRoutes[user.role];
    }
  };

  return (
    <div className="home-container">
      


      {/* --- NAVBAR AREA (Simulated) --- */}


      {/* --- HERO SECTION (Professional Split) --- */}
      {/* --- HERO SECTION (Full Background) --- */}
      <section className="hero-section hero-background position-relative overflow-hidden d-flex align-items-start">
        <div className="overlay"></div>
        <div className="container-fluid px-lg-5 position-relative text-start d-flex flex-column justify-content-center h-100 pt-5 mt-5">
            
            <div className="animate-slide-right ps-lg-5 ms-lg-4">
              <span className="text-uppercase fw-bold tracking-wider small mb-2 d-block text-warning">
                Official University Portal
              </span>
              <h1 className="display-3 fw-bold mb-3 text-white">
                SVU Health Connect
              </h1>
              <p className="lead mb-4 text-white fw-bold" style={{maxWidth: '600px'}}>
                Secure and accessible healthcare services for students, faculty, and staff of Sri Venkateswara University.
              </p>

              <div className="mb-4 border-start border-4 border-warning ps-3">
                <p className="text-white mb-1" style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                    <strong className="text-warning text-uppercase me-2">OP Counter:</strong> 
                    7:45 AM - 10:45 AM & 4:00 PM - 6:00 PM
                </p>
                <p className="text-white mb-0" style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                    <strong className="text-warning text-uppercase me-2">Holidays:</strong> 
                    7:45 AM - 10:45 AM
                </p>
              </div>
              
              <div className="d-flex gap-3">
                <button onClick={handleDashboardClick} className="btn btn-outline-light btn-lg px-4 shadow-sm">
                  Book Appointment
                </button>
                <Link to="/activate" className="btn btn-outline-light btn-lg px-4">
                  New Student?
                </Link>
              </div>
            </div>

        </div>
      </section>

      {/* --- FEATURE GRID SECTION --- */}
      <section className="py-5 bg-soft-gradient">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-stretch">
            
            {/* Column 1: Health Profile */}
            <div className="col-lg-4 animate-slide-up">
              <div className="p-4 rounded-4 card-enhanced h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="badge bg-light text-primary mb-2">My Dashboard</span>
                    <h3 className="fw-bold text-dark mb-1">Health Profile</h3>
                    <p className="text-muted small mb-0">Track vitals & history.</p>
                  </div>
                  <div className="icon-box bg-light text-primary rounded-circle" style={{width: '50px', height: '50px'}}>
                    <span className="fs-4">🩺</span>
                  </div>
                </div>
                
                {/* Visual Graph */}
                <div className="my-3 flex-grow-1 d-flex align-items-end px-2" style={{height: '120px', borderBottom: '2px solid #f8f9fa'}}>
                   <div className="bg-primary opacity-25 rounded-top mx-1" style={{width: '20%', height: '40%'}}></div>
                   <div className="bg-primary opacity-50 rounded-top mx-1" style={{width: '20%', height: '60%'}}></div>
                   <div className="bg-primary rounded-top mx-1" style={{width: '20%', height: '80%'}}></div>
                   <div className="bg-primary opacity-75 rounded-top mx-1" style={{width: '20%', height: '50%'}}></div>
                </div>
                
                <button onClick={handleDashboardClick} className="btn btn-primary w-100 fw-bold text-white shadow-sm">
                  View Full Profile
                </button>
              </div>
            </div>

            {/* Column 2: Health Tips */}
            <div className="col-lg-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="p-4 rounded-4 card-enhanced h-100">
                <div className="d-flex align-items-center mb-4">
                  <span className="fs-4 me-2">💡</span>
                  <h5 className="fw-bold mb-0 text-dark">Daily Insights</h5>
                </div>
                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-success">
                    <small className="text-uppercase fw-bold text-success" style={{fontSize: '0.7rem'}}>Nutrition</small>
                    <div className="fw-medium text-dark mt-1">Hydrate well! 8 glasses/day.</div>
                  </div>
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-warning">
                    <small className="text-uppercase fw-bold text-warning" style={{fontSize: '0.7rem'}}>Wellness</small>
                    <div className="fw-medium text-dark mt-1">Take short breaks often.</div>
                  </div>
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-info">
                    <small className="text-uppercase fw-bold text-info" style={{fontSize: '0.7rem'}}>Activity</small>
                    <div className="fw-medium text-dark mt-1">Walk 30 mins for heart health.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Stacked Utilities */}
            <div className="col-lg-4 d-flex flex-column gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
              
              {/* Lab Reports */}
              <div className="p-4 rounded-4 card-enhanced flex-grow-1 d-flex align-items-center" onClick={handleDashboardClick} style={{cursor: 'pointer'}}>
                <div className="me-3">
                   <div className="icon-box bg-light text-secondary rounded-circle" style={{width: '50px', height: '50px'}}>🧪</div>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-1">Lab Reports</h5>
                  <p className="text-muted small mb-0">View diagnostics.</p>
                </div>
                <div className="ms-auto">
                   <span className="text-muted">➔</span>
                </div>
              </div>

              {/* Emergency */}
              <div className="p-4 bg-danger text-white rounded-4 shadow-lg flex-grow-1 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #ef4444, #b91c1c)', transition: 'transform 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div className="me-3">
                    <div className="icon-box bg-white text-danger rounded-circle shadow-sm" style={{width: '50px', height: '50px'}}>🚑</div>
                 </div>
                 <div>
                   <h5 className="fw-bold mb-1">Emergency</h5>
                   <p className="text-white-50 small mb-0">24/7 SOS Support</p>
                 </div>
                 <div className="ms-auto">
                    <span className="fw-bold">Call</span>
                 </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      {/* --- MEET OUR SPECIALISTS SECTION --- */}
      <section className="py-5 bg-soft-gradient position-relative">
         <div className="container py-4">
            <div className="d-flex justify-content-between align-items-end mb-5 animate-slide-up">
               <div>
                  <span className="text-uppercase text-secondary fw-bold small tracking-wider">Our Team</span>
                  <h2 className="fw-bold display-6 text-dark mt-2">Meet Our Specialists</h2>
               </div>
            </div>

            <div className="row g-4 justify-content-center">
               {doctors.length > 0 ? (
                 doctors.slice(0, 3).map((doctor, index) => (
                    <div key={doctor.id} className="col-md-4 animate-slide-up" style={{animationDelay: `${0.1 * (index + 1)}s`}}>
                        <div className="team-card bg-white rounded-4 overflow-hidden shadow-sm h-100 position-relative group">
                            <div className="team-img-wrapper overflow-hidden bg-light position-relative" style={{height: '240px'}}>
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&color=fff&size=200`} 
                                    alt={doctor.name} 
                                    className="w-100 h-100 object-fit-cover team-img-zoom" 
                                />
                                <div className="team-overlay d-flex align-items-center justify-content-center gap-3">
                                    <span className="social-mini-btn">📅</span>
                                    <span className="social-mini-btn">✉️</span>
                                </div>
                            </div>
                            <div className="p-4 border-top">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">{doctor.name}</h5>
                                        <span className="badge bg-green-light text-success rounded-pill px-3">{doctor.specialization}</span>
                                    </div>
                                </div>
                                <p className="text-muted small mb-4 line-clamp-2">Providing expert healthcare services to our students.</p>
                                <button onClick={handleDashboardClick} className="btn btn-filled-green w-100 rounded-pill py-2 text-uppercase fw-bold" style={{fontSize: '0.8rem'}}>
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                 ))
               ) : (
                 <div className="text-center text-muted">Loading specialists...</div>
               )}
            </div>
         </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section className="py-5 bg-soft-gradient position-relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="blob-decoration"></div>

        <div className="container py-4 position-relative">
          <div className="text-center mb-5 animate-slide-up">
            <span className="text-uppercase text-primary fw-bold small tracking-wider">Our Values</span>
            <h2 className="fw-bold display-6 text-dark mt-2">Why Choose SVU Health?</h2>
            <div className="mx-auto mt-3" style={{width: '60px', height: '4px', background: 'var(--primary)', borderRadius: '2px'}}></div>
          </div>
          
          <div className="row g-4 text-center">
             {/* Feature 1 */}
             <div className="col-md-6 col-lg-3 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="p-4 h-100 rounded-4 feature-hover-card bg-white shadow-sm border-0">
                   <div className="feature-icon-box mb-4 mx-auto text-white shadow-lg gradient-blue">
                     <span className="fs-3">🎓</span>
                   </div>
                   <h5 className="fw-bold text-dark">Campus Convenience</h5>
                   <p className="text-muted small mt-2">Located centrally within SVU campus for quick student access.</p>
                </div>
             </div>

             {/* Feature 2 */}
             <div className="col-md-6 col-lg-3 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="p-4 h-100 rounded-4 feature-hover-card bg-white shadow-sm border-0">
                   <div className="feature-icon-box mb-4 mx-auto text-white shadow-lg gradient-green">
                     <span className="fs-3">📱</span>
                   </div>
                   <h5 className="fw-bold text-dark">Digital Integration</h5>
                   <p className="text-muted small mt-2">Access your medical history and appointments on the go.</p>
                </div>
             </div>

             {/* Feature 3 */}
             <div className="col-md-6 col-lg-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="p-4 h-100 rounded-4 feature-hover-card bg-white shadow-sm border-0">
                   <div className="feature-icon-box mb-4 mx-auto text-white shadow-lg gradient-purple">
                     <span className="fs-3">👨‍⚕️</span>
                   </div>
                   <h5 className="fw-bold text-dark">Expert Care</h5>
                   <p className="text-muted small mt-2">Qualified professionals dedicated to student wellbeing.</p>
                </div>
             </div>

             {/* Feature 4 */}
             <div className="col-md-6 col-lg-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="p-4 h-100 rounded-4 feature-hover-card bg-white shadow-sm border-0">
                   <div className="feature-icon-box mb-4 mx-auto text-white shadow-lg gradient-orange">
                     <span className="fs-3">🤝</span>
                   </div>
                   <h5 className="fw-bold text-dark">Student-Centric</h5>
                   <p className="text-muted small mt-2">Tailored services with zero consultation fees for students.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-footer-gradient text-white py-5 mt-auto">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-4">
              <h3 className="h4 mb-3" style={{color: '#d4af37', fontWeight: 'bold'}}>SmartHealth Connect</h3>
              <p className="text-white-50">
                Official Healthcare Portal of Sri Venkateswara University. 
                Dedicated to the well-being of our future leaders.
              </p>
              <div className="d-flex gap-3 social-icons mt-4">
                <span className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4af37'}}>🐦</span>
                <span className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4af37'}}>📘</span>
                <span className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4af37'}}>📸</span>
              </div>
            </div>

            <div className="col-6 col-lg-2 offset-lg-1">
              <h5 className="mb-4" style={{color: '#d4af37'}}>User Links</h5>
              <ul className="list-unstyled text-white-50">
                <li className="mb-2"><Link to="/login" className="text-white-50 text-decoration-none hover-white">Staff Login</Link></li>
                <li className="mb-2"><Link to="/login" className="text-white-50 text-decoration-none hover-white">Student Login</Link></li>
                <li className="mb-2"><Link to="/activate" className="text-white-50 text-decoration-none hover-white">Register</Link></li>
              </ul>
            </div>

            <div className="col-6 col-lg-2">
              <h5 className="mb-4" style={{color: '#d4af37'}}>Services</h5>
              <ul className="list-unstyled text-white-50">
                <li className="mb-2">Emergency Care</li>
                <li className="mb-2">Pharmacy</li>
                <li className="mb-2">Lab Diagnostics</li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h5 className="mb-4" style={{color: '#d4af37'}}>Contact Info</h5>
              <ul className="list-unstyled text-white-50">
                <li className="mb-3 d-flex"><span className="me-3" style={{color: '#d4af37'}}>📍</span> SVU Campus, Tirupati</li>
                <li className="mb-3 d-flex"><span className="me-3" style={{color: '#d4af37'}}>📞</span> +91 98765 43210</li>
                <li className="mb-3 d-flex"><span className="me-3" style={{color: '#d4af37'}}>📧</span> helpdesk@svu.edu.in</li>
                <li className="mb-3 d-flex"><span className="me-3" style={{color: '#d4af37'}}>🕒</span> 7:45 AM - 10:45 AM & 4:00 PM - 6:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-4 text-center text-white-50 small" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
            © 2026 Sri Venkateswara University. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;
