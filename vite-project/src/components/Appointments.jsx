import '../assets/styles/Appointments.css'

export function Appointments() {
  return (
    <section id="appointment" className="appointment">
      <div className="container">
        <div className="section-header">
          <h2>Book an Appointment</h2>
          <p>Schedule your visit with our healthcare professionals</p>
        </div>
        <div className="appointment-form-container">
          <form className="appointment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select id="department" name="department" required>
                  <option value="">Select Department</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="general">General Medicine</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="doctor">Preferred Doctor</label>
                <select id="doctor" name="doctor">
                  <option value="">Any Available</option>
                  <option value="dr-johnson">Dr. Sarah Johnson</option>
                  <option value="dr-omondi">Dr. Michael Omondi</option>
                  <option value="dr-wanjiku">Dr. Grace Wanjiku</option>
                  <option value="dr-kamau">Dr. James Kamau</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message / Reason for Visit</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                autoComplete="off"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              Book Appointment
            </button>
            <div className="form-status" role="status" aria-live="polite"></div>
          </form>
        </div>
      </div>
    </section>
  );
}
