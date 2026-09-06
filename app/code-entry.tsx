"use client";

import {
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function CodeEntry() {
  const router = useRouter();

  const [code, setCode] =
    useState("");

  const [shake, setShake] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const invalid = (
    message?: string
  ) => {
    if (message) {
      setError(message);
    }

    setShake(true);

    setTimeout(
      () =>
        setShake(false),
      450
    );

    inputRef.current?.focus();
  };

  const submit = async () => {
    if (loading) {
      return;
    }

    const normalized =
      code
        .trim()
        .toUpperCase();

    if (!normalized) {
      invalid();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res =
        await fetch(
          "/api/claim",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              code: normalized,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        invalid(
          data.error ||
            "That code could not be verified."
        );

        setLoading(false);
        return;
      }

      /*
       * Already found photographs
       * simply open their public record.
       */
      if (
        data.alreadyFound
      ) {
        router.push(
          `/found/${encodeURIComponent(
            data.id
          )}`
        );

        return;
      }

      /*
       * Unfound photographs receive a
       * short-lived signed permission.
       */
      router.push(
        `/found/${encodeURIComponent(
          data.id
        )}?claim=${encodeURIComponent(
          data.claimToken
        )}`
      );
    } catch {
      invalid(
        "Could not verify the code. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="finder-code-panel">
      <div>
        <span className="mono-label">
          Found one?
        </span>

        <p className="finder-code-copy">
          Enter the code printed on
          the photograph.
        </p>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}
      </div>

      <div
        className={`input-row v2-code-row${
          shake
            ? " shake"
            : ""
        }`}
      >
        <input
          ref={inputRef}
          className="code-input v2-code-input"
          type="text"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .toUpperCase()
                .replace(
                  /[^A-Z0-9-]/g,
                  ""
                )
                .slice(
                  0,
                  12
                )
            )
          }
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              submit();
            }
          }}
          placeholder="LTF-0001"
          spellCheck={false}
          autoComplete="off"
          aria-label="Photograph code"
          disabled={loading}
        />

        <button
          className="arrow-btn"
          onClick={submit}
          aria-label="Verify photograph code"
          disabled={loading}
        >
          {loading ? (
            <span
              style={{
                fontSize:
                  "0.6rem",
              }}
            >
              …
            </span>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3.5 8h9M8.5 4.5L12.5 8l-4 3.5"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
