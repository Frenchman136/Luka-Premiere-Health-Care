import { useEffect, useState } from "react";
import "../assets/styles/NavigationBar.css";

export function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setMenuOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
          className={`hamburger ${menuOpen ? "is-open" : ""}`}
          id="hamburger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="navLinks"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="hamburger-label">Menu</span>
          <span className="hamburger-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <ul
        className={`nav-links ${menuOpen ? "active" : ""}`}
        id="navLinks"
        aria-hidden={!menuOpen}
      >
        <li>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
        </li>
        <li>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Patient Care
          </a>
        </li>
        <li>
          <a href="#research" onClick={() => setMenuOpen(false)}>
            Research
          </a>
        </li>
        <li>
          <a
            href="#/appointment"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Schedule an Appointment
          </a>
        </li>
        <li>
          <a href="#doctors" onClick={() => setMenuOpen(false)}>
            Find a Doctor
          </a>
        </li>
        <li>
          <a href="#billing" onClick={() => setMenuOpen(false)}>
            Pay Your Bill
          </a>
        </li>
        <li>
          <a href="#careers" onClick={() => setMenuOpen(false)}>
            Employment
          </a>
        </li>
        <li>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Location
          </a>
        </li>
      </ul>
    </nav>
  );
}
