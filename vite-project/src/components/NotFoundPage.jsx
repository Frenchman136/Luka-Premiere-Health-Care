export function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">Page not found</span>
            <h1>We could not find that page.</h1>
            <p>
              Try a different page or return to the homepage to continue
              exploring Luka Premiere Health Care.
            </p>
            <div className="page-actions">
              <a href="#/" className="btn btn-primary">
                Back to home
              </a>
              <a href="#/contact" className="btn btn-outline">
                Contact us
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Need immediate help?</h3>
            <p>Call our emergency hotline for urgent care.</p>
            <strong className="hero-highlight">+254 700 000 111</strong>
            <span className="hero-subtext">Available 24/7.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
