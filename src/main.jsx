import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("JexoCart App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 700, margin: "50px auto", background: "#fff", borderRadius: 16, border: "1px solid #fee2e2", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
          <h2 style={{ color: "#e11d48", margin: "0 0 10px" }}>Something went wrong</h2>
          <p style={{ color: "#475569", lineHeight: 1.6, fontSize: 14 }}>
            An unexpected error occurred while rendering the page:
          </p>
          <pre style={{ background: "#fef2f2", padding: 16, borderRadius: 8, color: "#991b1b", overflowX: "auto", fontSize: 12 }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => {
              try {
                localStorage.removeItem("jexocart_cart_zustand");
              } catch (e) {}
              window.location.reload();
            }}
            style={{ marginTop: 18, padding: "10px 20px", background: "#6655e8", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
          >
            Clear Corrupted Cache & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}