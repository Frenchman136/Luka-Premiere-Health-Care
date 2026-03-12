import { Component } from "react";
import { trackEvent } from "../utils/analytics";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    trackEvent("ui_error", {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ marginBottom: 10 }}>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
