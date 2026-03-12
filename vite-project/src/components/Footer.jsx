import '../assets/styles/Footer.css'

export function Footer() {
  return (
    <footer id="careers" class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>LUKA</h3>
            <p>
              Providing exceptional healthcare services with compassion and
              expertise since 2005.
            </p>
            <div class="footer-social">
              <a href="#">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#doctors">Doctors</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Patient Resources</h4>
            <ul>
              <li>
                <a href="#patient-portal">Patient Portal</a>
              </li>
              <li>
                <a href="#billing">Pay Bills</a>
              </li>
              <li>
                <a href="#insurance">Insurance</a>
              </li>
              <li>
                <a href="#records">Medical Records</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Departments</h4>
            <ul>
              <li>
                <a href="#">Cardiology</a>
              </li>
              <li>
                <a href="#">Pediatrics</a>
              </li>
              <li>
                <a href="#">Neurology</a>
              </li>
              <li>
                <a href="#">Orthopedics</a>
              </li>
              <li>
                <a href="#">Emergency</a>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact Info</h4>
            <ul class="footer-contact">
              <li>
                <i class="fas fa-map-marker-alt"></i> 123 Healthcare Avenue,
                Nairobi
              </li>
              <li>
                <i class="fas fa-phone"></i> +254 700 000 000
              </li>
              <li>
                <i class="fas fa-envelope"></i> info@lukahealth.co.ke
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Luka Premiere Health Care. All rights reserved.</p>
          <div class="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#hipaa">HIPAA Compliance</a>
            <a href="#careers">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
