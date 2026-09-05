"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      inputRef.current?.focus();
      return;
    }
    router.push(`/found/${normalized}`);
  };

  return (
    <div className="finder-code-panel">
      <div>
        <span className="mono-label">Found one?</span>
        <p className="finder-code-copy">Enter the code printed on the photograph.</p>
      </div>
      <div className={`input-row v2-code-row${shake ? " shake" : ""}`}>
        <input
          ref={inputRef}
          className="code-input v2-code-input"
          type="text"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, "")
                .slice(0, 12)
            )
          }
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="LTF-0001"
          spellCheck={false}
          autoComplete="off"
          aria-label="Photograph code"
        />
        <button className="arrow-btn" onClick={submit} aria-label="Open photograph record">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8h9M8.5 4.5L12.5 8l-4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
