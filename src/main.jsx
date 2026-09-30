import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AdminProvider } from "./context/AdminContext";
import App from "./App";

import "./index.css";

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("========== REACT ERROR ==========");
    console.error(error);
    console.error("========== COMPONENT STACK ==========");
    console.error(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "40px",
            background: "#f8fafc",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              background: "#ffffff",
              padding: "30px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h1
              style={{
                color: "#dc2626",
                marginBottom: "20px",
              }}
            >
              React Application Error
            </h1>

            <p
              style={{
                color: "#475569",
                marginBottom: "15px",
              }}
            >
              The application crashed while rendering.
            </p>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "20px",
                borderRadius: "8px",
                color: "#991b1b",
                overflowX: "auto",
              }}
            >
              {this.state.error?.stack ||
                this.state.error?.message ||
                "Unknown React error"}
            </pre>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#4f46e5",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// ROOT
// ============================================================

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Could not find <div id="root"></div> in index.html'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminProvider>
        <App />
      </AdminProvider>
    </ErrorBoundary>
  </StrictMode>
);