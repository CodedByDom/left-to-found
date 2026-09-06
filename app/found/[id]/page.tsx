import {
  createServerClient,
} from "@/lib/supabase";

import {
  normalizeCode,
} from "@/lib/sanitize";

import {
  verifyClaimToken,
} from "@/lib/claim-token";

import type {
  PhotoRecord,
} from "@/lib/types";

import RecordClient from "./record-client";

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const id = normalizeCode(
    params.id
  );

  return {
    title: `${id} — Left to Found`,
    description:
      `The record for ${id}, a photograph left somewhere in the world to be found.`,
  };
}

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: {
    id: string;
  };

  searchParams?: {
    claim?: string;
  };
}) {
  const id = normalizeCode(
    params.id
  );

  const supabase =
    createServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (
    error ||
    !data
  ) {
    return (
      <div className="fade-in">
        <span className="record-code">
          {id}
        </span>

        <h1 className="artifact-title small-title">
          No photograph found.
        </h1>

        <p
          className="body-text muted"
          style={{
            marginTop:
              "1.5rem",
          }}
        >
          There isn&apos;t a
          Left to Found record
          for this code yet.
        </p>

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
          ← Back
        </a>
      </div>
    );
  }

  const record =
    data as PhotoRecord;

  if (!record.status) {
    record.status =
      record.found
        ? "found"
        : "out_there";
  }

  const claimToken =
    searchParams?.claim ||
    null;

  const canClaim =
    record.status !==
      "found" &&
    record.found !==
      true &&
    verifyClaimToken(
      claimToken,
      id
    );

  return (
    <RecordClient
      record={record}
      canClaim={canClaim}
      claimToken={
        canClaim
          ? claimToken
          : null
      }
    />
  );
}
