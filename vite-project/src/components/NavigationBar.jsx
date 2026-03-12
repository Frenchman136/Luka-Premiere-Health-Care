import "../assets/styles/NavigationBar.css";

export function NavigationBar() {
  return (
    <nav id="navbar">
      <div className="logo">
        <span className="logo-text">LUKA</span>
      </div>
      <div className="nav-actions">
        <button
          className="theme-toggle"
          id="themeToggle"
          aria-label="Toggle dark mode"
          aria-pressed="false"
        >
          <i className="fas fa-moon" aria-hidden="true"></i>
          <span>Dark</span>
        </button>
        <button className="search-btn" aria-label="Search">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button
          className="hamburger"
          id="hamburger"
          aria-label="Menu"
          aria-expanded="false"
          aria-controls="navLinks"
        >
          <span className="hamburger-label">Menu</span>
          <span className="hamburger-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <ul className="nav-links" id="navLinks" aria-hidden="true">
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#services">Patient Care</a>
        </li>
        <li>
          <a href="#research">Research</a>
        </li>
        <li>
          <a href="#appointment">Schedule an Appointment</a>
        </li>
        <li>
          <a href="#doctors">Find a Doctor</a>
        </li>
        <li>
          <a href="#billing">Pay Your Bill</a>
        </li>
        <li>
          <a href="#careers">Employment</a>
        </li>
        <li>
          <a href="#contact">Location</a>
        </li>
      </ul>
    </nav>
  );
}
