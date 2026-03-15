import '../assets/styles/QuickAccess.css';

export function QuickAccess() {
  return (
    <section id="quick-access" className="quick-access">
      <div className="container">
        <div className="quick-card">
          <i className="fas fa-calendar-check"></i>
          <h3>Book Appointment</h3>
          <p>Schedule your visit online</p>
          <a href="#/appointment" className="link-arrow">
            Book Now <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="quick-card">
          <i className="fas fa-user-md"></i>
          <h3>Find a Doctor</h3>
          <p>Browse our specialist directory</p>
          <a href="#/doctors" className="link-arrow">
            View Doctors <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="quick-card">
          <i className="fas fa-notes-medical"></i>
          <h3>Explore Services</h3>
          <p>Find the right care quickly</p>
          <a href="#/services" className="link-arrow">
            View Services <i className="fas fa-arrow-right"></i>
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
