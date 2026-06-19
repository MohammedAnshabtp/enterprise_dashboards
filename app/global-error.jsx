"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <AlertTriangle size={36} color="#EF4444" />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 1.5rem" }}>
            A critical error occurred. Please refresh the page or go back to the dashboard.
          </p>

          {error?.message && (
            <p
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#94A3B8",
                wordBreak: "break-all",
                marginBottom: "1.5rem",
              }}
            >
              {error.message}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "#6366F1",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={15} />
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "#fff",
                color: "#0F172A",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid #E2E8F0",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
