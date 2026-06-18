import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Angle Enterprise — Admin Dashboard",
  description: "AR Tiles Emporium Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0F172A",
              color: "#F1F5F9",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              borderRadius: "0.625rem",
              padding: "0.75rem 1rem",
              boxShadow:
                "0 10px 25px -5px rgb(0 0 0 / 0.3), 0 4px 10px -6px rgb(0 0 0 / 0.2)",
              maxWidth: "380px",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#F1F5F9" },
              style: {
                background: "#0F172A",
                borderLeft: "4px solid #10B981",
              },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#F1F5F9" },
              style: {
                background: "#0F172A",
                borderLeft: "4px solid #EF4444",
              },
            },
            loading: {
              iconTheme: { primary: "#6366F1", secondary: "#1E293B" },
              style: {
                background: "#0F172A",
                borderLeft: "4px solid #6366F1",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
