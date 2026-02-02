import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import Link from "next/link";
import type { PhotoRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Record — Left to Found",
};

export default async function LedgerPage() {
  headers();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("found", true)
    .order("found_at", { ascending: false });

  const records: PhotoRecord[] = error ? [] : (data as PhotoRecord[]);

  return (
    <div className="fade-in">
      <div className="ledger-head">
        <h1 className="ledger-title">Record</h1>
        <span className="ledger-count">{records.length} found</span>
      </div>

      {records.length === 0 ? (
        <p className="empty-text">Nothing has been found yet.</p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Found</th>
              <th>Location</th>
              <th>Caption</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/found/${r.id}`}>{r.id}</Link>
                </td>
                <td>{r.found_date}</td>
                <td>{r.location || "\u2014"}</td>
                <td>{r.caption ? `\u201C${r.caption}\u201D` : "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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