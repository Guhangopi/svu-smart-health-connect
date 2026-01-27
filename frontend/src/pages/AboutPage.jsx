import React from 'react';
import './HomePage.css'; // Reusing Home styles for consistency

function AboutPage() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '40vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
        <div className="container text-center position-relative z-1">
          <span className="text-uppercase fw-bold text-warning tracking-wider small mb-2 d-block">Who We Are</span>
          <h1 className="display-4 fw-bold text-white mb-3">About SVU Health Centre</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '700px' }}>
            Serving the Sri Venkateswara University community with dedication, compassion, and advanced healthcare solutions.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <img 
                src="/svu_health_centre_actual.png" 
                alt="SVU Health Centre Building" 
                className="img-fluid rounded-4 shadow-lg"
                onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=SVU+Health+Centre'}}
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold text-dark mb-4">Our Mission</h2>
              <p className="text-muted mb-4">
                Our mission is to provide accessible, high-quality, and holistic healthcare services to the students, faculty, and staff of Sri Venkateswara University. We strive to create a healthy campus environment that supports academic excellence and personal well-being.
              </p>
              
              <h3 className="h5 fw-bold text-dark mb-3">Core Values</h3>
              <ul className="list-unstyled">
                <li className="d-flex align-items-center mb-3">
                  <div className="icon-box bg-light text-primary rounded-circle me-3" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
                  <span className="text-dark">Student-First Approach</span>
                </li>
                <li className="d-flex align-items-center mb-3">
                  <div className="icon-box bg-light text-primary rounded-circle me-3" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
                  <span className="text-dark">Confidentiality & Integrity</span>
                </li>
                <li className="d-flex align-items-center mb-3">
                  <div className="icon-box bg-light text-primary rounded-circle me-3" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
                  <span className="text-dark">Preventive Care Focus</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/History */}
      <section className="py-5 bg-soft-gradient">
        <div className="container py-4">
          <div className="row text-center">
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="display-4 fw-bold text-primary mb-2">50+</div>
              <p className="text-muted">Years of Service</p>
            </div>
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="display-4 fw-bold text-primary mb-2">10k+</div>
              <p className="text-muted">Students Served</p>
            </div>
            <div className="col-md-4">
              <div className="display-4 fw-bold text-primary mb-2">24/7</div>
              <p className="text-muted">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>
      
       {/* Footer is handled by main layout, but adding a spacer or small CTA if strictly needed inside page wrapper. 
           However, existing HomePage includes footer. We should create a shared Footer component or import it. 
           For now, I'll copy the Footer structure or assume App.jsx doesn't wrap it.
           Looking at App.jsx, the footer is NOT in App.jsx, it's inside HomePage.jsx.
           So I need to duplicate the footer here or refactor.
           Refactoring is better, but to keep it simple and strictly follow "Add Pages" task without breaking existing structure too much, I will add the footer here too.
       */}
      <footer className="bg-footer-gradient text-white py-5 mt-auto">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-4">
              <h3 className="h4 mb-3" style={{color: '#d4af37', fontWeight: 'bold'}}>SmartHealth Connect</h3>
              <p className="text-white-50">
                Official Healthcare Portal of Sri Venkateswara University. 
                Dedicated to the well-being of our future leaders.
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

export default AboutPage;
