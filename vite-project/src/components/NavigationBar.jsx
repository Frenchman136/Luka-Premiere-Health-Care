import { useEffect, useRef, useState } from "react";
import "../assets/styles/NavigationBar.css";
import { trackEvent } from "../utils/analytics";

export function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleHashChange = () => setMenuOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (!menuOpen) return;
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      trackEvent("nav_menu_toggle", { open: next });
      return next;
    });
  };

  const handleNavClick = (label) => {
    trackEvent("nav_link_click", { label });
    setMenuOpen(false);
  };

  return (
    <nav id="navbar" ref={navRef}>
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
          onClick={handleToggleMenu}
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
          <a href="#about" onClick={() => handleNavClick("About")}>
            About
          </a>
        </li>
        <li>
          <a href="#services" onClick={() => handleNavClick("Patient Care")}>
            Patient Care
          </a>
        </li>
        <li>
          <a href="#research" onClick={() => handleNavClick("Research")}>
            Research
          </a>
        </li>
        <li>
          <a
            href="#/appointment"
            target="_blank"
            rel="noreferrer"
            onClick={() => handleNavClick("Appointment")}
          >
            Schedule an Appointment
          </a>
        </li>
        <li>
          <a href="#doctors" onClick={() => handleNavClick("Doctors")}>
            Find a Doctor
          </a>
        </li>
        <li>
          <a href="#billing" onClick={() => handleNavClick("Billing")}>
            Pay Your Bill
          </a>
        </li>
        <li>
          <a href="#careers" onClick={() => handleNavClick("Careers")}>
            Employment
          </a>
        </li>
        <li>
          <a href="#contact" onClick={() => handleNavClick("Location")}>
            Location
          </a>
        </li>
      </ul>
    </nav>
  );
}
