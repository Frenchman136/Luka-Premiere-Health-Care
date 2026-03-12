import '../assets/styles/ContactSection.css';

export function ContactSection() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2>Get In Touch</h2>
          <p>We're here to help and answer any questions you might have</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Visit Us</h4>
                <p>
                  123 Healthcare Avenue
                  <br />
                  Nairobi, Kenya
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div>
                <h4>Call Us</h4>
                <p>
                  Main: +254 700 000 000
                  <br />
                  Emergency: +254 700 000 111
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email Us</h4>
                <p>
                  info@lukahealth.co.ke
                  <br />
                  appointments@lukahealth.co.ke
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <div>
                <h4>Working Hours</h4>
                <p>
                  Mon - Fri: 8:00 AM - 8:00 PM
                  <br />
                  Sat - Sun: 9:00 AM - 5:00 PM
                  <br />
                  Emergency: 24/7
                </p>
              </div>
            </div>
            <div className="social-links">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="#">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="contact-form-container">
            <form className="contact-form">
              <div className="form-group">
                <label for="contactName">Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="name"
                  autocomplete="name"
                  required
                />
              </div>
              <div className="form-group">
                <label for="contactEmail">Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="email"
                  autocomplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label for="contactPhone">Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="phone"
                  inputmode="tel"
                  autocomplete="tel"
                />
              </div>
              <div className="form-group">
                <label for="contactSubject">Subject *</label>
                <input
                  type="text"
                  id="contactSubject"
                  name="subject"
                  autocomplete="off"
                  required
                />
              </div>
              <div className="form-group">
                <label for="contactMessage">Message *</label>
                <textarea
                  id="contactMessage"
                  name="message"
                  rows="5"
                  autocomplete="off"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-large">
                Send Message
              </button>
              <div className="form-status" role="status" aria-live="polite"></div>
            </form>
          </div>
        </div>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps?q=0.26142,34.50528&output=embed"
            width="100%"
            height="400"
            style="border: 0"
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
