import { useState } from "react";
import "../assets/styles/Appointments.css";

export function Appointments() {
  const steps = [
    {
      title: "Patient information",
      subtitle: "Name, age, contact",
      label: "Personal details",
    },
    {
      title: "Department selection",
      subtitle: "Specialty & doctor",
      label: "Select department",
    },
    {
      title: "Schedule your visit",
      subtitle: "Available slots",
      label: "Choose date & time",
    },
    {
      title: "Confirmation",
      subtitle: "Email & summary",
      label: "Confirmation",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="page">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M12 2L12 22M2 12H22" />
              </svg>
            </div>
            <span className="brand-name">MediCare Hospital</span>
          </div>

          <h1 className="sidebar-heading">
            Book your <em>appointment</em> with us
          </h1>
          <p className="sidebar-sub">
            Fill in the short form to reserve your slot. We&apos;ll confirm by
            email within a few minutes.
          </p>

          <div className="steps">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className="step"
                aria-current={activeStep === index ? "step" : undefined}
                onClick={() => setActiveStep(index)}
              >
                <div className={`step-num ${activeStep === index ? "active" : ""}`}>
                  {index + 1}
                </div>
                <div className="step-info">
                  <strong>{step.label}</strong>
                  <span>{step.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="sidebar-footer">
          By submitting this form you agree to our
          <br />
          Privacy Policy and Terms of Service.
        </p>
      </aside>

      <main className="form-panel">
        <div className="form-header">
          <span className="form-tag">Step {activeStep + 1} of 4</span>
          <h2 className="form-title">{steps[activeStep].title}</h2>
        </div>

        <form noValidate>
          <div className="form-grid">
            {activeStep === 0 && (
              <>
                <div className="field">
                  <label htmlFor="first-name">First name</label>
                  <input
                    type="text"
                    id="first-name"
                    name="firstName"
                    placeholder="Jane"
                    autoComplete="given-name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="last-name">Last name</label>
                  <input
                    type="text"
                    id="last-name"
                    name="lastName"
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="dob">Date of birth</label>
                  <input type="date" id="dob" name="dob" />
                </div>

                <div className="field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                  />
                </div>

                <div className="field full">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane.doe@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="field full">
                  <label>Visit type</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        name="visit"
                        id="v-new"
                        value="new"
                        defaultChecked
                      />
                      <label htmlFor="v-new">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                        New patient
                      </label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        name="visit"
                        id="v-follow"
                        value="follow"
                      />
                      <label htmlFor="v-follow">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                        Follow-up
                      </label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        name="visit"
                        id="v-urgent"
                        value="urgent"
                      />
                      <label htmlFor="v-urgent">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Urgent
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeStep === 1 && (
              <>
                <div className="field">
                  <label htmlFor="dept">Department</label>
                  <select id="dept" name="department" defaultValue="">
                    <option value="" disabled>
                      Select specialty...
                    </option>
                    <option>General Medicine</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>Dermatology</option>
                    <option>Gynecology</option>
                    <option>Ophthalmology</option>
                    <option>Psychiatry</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="doctor">Preferred doctor</label>
                  <select id="doctor" name="doctor" defaultValue="">
                    <option value="" disabled>
                      No preference
                    </option>
                    <option>Dr. Sarah Osei</option>
                    <option>Dr. James Nakamura</option>
                    <option>Dr. Leila Farouk</option>
                    <option>Dr. Marcus Delacroix</option>
                  </select>
                </div>
              </>
            )}

            {activeStep === 2 && (
              <>
                <div className="field">
                  <label htmlFor="appt-date">Preferred date</label>
                  <input type="date" id="appt-date" name="appointmentDate" />
                </div>

                <div className="field">
                  <label htmlFor="appt-time">Preferred time</label>
                  <select
                    id="appt-time"
                    name="appointmentTime"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose a slot...
                    </option>
                    <option>08:00  08:30</option>
                    <option>09:00  09:30</option>
                    <option>10:00  10:30</option>
                    <option>11:00  11:30</option>
                    <option>14:00  14:30</option>
                    <option>15:00  15:30</option>
                    <option>16:00  16:30</option>
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor="notes">
                    Reason / symptoms{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                        color: "#aaa",
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Briefly describe your symptoms or reason for the visit..."
                  ></textarea>
                </div>
              </>
            )}

            {activeStep === 3 && (
              <div className="field full">
                <label htmlFor="confirmation">Confirmation</label>
                <textarea
                  id="confirmation"
                  name="confirmation"
                  readOnly
                  value="Review your details and click Request appointment to submit your booking."
                ></textarea>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Request appointment &rarr;
            </button>
          </div>
          <p className="privacy-note" style={{ marginTop: 14 }}>
            Your information is encrypted and never shared with third parties.
          </p>
        </form>
      </main>
    </div>
  );
}
