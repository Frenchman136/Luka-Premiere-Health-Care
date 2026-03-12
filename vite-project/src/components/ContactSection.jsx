import { useEffect, useState } from "react";
import "../assets/styles/ContactSection.css";
import { trackEvent } from "../utils/analytics";

const DEFAULT_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function ContactSection() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!status.message) return;
    const timer = setTimeout(() => {
      setStatus({ type: "", message: "" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [status.message]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required.";
    if (!formData.email.trim()) next.email = "Email is required.";
    if (formData.email && !validateEmail(formData.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!formData.subject.trim()) next.subject = "Subject is required.";
    if (!formData.message.trim()) next.message = "Message is required.";
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({
        type: "error",
        message: "Please complete the required fields before sending.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    trackEvent("contact_submit_attempt");

    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({
        type: "success",
        message: "Message sent. We will get back to you shortly.",
      });
      setFormData(DEFAULT_FORM);
      trackEvent("contact_submit_success");
    }, 800);
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2>Get In Touch</h2>
          <p>We're here to help and answer any questions you might have</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Visit Us</h4>
                <p>
                  123 Healthcare Avenue
                  <br />
                  Nairobi, Kenya
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div>
                <h4>Call Us</h4>
                <p>
                  Main: +254 700 000 000
                  <br />
                  Emergency: +254 700 000 111
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email Us</h4>
                <p>
                  info@lukahealth.co.ke
                  <br />
                  appointments@lukahealth.co.ke
                </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <div>
                <h4>Working Hours</h4>
                <p>
                  Mon - Fri: 8:00 AM - 8:00 PM
                  <br />
                  Sat - Sun: 9:00 AM - 5:00 PM
                  <br />
                  Emergency: 24/7
                </p>
              </div>
            </div>
            <div className="social-links">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              {status.message && (
                <div
                  className={`form-status ${status.type} is-visible`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </div>
              )}
              <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="contactName">Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="contactEmail">Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>
              <div className={`form-group ${errors.subject ? "has-error" : ""}`}>
                <label htmlFor="contactSubject">Subject *</label>
                <input
                  type="text"
                  id="contactSubject"
                  name="subject"
                  autoComplete="off"
                  value={formData.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                />
                {errors.subject && (
                  <span className="field-error">{errors.subject}</span>
                )}
              </div>
              <div className={`form-group ${errors.message ? "has-error" : ""}`}>
                <label htmlFor="contactMessage">Message *</label>
                <textarea
                  id="contactMessage"
                  name="message"
                  rows="5"
                  autoComplete="off"
                  value={formData.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                ></textarea>
                {errors.message && (
                  <span className="field-error">{errors.message}</span>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps?q=0.26142,34.50528&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
