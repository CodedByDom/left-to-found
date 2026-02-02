import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import type { PhotoRecord } from "@/lib/types";
import RecordClient from "./record-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id.toUpperCase();
  return {
    title: `${id} — Left to Found`,
  };
}

export default async function RecordPage({
  params,
}: {
  params: { id: string };
}) {
  headers();

  const id = params.id.toUpperCase();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="fade-in">
        <span className="record-code">{id}</span>
        <p className="body-text muted" style={{ marginTop: "2rem" }}>
          No record exists for this code.
        </p>
        <a href="/" className="quiet-link" style={{ marginTop: "2.5rem", display: "inline-block" }}>
          ← Back
        </a>
      </div>
    );
  }

  return <RecordClient record={data as PhotoRecord} />;
}