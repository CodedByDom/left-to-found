"use client";

import { useState } from "react";
import Link from "next/link";
import type { PhotoRecord } from "@/lib/types";

export default function RecordClient({ record }: { record: PhotoRecord }) {
  const [phase, setPhase] = useState<"idle" | "form" | "submitting">("idle");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoRecord>(record);

  // ── Already found ──
  if (record.found || confirmed) {
    const r = confirmed ? result : record;
    return (
      <div className="fade-in" key="found">
        <span className="record-code">{r.id}</span>

        {confirmed && (
          <div style={{ marginBottom: "1.25rem" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{ opacity: 0.35 }}
            >
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="0.9" />
              <path
                d="M5.5 9.5l2 2 5-5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {confirmed && (
          <p className="body-text" style={{ marginBottom: "0.75rem" }}>
            Marked as found.
          </p>
        )}

        <p className="body-text">Found {r.found_date}</p>
        {r.location && <p className="body-text sub">{r.location}</p>}
        {r.caption && (
          <blockquote className="record-caption">&ldquo;{r.caption}&rdquo;</blockquote>
        )}

        <p className="quiet-text" style={{ marginTop: "2.5rem" }}>
          The photograph now exists somewhere else.
        </p>
        <p className="small-text">
          If you choose to share it, you can mention that it was found.
        </p>

        <Link
          href="/found"
          className="quiet-link"
          style={{ marginTop: "3rem", display: "inline-block" }}
        >
          View record →
        </Link>
      </div>
    );
  }

  // ── Not yet found ──
  const handleConfirm = async () => {
    // Honeypot check — bots fill hidden fields
    if (honeypot) return;

    setPhase("submitting");
    setError(null);

    try {
      const res = await fetch("/api/found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: record.id,
          location: location.trim(),
          caption: caption.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setPhase("form");
        return;
      }

      const data = await res.json();
      setResult(data.record);
      setConfirmed(true);
    } catch {
      setError("Could not connect. Please try again.");
      setPhase("form");
    }
  };

  return (
    <div className="fade-in">
      <span className="record-code">{record.id}</span>

      <p className="body-text">
        This photograph was hidden on {record.hidden_date}
      </p>
      <p className="instruction-text">
        If you have found it, you can mark it here.
      </p>

      {phase === "idle" && (
        <button className="primary-btn fade-in" onClick={() => setPhase("form")}>
          Mark as found
        </button>
      )}

      {(phase === "form" || phase === "submitting") && (
        <div className="form-area fade-in">
          <label className="field">
            <span className="mono-label">Location</span>
            <input
              className="text-input"
              type="text"
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={phase === "submitting"}
              autoFocus
            />
          </label>
          <label className="field">
            <span className="mono-label">
              Caption <span className="optional-hint">— optional</span>
            </span>
            <input
              className="text-input"
              type="text"
              placeholder="A brief word, if you like"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              disabled={phase === "submitting"}
            />
          </label>

          {/* Honeypot — invisible to humans */}
          <div className="hp-field" aria-hidden="true">
            <label>
              Leave this empty
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {error && (
            <p
              className="mono-label"
              style={{ color: "#a0522d", marginBottom: "1rem" }}
            >
              {error}
            </p>
          )}

          <button
            className="primary-btn"
            onClick={handleConfirm}
            disabled={phase === "submitting"}
          >
            {phase === "submitting" ? "Marking..." : "Confirm"}
          </button>
        </div>
      )}

      <Link
        href="/"
        className="quiet-link"
        style={{ marginTop: "3rem", display: "inline-block" }}
      >
        ← Back
      </Link>
    </div>
  );
}
