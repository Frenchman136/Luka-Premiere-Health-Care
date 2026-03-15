export function BackToTop({ label = "Back to top" }) {
  return (
    <div className="back-to-top">
      <button
        type="button"
        className="back-to-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        {label}
      </button>
    </div>
  );
}
