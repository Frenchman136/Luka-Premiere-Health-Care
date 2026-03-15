import { Emergency } from "./Emergency";

export function EmergencyPage() {
  return (
    <main className="page-shell">
      <section className="page-hero page-hero--service">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">Emergency</span>
            <h1>Immediate care. Every minute matters.</h1>
            <p>
              Our emergency department is staffed 24/7 with trauma-ready teams,
              rapid imaging access, and critical care specialists.
            </p>
            <div className="page-actions">
              <a href="#/contact" className="btn btn-primary">
                Call the hotline
              </a>
              <a href="#/services" className="btn btn-outline">
                Explore services
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Emergency Hotline</h3>
            <p>+254 700 000 111</p>
            <strong className="hero-highlight">Always open</strong>
            <span className="hero-subtext">Rapid response within minutes.</span>
          </div>
        </div>
      </section>

      <Emergency />
    </main>
  );
}
