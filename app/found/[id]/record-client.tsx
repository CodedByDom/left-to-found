"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import type {
  PhotoRecord,
} from "@/lib/types";

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  const d =
    new Date(value);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(d);
}

function daysBetween(
  start: string | null,
  end: string | null
) {
  if (
    !start ||
    !end
  ) {
    return null;
  }

  const a =
    new Date(
      start
    ).getTime();

  const b =
    new Date(
      end
    ).getTime();

  if (
    Number.isNaN(a) ||
    Number.isNaN(b)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round(
      (b - a) /
        86400000
    )
  );
}

export default function RecordClient({
  record,
  canClaim = false,
}: {
  record: PhotoRecord;
  canClaim?: boolean;
}) {
  const [phase, setPhase] =
    useState<
      | "form"
      | "submitting"
    >("form");

  const [
    finderName,
    setFinderName,
  ] = useState("");

  const [
    finderLocation,
    setFinderLocation,
  ] = useState("");

  const [
    finderCountry,
    setFinderCountry,
  ] = useState("");

  const [
    finderMessage,
    setFinderMessage,
  ] = useState("");

  const [
    honeypot,
    setHoneypot,
  ] = useState("");

  const [
    confirmed,
    setConfirmed,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    result,
    setResult,
  ] =
    useState<PhotoRecord>(
      record
    );

  const current =
    confirmed
      ? result
      : record;

  const isFound =
    current.status ===
      "found" ||
    current.found === true;

  const dropDate =
    formatDate(
      current.dropped_at ||
        current.hidden_date ||
        null
    );

  const foundDate =
    formatDate(
      current.found_at ||
        current.found_date ||
        null
    );

  const finderLoc = [
    current.finder_location ||
      current.location,
    current.finder_country,
  ]
    .filter(Boolean)
    .join(", ");

  const timeOutThere =
    useMemo(
      () =>
        daysBetween(
          current.dropped_at,
          current.found_at
        ),
      [
        current.dropped_at,
        current.found_at,
      ]
    );

  const handleConfirm =
    async () => {
      if (honeypot) {
        return;
      }

      if (!canClaim) {
        setError(
          "This finder session is no longer valid. Enter the finder code printed on the photograph again."
        );

        return;
      }

      setPhase(
        "submitting"
      );

      setError(null);

      try {
        const res =
          await fetch(
            "/api/found",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  id:
                    record.id,

                  finderName:
                    finderName.trim(),

                  finderLocation:
                    finderLocation.trim(),

                  finderCountry:
                    finderCountry.trim(),

                  finderMessage:
                    finderMessage.trim(),
                }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          setError(
            data.error ||
              "Something went wrong."
          );

          setPhase(
            "form"
          );

          return;
        }

        setResult(
          data.record
        );

        setConfirmed(
          true
        );
      } catch {
        setError(
          "Could not connect. Please try again."
        );

        setPhase(
          "form"
        );
      }
    };

  return (
    <article className="artifact fade-in">
      <div className="artifact-kicker">
        <span className="record-code">
          {current.id}
        </span>

        <span
          className={`status-pill ${
            isFound
              ? "is-found"
              : "is-out"
          }`}
        >
          {isFound
            ? "FOUND"
            : "OUT THERE"}
        </span>
      </div>

      <header className="artifact-header">
        <h1 className="artifact-title">
          {current.title ||
            "Untitled photograph"}
        </h1>

        <p className="artifact-meta">
          {[
            current.drop_location,
            current.drop_country,
          ]
            .filter(Boolean)
            .join(", ") ||
            "Location withheld"}

          {dropDate
            ? ` · ${dropDate}`
            : ""}
        </p>
      </header>

      <div className="artifact-record-layout">
        <div className="artifact-record-image">
          <div
            className={`artifact-image-shell ${
              !isFound
                ? "is-unrevealed"
                : ""
            }`}
          >
            {current.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  current.image_url
                }
                alt={
                  current.title ||
                  `Photograph ${current.id}`
                }
                className="artifact-image"
              />
            ) : (
              <div className="artifact-image-placeholder">
                <span>
                  {
                    current.id
                  }
                </span>

                <small>
                  photograph to
                  be added
                </small>
              </div>
            )}

            {!isFound &&
              current.image_url && (
                <div className="artifact-image-veil">
                  <span>
                    Still out
                    there
                  </span>
                </div>
              )}
          </div>
        </div>

        <div className="artifact-record-info">
          {current.story && (
            <section className="artifact-story">
              <p>
                {
                  current.story
                }
              </p>
            </section>
          )}

          {!isFound &&
            !canClaim && (
              <section className="finder-panel">
                <p className="finder-intro">
                  This photograph
                  is somewhere out
                  in the world.
                </p>

                <p className="privacy-note">
                  If you&apos;re
                  holding it,
                  enter the finder
                  code printed on
                  the photograph
                  from the archive.
                </p>
              </section>
            )}

          {!isFound &&
            canClaim && (
              <section className="finder-panel">
                <p className="finder-intro">
                  You&apos;ve
                  verified the
                  finder code
                  printed on this
                  photograph. Add
                  where it was
                  found, or leave
                  something behind.
                </p>

                <div className="form-area fade-in">
                  <div className="form-grid">
                    <label className="field">
                      <span className="mono-label">
                        Your name /
                        nickname{" "}
                        <span className="optional-hint">
                          —
                          optional
                        </span>
                      </span>

                      <input
                        className="text-input"
                        value={
                          finderName
                        }
                        onChange={(
                          e
                        ) =>
                          setFinderName(
                            e
                              .target
                              .value
                          )
                        }
                        disabled={
                          phase ===
                          "submitting"
                        }
                      />
                    </label>

                    <label className="field">
                      <span className="mono-label">
                        Where did
                        you find
                        it?{" "}
                        <span className="optional-hint">
                          —
                          optional
                        </span>
                      </span>

                      <input
                        className="text-input"
                        placeholder="City"
                        value={
                          finderLocation
                        }
                        onChange={(
                          e
                        ) =>
                          setFinderLocation(
                            e
                              .target
                              .value
                          )
                        }
                        disabled={
                          phase ===
                          "submitting"
                        }
                      />
                    </label>

                    <label className="field">
                      <span className="mono-label">
                        Country{" "}
                        <span className="optional-hint">
                          —
                          optional
                        </span>
                      </span>

                      <input
                        className="text-input"
                        value={
                          finderCountry
                        }
                        onChange={(
                          e
                        ) =>
                          setFinderCountry(
                            e
                              .target
                              .value
                          )
                        }
                        disabled={
                          phase ===
                          "submitting"
                        }
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span className="mono-label">
                      Leave
                      something
                      behind{" "}
                      <span className="optional-hint">
                        —
                        optional
                      </span>
                    </span>

                    <textarea
                      className="text-input text-area"
                      placeholder="A note, a thought, or where the photograph is going next."
                      value={
                        finderMessage
                      }
                      maxLength={
                        400
                      }
                      onChange={(
                        e
                      ) =>
                        setFinderMessage(
                          e
                            .target
                            .value
                        )
                      }
                      disabled={
                        phase ===
                        "submitting"
                      }
                    />
                  </label>

                  <div
                    className="hp-field"
                    aria-hidden="true"
                  >
                    <label>
                      Leave this
                      empty

                      <input
                        value={
                          honeypot
                        }
                        onChange={(
                          e
                        ) =>
                          setHoneypot(
                            e
                              .target
                              .value
                          )
                        }
                        tabIndex={
                          -1
                        }
                        autoComplete="off"
                      />
                    </label>
                  </div>

                  <p className="privacy-note">
                    Your note may
                    be shown on
                    this page
                    after review.
                    Everything is
                    optional.
                  </p>

                  {error && (
                    <p className="form-error">
                      {error}
                    </p>
                  )}

                  <button
                    className="primary-btn"
                    onClick={
                      handleConfirm
                    }
                    disabled={
                      phase ===
                      "submitting"
                    }
                  >
                    {phase ===
                    "submitting"
                      ? "MARKING..."
                      : "MARK AS FOUND"}
                  </button>
                </div>
              </section>
            )}

          {isFound && (
            <section className="found-panel">
              {confirmed && (
                <p className="found-confirmation">
                  You found{" "}
                  {current.id}.
                  It&apos;s yours
                  now.
                </p>
              )}

              <div className="found-rule" />

              <span className="mono-label">
                Found
              </span>

              <p className="found-date">
                {foundDate ||
                  "Found"}
              </p>

              {finderLoc && (
                <p className="found-location">
                  {
                    finderLoc
                  }
                </p>
              )}

              {timeOutThere !==
                null && (
                <p className="quiet-text">
                  {timeOutThere ===
                  0
                    ? "Found the same day it was left."
                    : `${timeOutThere} day${
                        timeOutThere ===
                        1
                          ? ""
                          : "s"
                      } out there.`}
                </p>
              )}

              {current.finder_message &&
                current.finder_message_public && (
                  <div className="finder-note">
                    <span className="mono-label">
                      A note
                      from the
                      finder
                    </span>

                    <blockquote>
                      “
                      {
                        current.finder_message
                      }
                      ”
                    </blockquote>

                    {current.finder_name && (
                      <p>
                        —{" "}
                        {
                          current.finder_name
                        }
                      </p>
                    )}
                  </div>
                )}

              {confirmed &&
                current.finder_message &&
                !current.finder_message_public && (
                  <p className="privacy-note">
                    Thanks for
                    leaving a
                    note. It
                    will appear
                    here if
                    approved.
                  </p>
                )}
            </section>
          )}

          <Link
            href="/"
            className="quiet-link artifact-back"
          >
            ← Left to Found
          </Link>
        </div>
      </div>
    </article>
  );
}    
