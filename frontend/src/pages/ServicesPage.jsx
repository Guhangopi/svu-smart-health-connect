import React from 'react';
import './HomePage.css';

function ServicesPage() {
  const services = [
    { icon: '🩺', title: 'General Consultation', desc: 'Expert diagnosis and treatment for common ailments by our resident doctors.' },
    { icon: '💊', title: 'Pharmacy', desc: 'Well-stocked pharmacy providing prescribed medicines to students and staff.' },
    { icon: '🧪', title: 'Laboratory Services', desc: 'On-site pathological lab for blood tests, X-rays, and basic diagnostics.' },
    { icon: '🚑', title: 'Emergency Care', desc: '24/7 ambulance service and emergency response for critical situations.' },
    { icon: '🧠', title: 'Mental Wellness', desc: 'Counseling and psychological support for stress, anxiety, and mental health.' },
    { icon: '💉', title: 'Vaccination Drives', desc: 'Regular immunization camps and flu shots for the campus community.' },
  ];

  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '40vh', background: 'linear-gradient(135deg, #059669, #047857)' }}>
        <div className="container text-center position-relative z-1">
          <span className="text-uppercase fw-bold text-light tracking-wider small mb-2 d-block opacity-75">Comprehensive Care</span>
          <h1 className="display-4 fw-bold text-white mb-3">Our Services</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '700px' }}>
             From routine checkups to emergency support, SVU Health Centre is here for you.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-5 bg-soft-gradient">
        <div className="container py-4">
          <div className="row g-4">
            {services.map((service, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="p-4 h-100 bg-white rounded-4 shadow-sm border-0 feature-hover-card" style={{ transition: 'all 0.3s ease' }}>
                  <div className="icon-box mb-4 text-white shadow-md rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '60px', height: '60px', fontSize: '2rem', background: 'var(--primary, #3b82f6)' }}>
                    {service.icon}
                  </div>
                  <h4 className="fw-bold text-dark">{service.title}</h4>
                  <p className="text-muted mt-2">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-white text-center">
        <div className="container">
          <h3 className="fw-bold mb-3">Need Medical Assistance?</h3>
          <p className="text-muted mb-4">Book an appointment online or visit us directly.</p>
          <button className="btn btn-primary btn-lg px-5 rounded-pill fw-bold shadow-sm" onClick={() => window.location.href='/login'}>
            Book Appointment
          </button>
        </div>
      </section>

        {/* Footer */}
      <footer className="bg-footer-gradient text-white py-5 mt-auto">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-4">
              <h3 className="h4 mb-3" style={{color: '#d4af37', fontWeight: 'bold'}}>SmartHealth Connect</h3>
              <p className="text-white-50">
                Official Healthcare Portal of Sri Venkateswara University. 
              </p>
            </div>
             <div className="col-lg-3 offset-lg-5">
               <h5 className="mb-4" style={{color: '#d4af37'}}>Contact Info</h5>
              <ul className="list-unstyled text-white-50">
                <li className="mb-3">SVU Campus, Tirupati</li>
                <li className="mb-3">+91 98765 43210</li>
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

export default ServicesPage;
