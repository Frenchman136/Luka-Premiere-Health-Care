import "../assets/styles/About.css";

export function About({ variant = "full" }) {
  const isCompact = variant === "compact";

  return (
    <section id="about" className={`about ${isCompact ? "about--compact" : ""}`}>
      <div className="container">
        <div className="about-content">
          <div className="about-heading">
            <h2>About Luka Premiere Health Care</h2>
          </div>
          {!isCompact && (
            <div className="about-image">
              <img
                src="/images/about-800.webp"
                srcSet="/images/about-800.webp 800w, /images/about-1200.webp 1200w"
                sizes="(max-width: 900px) 100vw, 50vw"
                alt="Luka Hospital"
                width="1200"
                height="800"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="about-text">
            <p className="lead">Committed to excellence in healthcare since 2005</p>
            <p>
              Luka Premiere Health Care is a leading healthcare provider
              dedicated to delivering exceptional medical services with
              compassion and expertise.
            </p>
            {!isCompact && (
              <>
                <p>
                  We believe in a patient-centered approach, combining advanced
                  medical technology with personalized attention to meet your unique
                  healthcare needs.
                </p>
                <div className="about-stats">
                  <div className="stat">
                    <h3>50+</h3>
                    <p>Expert Doctors</p>
                  </div>
                  <div className="stat">
                    <h3>15,000+</h3>
                    <p>Happy Patients</p>
                  </div>
                  <div className="stat">
                    <h3>20+</h3>
                    <p>Departments</p>
                  </div>
                  <div className="stat">
                    <h3>18</h3>
                    <p>Years Experience</p>
                  </div>
                </div>
                <div className="accreditations">
                  <h4>Accreditations & Certifications</h4>
                  <div className="badges">
                    <span className="badge">ISO 9001:2015</span>
                    <span className="badge">JCI Accredited</span>
                    <span className="badge">MOH Approved</span>
                  </div>
                </div>
              </>
            )}
            {isCompact && (
              <div className="about-actions">
                <a href="#/about" className="btn btn-primary">
                  Learn more
                </a>
                <a href="#/services" className="btn btn-outline">
                  Explore services
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

