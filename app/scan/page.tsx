"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function ScanPage() {
  const router =
    useRouter();

  const [error, setError] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let cancelled =
      false;

    async function verify() {
      const code =
        window.location.hash
          .slice(1)
          .trim();

      /*
       * Strip the private finder
       * code from the address bar
       * immediately.
       */
      window.history.replaceState(
        null,
        "",
        "/scan"
      );

      if (!code) {
        setError(
          "This QR code does not contain a finder code."
        );

        return;
      }

      try {
        const response =
          await fetch(
            "/api/claim",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  code,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          if (!cancelled) {
            setError(
              data.error ||
                "This finder code could not be verified."
            );
          }

          return;
        }

        if (!cancelled) {
          router.replace(
            `/found/${encodeURIComponent(
              data.id
            )}`
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Could not verify this photograph. Please try again."
          );
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="fade-in">
      <span className="mono-label">
        Left to Found
      </span>

      <h1 className="artifact-title small-title">
        {error
          ? "Couldn’t verify this photograph."
          : "You found something."}
      </h1>

      <p
        className="body-text muted"
        style={{
          marginTop:
            "1.5rem",
        }}
      >
        {error ||
          "Opening its record…"}
      </p>

      {error && (
        <a
          href="/"
          className="quiet-link"
          style={{
            marginTop:
              "2.5rem",
            display:
              "inline-block",
          }}
        >
          ← Left to Found
        </a>
      )}
    </div>
  );
}
