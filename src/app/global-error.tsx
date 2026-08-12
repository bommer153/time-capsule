"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#fff5f9", color: "#4a1630", margin: 0 }}>
        <div style={{ maxWidth: 420, margin: "20vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28 }}>This page hit a server error</h1>
          <p style={{ opacity: 0.75 }}>
            {error.message || "Unknown error"}
            {error.digest ? ` (${error.digest})` : ""}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              border: 0,
              borderRadius: 999,
              background: "#ec4899",
              color: "white",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
