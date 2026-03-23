import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import "../assets/styles/AdminDashboard.css";
import { auth } from "../utils/firebase";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);
const APPOINTMENTS_PAGE_SIZE = 6;
const MESSAGES_PAGE_SIZE = 5;

const INITIAL_COUNTS = {
  users: 0,
  appointments: 0,
  messages: 0,
  payments: 0,
};

const MESSAGE_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"];

const formatEnum = (value) => {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const shortenId = (value) => {
  if (!value) return "-";
  return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
};

export function AdminDashboard() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authStatus, setAuthStatus] = useState({ type: "", message: "" });
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsTotal, setAppointmentsTotal] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [activePanel, setActivePanel] = useState("appointments");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingMessageId, setUpdatingMessageId] = useState(null);


  const fetchJson = useCallback(async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      headers.Authorization = `Bearer ${idToken}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error || `Request failed (${response.status})`;
      throw new Error(message);
    }
    return payload;
  }, []);

  const fetchOverview = useCallback(async () => {
    const overview = await fetchJson("/admin/overview");
    setCounts({ ...INITIAL_COUNTS, ...(overview?.counts || {}) });
  }, [fetchJson]);

  const fetchAppointments = useCallback(
    async (page) => {
      const payload = await fetchJson(
        `/appointments?all=true&page=${page}&pageSize=${APPOINTMENTS_PAGE_SIZE}`
      );
      setAppointments(payload?.appointments || []);
      setAppointmentsTotal(payload?.total ?? 0);
      setAppointmentsPage(payload?.page ?? page);
    },
    [fetchJson]
  );

  const fetchMessages = useCallback(
    async (page) => {
      const payload = await fetchJson(
        `/messages?page=${page}&pageSize=${MESSAGES_PAGE_SIZE}`
      );
      setMessages(payload?.messages || []);
      setMessagesTotal(payload?.total ?? 0);
      setMessagesPage(payload?.page ?? page);
    },
    [fetchJson]
  );

  const loadAdminData = useCallback(async () => {
    if (!firebaseUser) {
      setStatus({
        type: "warning",
        message: "Log in as an admin to load dashboard data.",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "loading", message: "Loading admin data..." });

    try {
      await Promise.all([
        fetchOverview(),
        fetchAppointments(appointmentsPage),
        fetchMessages(messagesPage),
      ]);

      setLastUpdated(new Date());
      setStatus({ type: "success", message: "Admin data synced." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to load admin data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAppointments, fetchMessages, fetchOverview, messagesPage, appointmentsPage, firebaseUser]);

  const loadSession = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const payload = await fetchJson("/auth/me");
      if (payload?.user?.role !== "ADMIN") {
        setAuthStatus({
          type: "error",
          message: "This account is not an admin. Use an admin login.",
        });
        await signOut(auth);
        setUser(null);
        return;
      }
      setUser(payload.user);
      setAuthStatus({ type: "success", message: "Welcome back, admin." });
      await loadAdminData();
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Auth failed." });
      await signOut(auth);
      setUser(null);
    }
  }, [fetchJson, loadAdminData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser || null);
      if (!nextUser) {
        setUser(null);
        setCounts(INITIAL_COUNTS);
        setAppointments([]);
        setMessages([]);
        setAppointmentsPage(1);
        setMessagesPage(1);
        setAppointmentsTotal(0);
        setMessagesTotal(0);
        setStatus({ type: "", message: "" });
        return;
      }
      setAuthStatus({ type: "loading", message: "Verifying access..." });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    loadSession();
  }, [firebaseUser, loadSession]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setAuthStatus({ type: "loading", message: "Signing in..." });

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        loginForm.email.trim(),
        loginForm.password
      );
      await credential.user.getIdToken(true);
      setAuthStatus({
        type: "success",
        message: "Signed in. Verifying access...",
      });
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setAuthStatus({ type: "error", message: error.message || "Login failed." });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthStatus({ type: "warning", message: "Signed out." });
    setCounts(INITIAL_COUNTS);
    setAppointments([]);
    setMessages([]);
    setAppointmentsPage(1);
    setMessagesPage(1);
    setAppointmentsTotal(0);
    setMessagesTotal(0);
  };

  const handleMessageStatusChange = async (messageId, nextStatus) => {
    if (!messageId || !nextStatus) return;
    setUpdatingMessageId(messageId);
    try {
      const payload = await fetchJson(`/messages/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? payload.message : message
        )
      );
      setStatus({ type: "success", message: "Message status updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Update failed." });
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const appointmentPageCount = Math.max(
    1,
    Math.ceil(appointmentsTotal / APPOINTMENTS_PAGE_SIZE)
  );
  const messagePageCount = Math.max(
    1,
    Math.ceil(messagesTotal / MESSAGES_PAGE_SIZE)
  );

  const overviewCards = [
    { label: "Total users", value: counts.users, accent: "teal" },
    { label: "Appointments", value: counts.appointments, accent: "amber" },
    { label: "Messages", value: counts.messages, accent: "rose" },
    { label: "Payments", value: counts.payments, accent: "indigo" },
  ];

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Admin control room</p>
            <h1>Operational dashboard</h1>
            <p className="admin-subtitle">
              Monitor appointments, inbox flow, and service volume in one place.
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="admin-refresh"
              type="button"
              onClick={loadAdminData}
              disabled={isLoading || !firebaseUser}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            {lastUpdated && (
              <span className="admin-updated">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        <section className="admin-auth" aria-label="Admin authentication">
          <div>
            <label htmlFor="admin-email">Admin login</label>
            <p className="admin-auth-hint">
              Use your admin credentials to unlock the dashboard.
            </p>
          </div>
          <div className="admin-auth-controls">
            {user ? (
              <div className="admin-auth-summary">
                <span>Signed in as</span>
                <strong>{user.name || user.email}</strong>
                <button type="button" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            ) : (
              <form className="admin-auth-form" onSubmit={handleLoginSubmit}>
                <input
                  id="admin-email"
                  name="admin-email"
                  type="email"
                  placeholder="admin@email.com"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  required
                />
                <input
                  id="admin-password"
                  name="admin-password"
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
                <button type="submit">Sign in</button>
              </form>
            )}
          </div>
        </section>

        {authStatus.message && (
          <div className={`admin-status ${authStatus.type}`} role="status">
            {authStatus.message}
          </div>
        )}

        {status.message && (
          <div className={`admin-status ${status.type}`} role="status">
            {status.message}
          </div>
        )}

        <section className="admin-cards" aria-label="Overview counts">
          {overviewCards.map((card) => (
            <div className={`admin-card ${card.accent}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </section>

        <section className="admin-panels" aria-label="Admin detail panels">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Appointment pulse</h2>
                <p>Latest appointment requests and status changes.</p>
              </div>
              <div className="admin-panel-tabs">
                <button
                  type="button"
                  className={activePanel === "appointments" ? "is-active" : ""}
                  onClick={() => setActivePanel("appointments")}
                >
                  Appointments
                </button>
                <button
                  type="button"
                  className={activePanel === "messages" ? "is-active" : ""}
                  onClick={() => setActivePanel("messages")}
                >
                  Inbox
                </button>
              </div>
            </div>

            {activePanel === "appointments" && (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Scheduled</th>
                      <th>Status</th>
                      <th>Patient</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="admin-empty">
                          No appointments yet.
                        </td>
                      </tr>
                    )}
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.service || "-"}</td>
                        <td>{formatDateTime(appointment.scheduledAt)}</td>
                        <td>
                          <span
                            className="status-pill"
                            data-status={appointment.status || "UNKNOWN"}
                          >
                            {formatEnum(appointment.status)}
                          </span>
                        </td>
                        <td>{shortenId(appointment.userId)}</td>
                        <td>{appointment.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin-pagination">
                  <button
                    type="button"
                    disabled={appointmentsPage <= 1}
                    onClick={() => {
                      const next = Math.max(1, appointmentsPage - 1);
                      setAppointmentsPage(next);
                      fetchAppointments(next);
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page {appointmentsPage} of {appointmentPageCount}
                  </span>
                  <button
                    type="button"
                    disabled={appointmentsPage >= appointmentPageCount}
                    onClick={() => {
                      const next = Math.min(
                        appointmentPageCount,
                        appointmentsPage + 1
                      );
                      setAppointmentsPage(next);
                      fetchAppointments(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {activePanel === "messages" && (
              <div className="admin-message-list">
                {messages.length === 0 && (
                  <p className="admin-empty">No messages yet.</p>
                )}
                {messages.map((message) => (
                  <article className="admin-message" key={message.id}>
                    <div className="admin-message-top">
                      <div>
                        <h3>{message.subject || "General inquiry"}</h3>
                        <p>
                          {message.name} · {message.email}
                        </p>
                      </div>
                      <div className="admin-message-actions">
                        <select
                          value={message.status || "NEW"}
                          disabled={updatingMessageId === message.id}
                          onChange={(event) =>
                            handleMessageStatusChange(
                              message.id,
                              event.target.value
                            )
                          }
                        >
                          {MESSAGE_STATUSES.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {formatEnum(statusOption)}
                            </option>
                          ))}
                        </select>
                        <span
                          className="status-pill"
                          data-status={message.status || "NEW"}
                        >
                          {formatEnum(message.status)}
                        </span>
                      </div>
                    </div>
                    <p className="admin-message-body">{message.body}</p>
                    <span className="admin-message-meta">
                      Received {formatDateTime(message.createdAt)}
                    </span>
                  </article>
                ))}
                <div className="admin-pagination">
                  <button
                    type="button"
                    disabled={messagesPage <= 1}
                    onClick={() => {
                      const next = Math.max(1, messagesPage - 1);
                      setMessagesPage(next);
                      fetchMessages(next);
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page {messagesPage} of {messagePageCount}
                  </span>
                  <button
                    type="button"
                    disabled={messagesPage >= messagePageCount}
                    onClick={() => {
                      const next = Math.min(messagePageCount, messagesPage + 1);
                      setMessagesPage(next);
                      fetchMessages(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="admin-panel admin-side">
            <h2>Action board</h2>
            <p className="admin-side-sub">
              Keep this checklist close while triaging.
            </p>
            <ul>
              <li>Confirm upcoming appointments within 24 hours.</li>
              <li>Move new messages to In Progress by end of day.</li>
              <li>Review pending payments before the nightly batch.</li>
            </ul>
            <div className="admin-side-footer">
              <span>Need help?</span>
              <a href="#/contact">Contact operations</a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

