import { About } from "./About";

export function AboutPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">About</span>
            <h1>Care built on precision, compassion, and trust.</h1>
            <p>
              Learn how Luka Premiere Health Care has grown into a patient-first
              medical center serving families across the region.
            </p>
            <div className="page-actions">
              <a href="#/services" className="btn btn-primary">
                Explore services
              </a>
              <a href="#/contact" className="btn btn-outline">
                Contact our team
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Our mission</h3>
            <p>Deliver world-class healthcare with dignity and empathy.</p>
            <strong className="hero-highlight">Established in 2005</strong>
            <span className="hero-subtext">18+ years of care excellence.</span>
          </div>
        </div>
      </section>

      <About variant="full" />
      <section className="about-callout">
        <div className="container about-callout-card">
          <div>
            <h3>Meet the specialists behind our care.</h3>
            <p>
              Browse Luka Premiere Health Care’s expert doctors and book the
              right clinician for your needs.
            </p>
          </div>
          <div className="about-callout-actions">
            <a href="#/doctors" className="btn btn-primary">
              View doctors
            </a>
            <a href="#/appointment" className="btn btn-outline">
              Book a visit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
