const STORAGE_KEY = "luka_analytics_events";

export function trackEvent(eventName, payload = {}) {
  try {
    const entry = {
      event: eventName,
      payload,
      timestamp: new Date().toISOString(),
    };

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.push(entry);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-200)));

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[analytics]", entry);
    }
  } catch {
    // ignore analytics errors
  }
}
