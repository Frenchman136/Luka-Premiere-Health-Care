import { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import "../assets/styles/NavigationBar.css";
import { trackEvent } from "../utils/analytics";
import { auth } from "../utils/firebase";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

export function NavigationBar({ showAdminLink = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authStatus, setAuthStatus] = useState({ type: "", message: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === "undefined" ? "#/" : window.location.hash || "#/"
  );
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return (
      document.documentElement.dataset.theme ||
      window.localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });
  const [activeSection, setActiveSection] = useState("");
  const navRef = useRef(null);
  const sectionIds = [
    "home",
    "about",
    "services",
    "doctors",
    "emergency",
    "blog",
    "contact",
  ];

  useEffect(() => {
    const handleHashChange = () => {
      setMenuOpen(false);
      setCurrentHash(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAuthModalOpen(false);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // ignore storage issues
    }
  }, [theme]);

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

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    trackEvent("theme_toggle", { theme: theme === "dark" ? "light" : "dark" });
  };

  const openAuthModal = (mode = "signin") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setAuthStatus({ type: "", message: "" });
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthStatus({ type: "loading", message: "Working on it..." });

    try {
      if (authMode === "signup") {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authForm.name.trim(),
            email: authForm.email.trim(),
            password: authForm.password,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Sign up failed.");
        }
        await signInWithCustomToken(auth, payload.customToken);
      } else {
        await signInWithEmailAndPassword(
          auth,
          authForm.email.trim(),
          authForm.password
        );
      }
      setAuthStatus({ type: "success", message: "Signed in successfully." });
      setAuthForm({ name: "", email: "", password: "" });
      setAuthModalOpen(false);
    } catch (error) {
      setAuthStatus({
        type: "error",
        message: error?.message || "Authentication failed.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAuthStatus({ type: "warning", message: "Signed out." });
  };

  const handleGoogleSignIn = async () => {
    setAuthStatus({ type: "loading", message: "Connecting to Google..." });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthStatus({ type: "success", message: "Signed in with Google." });
      setAuthModalOpen(false);
    } catch (error) {
      setAuthStatus({
        type: "error",
        message: error?.message || "Google sign-in failed.",
      });
    }
  };

  const isRoute = currentHash.startsWith("#/");
  const routePath = isRoute ? currentHash.slice(2) : "";
  const routeRoot = routePath.split("?")[0].split("/")[0] || "home";
  const hashSection =
    !isRoute && currentHash.startsWith("#") ? currentHash.slice(1) : "";
  const resolvedHomeSection = activeSection || hashSection || "home";
  const isHomeRoute = !isRoute || routeRoot === "home";
  const activeLink = isHomeRoute ? resolvedHomeSection : routeRoot;
  return (
    <nav id="navbar" ref={navRef}>
      <a className="logo" href="#/" onClick={() => handleNavClick("Home")}>
        <span className="logo-text">LUKA</span>
      </a>
      <ul className="nav-primary" aria-label="Primary">
        <li>
          <a
            href="#/"
            onClick={() => handleNavClick("Home")}
            className={activeLink === "home" ? "is-active" : ""}
            aria-current={activeLink === "home" ? "page" : undefined}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#/services"
            onClick={() => handleNavClick("Services")}
            className={activeLink === "services" ? "is-active" : ""}
            aria-current={activeLink === "services" ? "page" : undefined}
          >
            Services
          </a>
        </li>
        <li>
          <a
            href="#/doctors"
            onClick={() => handleNavClick("Doctors")}
            className={activeLink === "doctors" ? "is-active" : ""}
            aria-current={activeLink === "doctors" ? "page" : undefined}
          >
            Doctors
          </a>
        </li>
        <li>
          <a
            href="#/about"
            onClick={() => handleNavClick("About")}
            className={activeLink === "about" ? "is-active" : ""}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#/contact"
            onClick={() => handleNavClick("Contact")}
            className={activeLink === "contact" ? "is-active" : ""}
            aria-current={activeLink === "contact" ? "page" : undefined}
          >
            Contact
          </a>
        </li>
        <li>
          <a
            href="#/blog"
            onClick={() => handleNavClick("Blog")}
            className={activeLink === "blog" ? "is-active" : ""}
            aria-current={activeLink === "blog" ? "page" : undefined}
          >
            Blog
          </a>
        </li>
        <li>
          <a
            href="#/appointment"
            onClick={() => handleNavClick("Appointments")}
            className={activeLink === "appointment" ? "is-active" : ""}
            aria-current={activeLink === "appointment" ? "page" : undefined}
          >
            Appointments
          </a>
        </li>
        {showAdminLink && (
          <li>
            <a
              href="#/admin"
              onClick={() => handleNavClick("Admin")}
              className={activeLink === "admin" ? "is-active" : ""}
              aria-current={activeLink === "admin" ? "page" : undefined}
            >
              Admin
            </a>
          </li>
        )}
      </ul>
      <div className="nav-actions">
        <a href="#/emergency" className="nav-cta" onClick={() => handleNavClick("Emergency")}>
          Emergency
        </a>
        {currentUser ? (
          <button type="button" className="auth-btn ghost" onClick={handleSignOut}>
            Sign out
          </button>
        ) : (
          <button type="button" className="auth-btn" onClick={() => openAuthModal()}>
            Sign in / up
          </button>
        )}
        <button
          className="theme-toggle"
          id="themeToggle"
          aria-label="Toggle dark mode"
          aria-pressed={theme === "dark"}
          onClick={handleThemeToggle}
        >
          <i
            className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}
            aria-hidden="true"
          ></i>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
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
          <a
            href="#/"
            onClick={() => handleNavClick("Home")}
            className={activeLink === "home" ? "is-active" : ""}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#/services"
            onClick={() => handleNavClick("Services")}
            className={activeLink === "services" ? "is-active" : ""}
          >
            Services
          </a>
        </li>
        <li>
          <a
            href="#/doctors"
            onClick={() => handleNavClick("Doctors")}
            className={activeLink === "doctors" ? "is-active" : ""}
          >
            Doctors
          </a>
        </li>
        <li>
          <a
            href="#/about"
            onClick={() => handleNavClick("About")}
            className={activeLink === "about" ? "is-active" : ""}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#/contact"
            onClick={() => handleNavClick("Contact")}
            className={activeLink === "contact" ? "is-active" : ""}
          >
            Contact
          </a>
        </li>
        <li>
          <a
            href="#/blog"
            onClick={() => handleNavClick("Blog")}
            className={activeLink === "blog" ? "is-active" : ""}
          >
            Blog
          </a>
        </li>
        <li>
          <a
            href="#/appointment"
            onClick={() => handleNavClick("Appointments")}
            className={activeLink === "appointment" ? "is-active" : ""}
          >
            Appointments
          </a>
        </li>
        {showAdminLink && (
          <li>
            <a
              href="#/admin"
              onClick={() => handleNavClick("Admin")}
              className={activeLink === "admin" ? "is-active" : ""}
            >
              Admin
            </a>
          </li>
        )}
        <li>
          {currentUser ? (
            <button type="button" className="nav-link-btn" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => openAuthModal()}
            >
              Account
            </button>
          )}
        </li>
        <li>
          <a
            href="#/emergency"
            onClick={() => handleNavClick("Emergency")}
          >
            Emergency Hotline
          </a>
        </li>
      </ul>
      {authModalOpen && (
        <div className="nav-overlay" role="dialog" aria-label="Sign in">
          <div className="nav-overlay-card auth-card">
            <div className="nav-overlay-header">
              <div>
                <p className="nav-overlay-eyebrow">
                  {authMode === "signup" ? "Create account" : "Welcome back"}
                </p>
                <h3>{authMode === "signup" ? "Sign up" : "Sign in"}</h3>
              </div>
              <button type="button" onClick={() => setAuthModalOpen(false)}>
                Close
              </button>
            </div>
            {authStatus.message && (
              <div className={`auth-status ${authStatus.type}`}>
                {authStatus.message}
              </div>
            )}
            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === "signin" ? "is-active" : ""}
                onClick={() => setAuthMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={authMode === "signup" ? "is-active" : ""}
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </button>
            </div>
            <button type="button" className="auth-google" onClick={handleGoogleSignIn}>
              Continue with Google
            </button>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
              <button type="submit">
                {authMode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
