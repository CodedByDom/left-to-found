"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const c = code.trim().toUpperCase();
    if (c.length > 0) {
      router.push(`/found/${c}`);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fade-in">
      <div className="home-statement">
        <p>Physical photographs are placed in public spaces and left to be found.</p>
        <p>When one is discovered, the moment is marked here.</p>
      </div>

      <div className="home-input-section">
        <label className="mono-label" htmlFor="photo-code">
          Enter photo code
        </label>
        <div className={`input-row${shake ? " shake" : ""}`}>
          <input
            ref={inputRef}
            id="photo-code"
            className="code-input"
            type="text"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 4)
              )
            }
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="A9F2"
            maxLength={4}
            spellCheck={false}
            autoComplete="off"
          />
          <button className="arrow-btn" onClick={submit} aria-label="Go">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8h9M8.5 4.5L12.5 8l-4 3.5"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="home-divider" />
      <Link href="/found" className="quiet-link">
        View public record
      </Link>
    </div>
  );
}
