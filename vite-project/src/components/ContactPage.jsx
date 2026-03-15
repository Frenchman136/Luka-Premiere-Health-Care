import "../assets/styles/ContactPage.css";
import { ContactSection } from "./ContactSection";

const DEPARTMENTS = [
  {
    name: "Cardiology",
    phone: "+254 700 100 210",
    email: "cardiology@lukahealth.co.ke",
    hours: "Mon-Sat, 8:00 AM - 6:00 PM",
  },
  {
    name: "Pediatrics",
    phone: "+254 700 100 305",
    email: "pediatrics@lukahealth.co.ke",
    hours: "Mon-Sun, 9:00 AM - 7:00 PM",
  },
  {
    name: "Orthopedics",
    phone: "+254 700 100 402",
    email: "orthopedics@lukahealth.co.ke",
    hours: "Mon-Sat, 8:30 AM - 5:30 PM",
  },
  {
    name: "Radiology",
    phone: "+254 700 100 115",
    email: "radiology@lukahealth.co.ke",
    hours: "Mon-Sun, 7:00 AM - 9:00 PM",
  },
  {
    name: "Laboratory",
    phone: "+254 700 100 520",
    email: "lab@lukahealth.co.ke",
    hours: "Mon-Sun, 6:30 AM - 8:00 PM",
  },
  {
    name: "Emergency",
    phone: "+254 700 000 111",
    email: "emergency@lukahealth.co.ke",
    hours: "24/7",
  },
];

export function ContactPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">Contact</span>
            <h1>Reach the right department quickly.</h1>
            <p>
              Call, message, or visit Luka Premiere Health Care. Our team will
              guide you to the best specialist for your needs.
            </p>
            <div className="page-actions">
              <a href="#/appointment" className="btn btn-primary">
                Book an appointment
              </a>
              <a href="#/emergency" className="btn btn-outline">
                Emergency hotline
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Main Contact</h3>
            <p>+254 700 000 000</p>
            <strong className="hero-highlight">info@lukahealth.co.ke</strong>
            <span className="hero-subtext">We respond within 30 minutes.</span>
          </div>
        </div>
      </section>

      <section className="contact-directory">
        <div className="container">
          <div className="section-header">
            <h2>Department Directory</h2>
            <p>Direct lines to the teams you need most.</p>
          </div>
          <div className="department-grid">
            {DEPARTMENTS.map((dept) => (
              <article key={dept.name} className="department-card">
                <h3>{dept.name}</h3>
                <p>{dept.hours}</p>
                <div className="department-meta">
                  <span>{dept.phone}</span>
                  <span>{dept.email}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
