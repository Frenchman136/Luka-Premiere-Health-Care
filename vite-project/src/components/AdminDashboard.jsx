import { useCallback, useEffect, useMemo, useState } from "react";
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
const APPOINTMENT_STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELED"];
const PRIORITY_LEVELS = ["LOW", "NORMAL", "HIGH", "URGENT"];
const ROLE_OPTIONS = ["ADMIN", "STAFF", "USER"];

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

const buildQueryString = (params) => {
  const entries = Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  if (!entries.length) return "";
  const query = new URLSearchParams(entries);
  return `?${query.toString()}`;
};

const toIsoInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const getWeekStart = (value) => {
  const date = new Date(value);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
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
  const [activeSection, setActiveSection] = useState("overview");
  const [activePanel, setActivePanel] = useState("appointments");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingMessageId, setUpdatingMessageId] = useState(null);
  const [appointmentFilters, setAppointmentFilters] = useState({
    search: "",
    status: "",
    department: "",
    doctor: "",
    visit: "",
    from: "",
    to: "",
  });
  const [messageFilters, setMessageFilters] = useState({
    search: "",
    status: "",
    priority: "",
    from: "",
    to: "",
  });
  const [calendarWeekStart, setCalendarWeekStart] = useState(getWeekStart(new Date()));
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentDraft, setAppointmentDraft] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [roleDraft, setRoleDraft] = useState({ identifier: "", role: "ADMIN" });
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsSeries, setAnalyticsSeries] = useState([]);
  const [analyticsRange, setAnalyticsRange] = useState({ from: "", to: "" });
  const [messageDrafts, setMessageDrafts] = useState({});

  const isAuthed = Boolean(user);

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
    async (page, filters = appointmentFilters) => {
      const query = buildQueryString({
        all: true,
        page,
        pageSize: APPOINTMENTS_PAGE_SIZE,
        ...filters,
      });
      const payload = await fetchJson(`/appointments${query}`);
      setAppointments(payload?.appointments || []);
      setAppointmentsTotal(payload?.total ?? 0);
      setAppointmentsPage(payload?.page ?? page);
    },
    [fetchJson, appointmentFilters]
  );

  const fetchMessages = useCallback(
    async (page, filters = messageFilters) => {
      const query = buildQueryString({
        page,
        pageSize: MESSAGES_PAGE_SIZE,
        ...filters,
      });
      const payload = await fetchJson(`/messages${query}`);
      setMessages(payload?.messages || []);
      setMessagesTotal(payload?.total ?? 0);
      setMessagesPage(payload?.page ?? page);
    },
    [fetchJson, messageFilters]
  );

  const fetchAnalytics = useCallback(async () => {
    const query = buildQueryString({
      from: analyticsRange.from || undefined,
      to: analyticsRange.to || undefined,
    });
    const payload = await fetchJson(`/admin/analytics${query}`);
    setAnalyticsSeries(payload?.series || []);
  }, [fetchJson, analyticsRange]);

  const fetchUsers = useCallback(
    async (page, searchValue = userSearch) => {
      const query = buildQueryString({
        page,
        pageSize: 10,
        search: searchValue,
      });
      const payload = await fetchJson(`/admin/users${query}`);
      setUsers(payload?.users || []);
      setUsersTotal(payload?.total ?? 0);
      setUsersPage(payload?.page ?? page);
    },
    [fetchJson, userSearch]
  );

  const fetchNotifications = useCallback(async () => {
    const payload = await fetchJson("/admin/notifications");
    setNotifications(payload?.notifications || []);
  }, [fetchJson]);

  const fetchAuditLogs = useCallback(async () => {
    const payload = await fetchJson("/admin/audit?limit=40");
    setAuditLogs(payload?.logs || []);
  }, [fetchJson]);

  const fetchCalendarAppointments = useCallback(
    async (weekStart = calendarWeekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const query = buildQueryString({
        all: true,
        from: weekStart.toISOString().split("T")[0],
        to: weekEnd.toISOString().split("T")[0],
      });
      const payload = await fetchJson(`/appointments${query}`);
      setCalendarAppointments(payload?.appointments || []);
    },
    [fetchJson, calendarWeekStart]
  );

  const fetchUserProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setStatus({ type: "warning", message: "No user profile attached." });
        return;
      }
      const payload = await fetchJson(`/admin/users/${userId}`);
      setSelectedUser(payload || null);
      setUserProfileOpen(true);
    },
    [fetchJson]
  );

  const downloadCsv = useCallback(
    async (path, filename) => {
      const headers = {};
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${idToken}`;
      }
      const response = await fetch(`${API_BASE}${path}`, { headers });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    []
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
        fetchAppointments(appointmentsPage, appointmentFilters),
        fetchMessages(messagesPage, messageFilters),
      ]);

      if (activeSection === "analytics") {
        await fetchAnalytics();
      }
      if (activeSection === "users") {
        await fetchUsers(usersPage, userSearch);
      }
      if (activeSection === "notifications") {
        await fetchNotifications();
      }
      if (activeSection === "audit") {
        await fetchAuditLogs();
      }
      if (activeSection === "calendar") {
        await fetchCalendarAppointments(calendarWeekStart);
      }

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
  }, [
    fetchAppointments,
    fetchMessages,
    fetchOverview,
    fetchAnalytics,
    fetchUsers,
    fetchNotifications,
    fetchAuditLogs,
    fetchCalendarAppointments,
    messagesPage,
    appointmentsPage,
    appointmentFilters,
    messageFilters,
    activeSection,
    usersPage,
    userSearch,
    calendarWeekStart,
    firebaseUser,
  ]);

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

  useEffect(() => {
    if (!isAuthed) return;
    const timer = setTimeout(() => {
      fetchAppointments(1, appointmentFilters);
    }, 350);
    return () => clearTimeout(timer);
  }, [appointmentFilters, isAuthed, fetchAppointments]);

  useEffect(() => {
    if (!isAuthed) return;
    const timer = setTimeout(() => {
      fetchMessages(1, messageFilters);
    }, 350);
    return () => clearTimeout(timer);
  }, [messageFilters, isAuthed, fetchMessages]);

  useEffect(() => {
    if (!isAuthed) return;
    if (activeSection === "analytics") {
      fetchAnalytics();
    }
    if (activeSection === "users") {
      fetchUsers(1, userSearch);
    }
    if (activeSection === "notifications") {
      fetchNotifications();
    }
    if (activeSection === "audit") {
      fetchAuditLogs();
    }
    if (activeSection === "calendar") {
      fetchCalendarAppointments(calendarWeekStart);
    }
  }, [
    activeSection,
    isAuthed,
    calendarWeekStart,
    userSearch,
    fetchAnalytics,
    fetchUsers,
    fetchNotifications,
    fetchAuditLogs,
    fetchCalendarAppointments,
  ]);

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

  const openAppointmentEditor = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDraft({
      id: appointment.id,
      status: appointment.status || "REQUESTED",
      priority: appointment.priority || "NORMAL",
      scheduledAt: toIsoInput(appointment.scheduledAt),
      service: appointment.service || "",
      department: appointment.department || "",
      doctor: appointment.doctor || "",
      visit: appointment.visit || "",
      notes: appointment.notes || "",
      assigneeId: appointment.assigneeId || "",
    });
  };

  const closeAppointmentEditor = () => {
    setSelectedAppointment(null);
    setAppointmentDraft(null);
  };

  const handleAppointmentSave = async () => {
    if (!appointmentDraft) return;
    try {
      const payload = await fetchJson(`/appointments/${appointmentDraft.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: appointmentDraft.status,
          priority: appointmentDraft.priority,
          scheduledAt: appointmentDraft.scheduledAt || null,
          service: appointmentDraft.service,
          department: appointmentDraft.department,
          doctor: appointmentDraft.doctor,
          visit: appointmentDraft.visit,
          notes: appointmentDraft.notes,
          assigneeId: appointmentDraft.assigneeId || null,
        }),
      });
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === payload.appointment.id ? payload.appointment : item
        )
      );
      setCalendarAppointments((prev) =>
        prev.map((item) =>
          item.id === payload.appointment.id ? payload.appointment : item
        )
      );
      setStatus({ type: "success", message: "Appointment updated." });
      closeAppointmentEditor();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Update failed." });
    }
  };

  const handleMessageUpdate = async (messageId) => {
    const draft = messageDrafts[messageId];
    if (!draft) return;
    setUpdatingMessageId(messageId);
    try {
      const payload = await fetchJson(`/messages/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: draft.status,
          priority: draft.priority,
          tags: draft.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          assigneeId: draft.assigneeId || null,
        }),
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? payload.message : message
        )
      );
      setStatus({ type: "success", message: "Message updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Update failed." });
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleExportAppointments = async () => {
    const query = buildQueryString(appointmentFilters);
    await downloadCsv(`/admin/export/appointments${query}`, "appointments.csv");
  };

  const handleExportMessages = async () => {
    const query = buildQueryString(messageFilters);
    await downloadCsv(`/admin/export/messages${query}`, "messages.csv");
  };

  const handleRolePromote = async (event) => {
    event.preventDefault();
    try {
      await fetchJson("/admin/users/role", {
        method: "POST",
        body: JSON.stringify(roleDraft),
      });
      setRoleDraft({ identifier: "", role: "ADMIN" });
      await fetchUsers(1, userSearch);
      setStatus({ type: "success", message: "Role updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Role update failed." });
    }
  };

  const handleInlineRoleChange = async (userId, nextRole) => {
    try {
      await fetchJson(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, role: nextRole } : item))
      );
      setStatus({ type: "success", message: "User role updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Role update failed." });
    }
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
      setMessageDrafts((prev) => ({
        ...prev,
        [messageId]: {
          ...(prev[messageId] || {}),
          status: nextStatus,
        },
      }));
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

  const usersPageCount = Math.max(1, Math.ceil(usersTotal / 10));

  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(calendarWeekStart);
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [calendarWeekStart]);

  const calendarBuckets = useMemo(() => {
    const buckets = {};
    calendarDays.forEach((day) => {
      buckets[day.toISOString().split("T")[0]] = [];
    });
    calendarAppointments.forEach((appointment) => {
      if (!appointment?.scheduledAt) return;
      const key = new Date(appointment.scheduledAt).toISOString().split("T")[0];
      if (!buckets[key]) {
        buckets[key] = [];
      }
      buckets[key].push(appointment);
    });
    return buckets;
  }, [calendarDays, calendarAppointments]);

  const analyticsMax = Math.max(
    1,
    ...analyticsSeries.map((entry) => entry.appointments + entry.messages)
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

        {isAuthed && status.message && (
          <div className={`admin-status ${status.type}`} role="status">
            {status.message}
          </div>
        )}

        {isAuthed ? (
          <>
            <div className="admin-section-tabs" role="tablist" aria-label="Admin sections">
              {[
                { id: "overview", label: "Overview" },
                { id: "appointments", label: "Appointments" },
                { id: "messages", label: "Inbox" },
                { id: "calendar", label: "Calendar" },
                { id: "analytics", label: "Analytics" },
                { id: "users", label: "Users" },
                { id: "notifications", label: "Notifications" },
                { id: "audit", label: "Audit log" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={activeSection === tab.id ? "is-active" : ""}
                  onClick={() => setActiveSection(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeSection === "overview" && (
            <>
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
            </>
            )}
            {activeSection === "appointments" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Appointments</h2>
                    <p>Filter, update, and manage appointment flow.</p>
                  </div>
                  <div className="admin-panel-actions">
                    <button type="button" onClick={handleExportAppointments}>
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="admin-filters">
                  <input
                    type="search"
                    placeholder="Search name, email, service..."
                    value={appointmentFilters.search}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        search: event.target.value,
                      }))
                    }
                  />
                  <select
                    value={appointmentFilters.status}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="">All statuses</option>
                    {APPOINTMENT_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {formatEnum(statusOption)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Department"
                    value={appointmentFilters.department}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        department: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Doctor"
                    value={appointmentFilters.doctor}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        doctor: event.target.value,
                      }))
                    }
                  />
                  <select
                    value={appointmentFilters.visit}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        visit: event.target.value,
                      }))
                    }
                  >
                    <option value="">Visit type</option>
                    <option value="new">New patient</option>
                    <option value="follow">Follow-up</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={appointmentFilters.from}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        from: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="date"
                    value={appointmentFilters.to}
                    onChange={(event) =>
                      setAppointmentFilters((prev) => ({
                        ...prev,
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Scheduled</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Patient</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="7" className="admin-empty">
                            No appointments match these filters.
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
                          <td>{formatEnum(appointment.priority || "NORMAL")}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-link"
                              onClick={() => fetchUserProfile(appointment.userId)}
                            >
                              {shortenId(appointment.userId)}
                            </button>
                          </td>
                          <td>{appointment.notes || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-link"
                              onClick={() => openAppointmentEditor(appointment)}
                            >
                              Manage
                            </button>
                          </td>
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
                        fetchAppointments(next, appointmentFilters);
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
                        fetchAppointments(next, appointmentFilters);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            )}
            {activeSection === "messages" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Inbox</h2>
                    <p>Prioritize, tag, and assign incoming messages.</p>
                  </div>
                  <div className="admin-panel-actions">
                    <button type="button" onClick={handleExportMessages}>
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="admin-filters">
                  <input
                    type="search"
                    placeholder="Search name, subject, message..."
                    value={messageFilters.search}
                    onChange={(event) =>
                      setMessageFilters((prev) => ({
                        ...prev,
                        search: event.target.value,
                      }))
                    }
                  />
                  <select
                    value={messageFilters.status}
                    onChange={(event) =>
                      setMessageFilters((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="">All statuses</option>
                    {MESSAGE_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {formatEnum(statusOption)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={messageFilters.priority}
                    onChange={(event) =>
                      setMessageFilters((prev) => ({
                        ...prev,
                        priority: event.target.value,
                      }))
                    }
                  >
                    <option value="">All priorities</option>
                    {PRIORITY_LEVELS.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatEnum(priority)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={messageFilters.from}
                    onChange={(event) =>
                      setMessageFilters((prev) => ({
                        ...prev,
                        from: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="date"
                    value={messageFilters.to}
                    onChange={(event) =>
                      setMessageFilters((prev) => ({
                        ...prev,
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-message-list">
                  {messages.length === 0 && (
                    <p className="admin-empty">No messages match these filters.</p>
                  )}
                  {messages.map((message) => {
                    const draft = messageDrafts[message.id] || {
                      status: message.status || "NEW",
                      priority: message.priority || "NORMAL",
                      tags: (message.tags || []).join(", "),
                      assigneeId: message.assigneeId || "",
                    };
                    return (
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
                              value={draft.status}
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
                              data-status={draft.status || "NEW"}
                            >
                              {formatEnum(draft.status)}
                            </span>
                          </div>
                        </div>
                        <p className="admin-message-body">{message.body}</p>
                        <div className="admin-message-fields">
                          <label>
                            Priority
                            <select
                              value={draft.priority}
                              onChange={(event) =>
                                setMessageDrafts((prev) => ({
                                  ...prev,
                                  [message.id]: { ...draft, priority: event.target.value },
                                }))
                              }
                            >
                              {PRIORITY_LEVELS.map((priority) => (
                                <option key={priority} value={priority}>
                                  {formatEnum(priority)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Tags
                            <input
                              type="text"
                              placeholder="billing, urgent"
                              value={draft.tags}
                              onChange={(event) =>
                                setMessageDrafts((prev) => ({
                                  ...prev,
                                  [message.id]: { ...draft, tags: event.target.value },
                                }))
                              }
                            />
                          </label>
                          <label>
                            Assignee ID
                            <input
                              type="text"
                              placeholder="Staff UID"
                              value={draft.assigneeId}
                              onChange={(event) =>
                                setMessageDrafts((prev) => ({
                                  ...prev,
                                  [message.id]: {
                                    ...draft,
                                    assigneeId: event.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <button
                            type="button"
                            disabled={updatingMessageId === message.id}
                            onClick={() => handleMessageUpdate(message.id)}
                          >
                            Save updates
                          </button>
                        </div>
                        <span className="admin-message-meta">
                          Received {formatDateTime(message.createdAt)}
                        </span>
                      </article>
                    );
                  })}
                  <div className="admin-pagination">
                    <button
                      type="button"
                      disabled={messagesPage <= 1}
                      onClick={() => {
                        const next = Math.max(1, messagesPage - 1);
                        setMessagesPage(next);
                        fetchMessages(next, messageFilters);
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
                        fetchMessages(next, messageFilters);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            )}
            {activeSection === "calendar" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Appointment calendar</h2>
                    <p>Weekly view of scheduled appointments.</p>
                  </div>
                  <div className="admin-panel-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarWeekStart((prev) => {
                          const next = new Date(prev);
                          next.setDate(next.getDate() - 7);
                          return next;
                        })
                      }
                    >
                      Previous week
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarWeekStart((prev) => {
                          const next = new Date(prev);
                          next.setDate(next.getDate() + 7);
                          return next;
                        })
                      }
                    >
                      Next week
                    </button>
                  </div>
                </div>
                <div className="admin-calendar">
                  {calendarDays.map((day) => {
                    const key = day.toISOString().split("T")[0];
                    return (
                      <div className="admin-calendar-day" key={key}>
                        <div className="admin-calendar-header">
                          <strong>{day.toLocaleDateString()}</strong>
                        </div>
                        <div className="admin-calendar-list">
                          {(calendarBuckets[key] || []).map((appointment) => (
                            <button
                              key={appointment.id}
                              type="button"
                              className="admin-calendar-card"
                              onClick={() => openAppointmentEditor(appointment)}
                            >
                              <span>{appointment.service || "Appointment"}</span>
                              <small>{formatDateTime(appointment.scheduledAt)}</small>
                            </button>
                          ))}
                          {(calendarBuckets[key] || []).length === 0 && (
                            <span className="admin-calendar-empty">No appointments</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {activeSection === "analytics" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Volume analytics</h2>
                    <p>Appointment and message trends.</p>
                  </div>
                  <div className="admin-panel-actions">
                    <input
                      type="date"
                      value={analyticsRange.from}
                      onChange={(event) =>
                        setAnalyticsRange((prev) => ({
                          ...prev,
                          from: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="date"
                      value={analyticsRange.to}
                      onChange={(event) =>
                        setAnalyticsRange((prev) => ({
                          ...prev,
                          to: event.target.value,
                        }))
                      }
                    />
                    <button type="button" onClick={fetchAnalytics}>
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="admin-analytics">
                  {analyticsSeries.map((entry) => {
                    const total = entry.appointments + entry.messages;
                    return (
                      <div className="admin-analytics-row" key={entry.date}>
                        <span>{entry.date}</span>
                        <div className="admin-analytics-bar">
                          <span
                            style={{ width: `${(total / analyticsMax) * 100}%` }}
                          ></span>
                        </div>
                        <strong>{total}</strong>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {activeSection === "users" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>User access</h2>
                    <p>Promote staff, adjust roles, and view profiles.</p>
                  </div>
                </div>
                <form className="admin-role-form" onSubmit={handleRolePromote}>
                  <input
                    type="text"
                    placeholder="Email or UID"
                    value={roleDraft.identifier}
                    onChange={(event) =>
                      setRoleDraft((prev) => ({
                        ...prev,
                        identifier: event.target.value,
                      }))
                    }
                    required
                  />
                  <select
                    value={roleDraft.role}
                    onChange={(event) =>
                      setRoleDraft((prev) => ({
                        ...prev,
                        role: event.target.value,
                      }))
                    }
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {formatEnum(role)}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Set role</button>
                </form>
                <div className="admin-filters">
                  <input
                    type="search"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                  <button type="button" onClick={() => fetchUsers(1, userSearch)}>
                    Search
                  </button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="4" className="admin-empty">
                            No users found.
                          </td>
                        </tr>
                      )}
                      {users.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.name || "-"}</td>
                          <td>{entry.email || "-"}</td>
                          <td>
                            <select
                              value={entry.role || "USER"}
                              onChange={(event) =>
                                handleInlineRoleChange(entry.id, event.target.value)
                              }
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {formatEnum(role)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-link"
                              onClick={() => fetchUserProfile(entry.id)}
                            >
                              View profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="admin-pagination">
                    <button
                      type="button"
                      disabled={usersPage <= 1}
                      onClick={() => {
                        const next = Math.max(1, usersPage - 1);
                        setUsersPage(next);
                        fetchUsers(next, userSearch);
                      }}
                    >
                      Previous
                    </button>
                    <span>
                      Page {usersPage} of {usersPageCount}
                    </span>
                    <button
                      type="button"
                      disabled={usersPage >= usersPageCount}
                      onClick={() => {
                        const next = Math.min(usersPageCount, usersPage + 1);
                        setUsersPage(next);
                        fetchUsers(next, userSearch);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            )}
            {activeSection === "notifications" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Notifications</h2>
                    <p>Queued user updates triggered by admin actions.</p>
                  </div>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Target</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.length === 0 && (
                        <tr>
                          <td colSpan="4" className="admin-empty">
                            No notifications yet.
                          </td>
                        </tr>
                      )}
                      {notifications.map((notification) => (
                        <tr key={notification.id}>
                          <td>{notification.type || "-"}</td>
                          <td>{notification.status || "-"}</td>
                          <td>{notification.targetId || "-"}</td>
                          <td>{formatDateTime(notification.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            {activeSection === "audit" && (
              <section className="admin-panel admin-panel-full">
                <div className="admin-panel-header">
                  <div>
                    <h2>Audit log</h2>
                    <p>Trace admin actions across the system.</p>
                  </div>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Actor</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="admin-empty">
                            No audit entries yet.
                          </td>
                        </tr>
                      )}
                      {auditLogs.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.action || "-"}</td>
                          <td>{entry.targetType || "-"} {entry.targetId || ""}</td>
                          <td>{entry.actorEmail || entry.actorId || "-"}</td>
                          <td>{formatDateTime(entry.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="admin-status warning" role="status">
            Log in with an admin account to view dashboard data.
          </div>
        )}

        {appointmentDraft && (
          <div className="admin-modal">
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h3>Manage appointment</h3>
                  <p>{selectedAppointment?.service || "Appointment details"}</p>
                </div>
                <button type="button" onClick={closeAppointmentEditor}>
                  Close
                </button>
              </div>
              <div className="admin-modal-body">
                <label>
                  Status
                  <select
                    value={appointmentDraft.status}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    {APPOINTMENT_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {formatEnum(statusOption)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={appointmentDraft.priority}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        priority: event.target.value,
                      }))
                    }
                  >
                    {PRIORITY_LEVELS.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatEnum(priority)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Scheduled time
                  <input
                    type="datetime-local"
                    value={appointmentDraft.scheduledAt}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        scheduledAt: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Department
                  <input
                    type="text"
                    value={appointmentDraft.department}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        department: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Doctor
                  <input
                    type="text"
                    value={appointmentDraft.doctor}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        doctor: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Visit type
                  <select
                    value={appointmentDraft.visit}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        visit: event.target.value,
                      }))
                    }
                  >
                    <option value="new">New patient</option>
                    <option value="follow">Follow-up</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    rows="3"
                    value={appointmentDraft.notes}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                  ></textarea>
                </label>
                <label>
                  Assignee ID
                  <input
                    type="text"
                    value={appointmentDraft.assigneeId}
                    onChange={(event) =>
                      setAppointmentDraft((prev) => ({
                        ...prev,
                        assigneeId: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={handleAppointmentSave}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}

        {userProfileOpen && selectedUser && (
          <div className="admin-modal">
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h3>User profile</h3>
                  <p>{selectedUser.user?.email || selectedUser.user?.id}</p>
                </div>
                <button type="button" onClick={() => setUserProfileOpen(false)}>
                  Close
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-profile-grid">
                  <div>
                    <strong>Name</strong>
                    <span>{selectedUser.user?.name || "-"}</span>
                  </div>
                  <div>
                    <strong>Role</strong>
                    <span>{selectedUser.user?.role || "USER"}</span>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <span>{selectedUser.user?.email || "-"}</span>
                  </div>
                </div>
                <h4>Appointment history</h4>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Scheduled</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedUser.appointments || []).length === 0 && (
                        <tr>
                          <td colSpan="3" className="admin-empty">
                            No appointments yet.
                          </td>
                        </tr>
                      )}
                      {(selectedUser.appointments || []).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.service || "-"}</td>
                          <td>{formatDateTime(appointment.scheduledAt)}</td>
                          <td>{formatEnum(appointment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


