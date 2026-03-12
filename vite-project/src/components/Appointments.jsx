import { useEffect, useMemo, useState } from "react";
import "../assets/styles/Appointments.css";
import { trackEvent } from "../utils/analytics";

const STORAGE_KEY = "appointment_form";
const STEP_KEY = "appointment_step";

const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  email: "",
  visit: "new",
  department: "",
  doctor: "",
  appointmentDate: "",
  appointmentTime: "",
  notes: "",
};

const getInitialForm = () => {
  if (typeof window === "undefined") return DEFAULT_FORM;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_FORM, ...saved };
  } catch {
    return DEFAULT_FORM;
  }
};

const getInitialStep = () => {
  if (typeof window === "undefined") return 0;
  const saved = Number(window.localStorage.getItem(STEP_KEY));
  return Number.isFinite(saved) ? Math.min(Math.max(saved, 0), 3) : 0;
};

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getStepErrors = (stepIndex, data) => {
  const errors = {};

  if (stepIndex === 0) {
    if (!data.firstName.trim()) errors.firstName = "First name is required.";
    if (!data.lastName.trim()) errors.lastName = "Last name is required.";
    if (!data.dob) errors.dob = "Date of birth is required.";
    if (!data.phone.trim()) errors.phone = "Phone number is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    if (data.email && !validateEmail(data.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (stepIndex === 1) {
    if (!data.department) errors.department = "Select a department.";
  }

  if (stepIndex === 2) {
    if (!data.appointmentDate) errors.appointmentDate = "Select a date.";
    if (!data.appointmentTime) errors.appointmentTime = "Select a time slot.";
  }

  return errors;
};

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

  const [activeStep, setActiveStep] = useState(getInitialStep);
  const [formData, setFormData] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      window.localStorage.setItem(STEP_KEY, String(activeStep));
    } catch {
      // ignore persistence errors
    }
  }, [formData, activeStep]);

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

  const goToStep = (nextStep) => {
    if (nextStep > activeStep) {
      const stepErrors = getStepErrors(activeStep, formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setStatus({
          type: "error",
          message: "Please complete the required fields before continuing.",
        });
        return;
      }
    }
    setStatus({ type: "", message: "" });
    setActiveStep(nextStep);
    trackEvent("appointment_step_change", { from: activeStep, to: nextStep });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (activeStep < steps.length - 1) {
      goToStep(activeStep + 1);
      return;
    }

    const allErrors = {
      ...getStepErrors(0, formData),
      ...getStepErrors(1, formData),
      ...getStepErrors(2, formData),
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstInvalidStep = [0, 1, 2].find(
        (index) => Object.keys(getStepErrors(index, formData)).length > 0
      );
      if (typeof firstInvalidStep === "number") {
        setActiveStep(firstInvalidStep);
      }
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    trackEvent("appointment_submit_attempt", { channel: "web" });

    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({
        type: "success",
        message: "Appointment request received! We will confirm shortly.",
      });
      trackEvent("appointment_submit_success");
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STEP_KEY);
      } catch {
        // ignore
      }
    }, 900);
  };

  const summaryRows = [
    { label: "Name", value: `${formData.firstName} ${formData.lastName}`.trim() },
    { label: "Email", value: formData.email },
    { label: "Phone", value: formData.phone },
    {
      label: "Visit type",
      value:
        {
          new: "New patient",
          follow: "Follow-up",
          urgent: "Urgent",
        }[formData.visit] || formData.visit,
    },
    { label: "Department", value: formData.department },
    { label: "Doctor", value: formData.doctor || "No preference" },
    { label: "Date", value: formData.appointmentDate },
    { label: "Time", value: formData.appointmentTime },
    { label: "Notes", value: formData.notes || "None" },
  ];

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
            <span className="brand-name">Luka Health Care</span>
          </div>

          <h1 className="sidebar-heading">
            Book your <em>appointment</em> with us
          </h1>
          <p className="sidebar-sub">
            Fill in the short form to reserve your slot. We&apos;ll confirm by
            email within a few minutes.
          </p>

          <div className="steps" role="tablist" aria-label="Appointment steps">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className="step"
                role="tab"
                id={`step-tab-${index}`}
                aria-selected={activeStep === index}
                aria-current={activeStep === index ? "step" : undefined}
                aria-controls={`step-panel-${index}`}
                onClick={() => goToStep(index)}
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

        <form noValidate onSubmit={handleSubmit}>
          {status.message && (
            <div
              className={`form-status ${status.type} is-visible`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}

          <div
            className="form-grid"
            id={`step-panel-${activeStep}`}
            role="tabpanel"
            aria-labelledby={`step-tab-${activeStep}`}
          >
            {activeStep === 0 && (
              <>
                <div className={`field ${errors.firstName ? "has-error" : ""}`}>
                  <label htmlFor="first-name">First name *</label>
                  <input
                    type="text"
                    id="first-name"
                    name="firstName"
                    placeholder="Jane"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? "error-first-name" : undefined}
                  />
                  {errors.firstName && (
                    <span className="field-error" id="error-first-name">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div className={`field ${errors.lastName ? "has-error" : ""}`}>
                  <label htmlFor="last-name">Last name *</label>
                  <input
                    type="text"
                    id="last-name"
                    name="lastName"
                    placeholder="Doe"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? "error-last-name" : undefined}
                  />
                  {errors.lastName && (
                    <span className="field-error" id="error-last-name">
                      {errors.lastName}
                    </span>
                  )}
                </div>

                <div className={`field ${errors.dob ? "has-error" : ""}`}>
                  <label htmlFor="dob">Date of birth *</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={(event) => updateField("dob", event.target.value)}
                    aria-invalid={Boolean(errors.dob)}
                    aria-describedby={errors.dob ? "error-dob" : undefined}
                  />
                  {errors.dob && (
                    <span className="field-error" id="error-dob">
                      {errors.dob}
                    </span>
                  )}
                </div>

                <div className={`field ${errors.phone ? "has-error" : ""}`}>
                  <label htmlFor="phone">Phone number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "error-phone" : undefined}
                  />
                  {errors.phone && (
                    <span className="field-error" id="error-phone">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className={`field full ${errors.email ? "has-error" : ""}`}>
                  <label htmlFor="email">Email address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane.doe@email.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "error-email" : undefined}
                  />
                  {errors.email && (
                    <span className="field-error" id="error-email">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="field full">
                  <label>Visit type *</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        name="visit"
                        id="v-new"
                        value="new"
                        checked={formData.visit === "new"}
                        onChange={(event) => updateField("visit", event.target.value)}
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
                        checked={formData.visit === "follow"}
                        onChange={(event) => updateField("visit", event.target.value)}
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
                        checked={formData.visit === "urgent"}
                        onChange={(event) => updateField("visit", event.target.value)}
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
                <div className={`field ${errors.department ? "has-error" : ""}`}>
                  <label htmlFor="dept">Department *</label>
                  <select
                    id="dept"
                    name="department"
                    value={formData.department}
                    onChange={(event) => updateField("department", event.target.value)}
                    aria-invalid={Boolean(errors.department)}
                    aria-describedby={errors.department ? "error-department" : undefined}
                  >
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
                  {errors.department && (
                    <span className="field-error" id="error-department">
                      {errors.department}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="doctor">Preferred doctor</label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={(event) => updateField("doctor", event.target.value)}
                  >
                    <option value="">No preference</option>
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
                <div className={`field ${errors.appointmentDate ? "has-error" : ""}`}>
                  <label htmlFor="appt-date">Preferred date *</label>
                  <input
                    type="date"
                    id="appt-date"
                    name="appointmentDate"
                    min={minDate}
                    value={formData.appointmentDate}
                    onChange={(event) =>
                      updateField("appointmentDate", event.target.value)
                    }
                    aria-invalid={Boolean(errors.appointmentDate)}
                    aria-describedby={
                      errors.appointmentDate ? "error-appointment-date" : undefined
                    }
                  />
                  {errors.appointmentDate && (
                    <span className="field-error" id="error-appointment-date">
                      {errors.appointmentDate}
                    </span>
                  )}
                </div>

                <div className={`field ${errors.appointmentTime ? "has-error" : ""}`}>
                  <label htmlFor="appt-time">Preferred time *</label>
                  <select
                    id="appt-time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={(event) =>
                      updateField("appointmentTime", event.target.value)
                    }
                    aria-invalid={Boolean(errors.appointmentTime)}
                    aria-describedby={
                      errors.appointmentTime ? "error-appointment-time" : undefined
                    }
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
                  {errors.appointmentTime && (
                    <span className="field-error" id="error-appointment-time">
                      {errors.appointmentTime}
                    </span>
                  )}
                </div>

                <div className="field full">
                  <label htmlFor="notes">
                    Reason / symptoms{" "}
                    <span className="field-optional">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Briefly describe your symptoms or reason for the visit..."
                    value={formData.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                  ></textarea>
                </div>
              </>
            )}

            {activeStep === 3 && (
              <div className="field full">
                <label htmlFor="confirmation">Confirmation</label>
                <div className="summary-panel" id="confirmation">
                  {summaryRows.map((row) => (
                    <div className="summary-row" key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value || "—"}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              disabled={activeStep === 0}
              onClick={() => goToStep(Math.max(activeStep - 1, 0))}
            >
              Back
            </button>
            {activeStep < steps.length - 1 ? (
              <button type="button" className="btn-submit" onClick={() => goToStep(activeStep + 1)}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Request appointment →"}
              </button>
            )}
          </div>
          <p className="privacy-note" style={{ marginTop: 14 }}>
            Your information is encrypted and never shared with third parties.
          </p>
        </form>
      </main>
    </div>
  );
}
