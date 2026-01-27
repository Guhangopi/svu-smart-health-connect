import React from 'react';
import './HomePage.css';

function ContactPage() {
  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '40vh', background: 'linear-gradient(135deg, #b91c1c, #991b1b)' }}>
        <div className="container text-center position-relative z-1">
          <span className="text-uppercase fw-bold text-light tracking-wider small mb-2 d-block opacity-75">Get In Touch</span>
          <h1 className="display-4 fw-bold text-white mb-3">Contact Us</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '700px' }}>
             We are here to answer your questions and provide support.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5">
            {/* Contact Info */}
            <div className="col-lg-5">
              <h2 className="fw-bold text-dark mb-4">Reach Out</h2>
              <p className="text-muted mb-5">
                Have questions about our services, appointments, or feedback? Feel free to reach out to us using the contact details below or send us a message.
              </p>
              
              <div className="d-flex align-items-start mb-4">
                <div className="icon-box bg-light text-primary rounded-circle me-3 flex-shrink-0" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📍</div>
                <div>
                   <h5 className="fw-bold text-dark mb-1">Address</h5>
                   <p className="text-muted mb-0">SVU Health Centre, Gandhi Road,<br/>Sri Venkateswara University Campus,<br/>Tirupati, Andhra Pradesh 517502</p>
                </div>
              </div>

               <div className="d-flex align-items-start mb-4">
                <div className="icon-box bg-light text-primary rounded-circle me-3 flex-shrink-0" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📞</div>
                <div>
                   <h5 className="fw-bold text-dark mb-1">Phone</h5>
                   <p className="text-muted mb-0">+91 98765 43210 (General)<br/>+91 98765 43211 (Emergency)</p>
                </div>
              </div>

               <div className="d-flex align-items-start mb-4">
                <div className="icon-box bg-light text-primary rounded-circle me-3 flex-shrink-0" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📧</div>
                <div>
                   <h5 className="fw-bold text-dark mb-1">Email</h5>
                   <p className="text-muted mb-0">healthcentre@svu.edu.in<br/>helpdesk@svu.edu.in</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-lg-7">
               <div className="p-4 p-md-5 bg-light rounded-4">
                 <h3 className="fw-bold text-dark mb-4">Send us a Message</h3>
                 <form>
                   <div className="row g-3">
                     <div className="col-md-6">
                       <label className="form-label text-muted small fw-bold">First Name</label>
                       <input type="text" className="form-control form-control-lg border-0 bg-white shadow-sm" placeholder="John" />
                     </div>
                     <div className="col-md-6">
                       <label className="form-label text-muted small fw-bold">Last Name</label>
                       <input type="text" className="form-control form-control-lg border-0 bg-white shadow-sm" placeholder="Doe" />
                     </div>
                     <div className="col-12">
                       <label className="form-label text-muted small fw-bold">Email Address</label>
                       <input type="email" className="form-control form-control-lg border-0 bg-white shadow-sm" placeholder="name@example.com" />
                     </div>
                     <div className="col-12">
                       <label className="form-label text-muted small fw-bold">Message</label>
                       <textarea className="form-control form-control-lg border-0 bg-white shadow-sm" rows="4" placeholder="How can we help?"></textarea>
                     </div>
                     <div className="col-12 mt-4">
                       <button type="button" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" onClick={() => alert('Message Sent (Simulated)')}>
                         Send Message
                       </button>
                     </div>
                   </div>
                 </form>
               </div>
            </div>
          </div>
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

export default ContactPage;
