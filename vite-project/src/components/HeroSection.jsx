import '../assets/styles/HeroSection.css';

export function HeroSection() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <p className="hero-kicker">Ranked #1 in East Africa · Since 1986</p>
        <h1 className="hero-title">
          Medicine refined to an <span className="hero-title-highlight">art</span> form.
        </h1>
        <p className="hero-tagline">
          Expert care delivered with precision, compassion, and the kind of
          attention once reserved for royalty. Your health is our masterpiece.
        </p>
        <div className="hero-actions">
          <a href="#/appointment" target="_blank" rel="noreferrer" className="hero-btn hero-btn-primary">
            Book a Consultation <span aria-hidden="true">→</span>
          </a>
          <a href="#research" className="hero-btn hero-btn-ghost">
            <span className="hero-play" aria-hidden="true">▶</span>
            Watch our story
          </a>
        </div>
      </div>
    </section>
  );
}
