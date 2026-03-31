import { useEffect, useMemo, useRef, useState } from "react";
import "../assets/styles/NavigatorBot.css";

const QUICK_ACTIONS = [
  { label: "Book appointment", hash: "#/appointment" },
  { label: "Find a doctor", hash: "#/doctors" },
  { label: "Explore services", hash: "#/services" },
  { label: "Contact support", hash: "#/contact" },
  { label: "Emergency help", hash: "#/emergency" },
];

const INTENTS = [
  {
    keywords: ["appointment", "book", "schedule", "slot", "visit"],
    reply: "I can take you straight to the appointment page.",
    label: "Go to appointments",
    hash: "#/appointment",
  },
  {
    keywords: ["doctor", "physician", "specialist", "cardio", "pediatric"],
    reply: "Looking for a doctor? Here is the doctors page.",
    label: "Browse doctors",
    hash: "#/doctors",
  },
  {
    keywords: ["service", "services", "treatment", "care", "department"],
    reply: "Let me show you our services and departments.",
    label: "View services",
    hash: "#/services",
  },
  {
    keywords: ["contact", "call", "email", "support", "helpdesk"],
    reply: "You can reach us from the contact page.",
    label: "Contact us",
    hash: "#/contact",
  },
  {
    keywords: ["emergency", "urgent", "911", "ambulance", "hotline"],
    reply: "For urgent care, the emergency page has the hotline details.",
    label: "Emergency info",
    hash: "#/emergency",
  },
  {
    keywords: ["about", "story", "mission", "team", "values"],
    reply: "Want to learn more about Luka Health? Here you go.",
    label: "About Luka Health",
    hash: "#/about",
  },
  {
    keywords: ["blog", "news", "article", "tips", "health blog"],
    reply: "I can take you to the latest health articles.",
    label: "Open blog",
    hash: "#/blog",
  },
  {
    keywords: ["home", "start", "main"],
    reply: "Heading back to the homepage.",
    label: "Go home",
    hash: "#/",
  },
];

const DEFAULT_BOT_MESSAGE =
  "Tell me what you are looking for, or pick a quick action below.";

const matchIntent = (text) => {
  const normalized = text.toLowerCase();
  return INTENTS.find((intent) =>
    intent.keywords.some((keyword) => normalized.includes(keyword))
  );
};

export function NavigatorBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I can guide you around the site." },
    { from: "bot", text: DEFAULT_BOT_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const quickActions = useMemo(() => QUICK_ACTIONS, []);

  const handleNavigate = (hash) => {
    window.location.hash = hash;
    setIsOpen(false);
  };

  const handleSend = (event) => {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    const intent = matchIntent(value);
    const reply = intent
      ? { text: intent.reply, action: { label: intent.label, hash: intent.hash } }
      : { text: "I can help with appointments, doctors, services, or contact." };

    setMessages((prev) => [
      ...prev,
      { from: "user", text: value },
      { from: "bot", ...reply },
    ]);
    setInputValue("");
  };

  return (
    <div className={`nav-bot ${isOpen ? "is-open" : ""}`} aria-live="polite">
      {!isOpen && (
        <button
          className="nav-bot-toggle"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open site guide"
        >
          <span className="nav-bot-icon">Guide</span>
          <span className="nav-bot-pill">Need directions?</span>
        </button>
      )}

      {isOpen && (
        <div className="nav-bot-panel" role="dialog" aria-label="Site guide">
          <header className="nav-bot-header">
            <div>
              <p className="nav-bot-eyebrow">Site guide</p>
              <h4>How can I help?</h4>
            </div>
            <button
              type="button"
              className="nav-bot-close"
              aria-label="Close guide"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </header>

          <div className="nav-bot-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`nav-bot-bubble ${message.from}`}
              >
                <span>{message.text}</span>
                {message.action && (
                  <button
                    type="button"
                    className="nav-bot-action"
                    onClick={() => handleNavigate(message.action.hash)}
                  >
                    {message.action.label}
                  </button>
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="nav-bot-actions">
            {quickActions.map((action) => (
              <button
                key={action.hash}
                type="button"
                onClick={() => handleNavigate(action.hash)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <form className="nav-bot-input" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Try: book appointment, find doctor..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
