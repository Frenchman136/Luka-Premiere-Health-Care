import "../assets/styles/ContactTeaser.css";

export function ContactTeaser() {
  return (
    <section id="contact" className="contact-teaser">
      <div className="container">
        <div className="contact-teaser-grid">
          <div className="contact-teaser-content">
            <span className="contact-tag">Contact</span>
            <h2>Need help today?</h2>
            <p>
              Reach our care coordinators for guidance, referrals, or same-day
              appointments. We are ready to route you to the right team.
            </p>
            <div className="contact-teaser-actions">
              <a href="#/contact" className="btn btn-primary">
                Contact us
              </a>
              <a href="#/appointment" className="btn btn-outline">
                Book a visit
              </a>
            </div>
            <div className="contact-teaser-highlights">
              <div>
                <strong>24/7 Emergency</strong>
                <span>Immediate response teams on call</span>
              </div>
              <div>
                <strong>Same-day slots</strong>
                <span>Priority appointments for urgent cases</span>
              </div>
              <div>
                <strong>Insurance support</strong>
                <span>Billing guidance and paperwork assistance</span>
              </div>
            </div>
          </div>
          <div className="contact-teaser-card">
            <h3>Emergency Hotline</h3>
            <p className="contact-teaser-phone">+254 700 000 111</p>
            <div className="contact-teaser-meta">
              <div>
                <span>Hours</span>
                <strong>Always open</strong>
              </div>
              <div>
                <span>Main campus</span>
                <strong>Nairobi, Kenya</strong>
              </div>
            </div>
            <a href="#/emergency" className="contact-teaser-link">
              View emergency services
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
