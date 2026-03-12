import '../assets/styles/QuickAccess.css';

export function QuickAccess() {
  return (
    <section id="billing" className="quick-access">
      <div className="container">
        <div className="quick-card">
          <i className="fas fa-calendar-check"></i>
          <h3>Book Appointment</h3>
          <p>Schedule your visit online</p>
          <a href="#appointment" className="link-arrow">
            Book Now <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="quick-card">
          <i className="fas fa-file-medical"></i>
          <h3>Medical Records</h3>
          <p>Access your health records</p>
          <a href="#patient-portal" className="link-arrow">
            View Records <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="quick-card">
          <i className="fas fa-credit-card"></i>
          <h3>Pay Bills</h3>
          <p>Secure online payment</p>
          <a href="#billing" className="link-arrow">
            Pay Now <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="quick-card">
          <i className="fas fa-ambulance"></i>
          <h3>Emergency</h3>
          <p>Immediate medical attention</p>
          <a href="#emergency" className="link-arrow">
            Learn More <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
