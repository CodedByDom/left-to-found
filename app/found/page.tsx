import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import type { PhotoRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Record — Left to Found",
};

export default async function LedgerPage() {
  const supabase = createServerClient();

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
        <div className="ledger-list">
          {records.map((r) => (
            <Link
              key={r.id}
              href={`/found/${r.id}`}
              className="ledger-row"
            >
              <div className="ledger-row-top">
                <span className="ledger-id">{r.id}</span>
                <span className="ledger-date">Found — {r.found_date}</span>
              </div>
              {r.location && <div className="ledger-loc">{r.location}</div>}
              {r.caption && (
                <div className="ledger-caption">&ldquo;{r.caption}&rdquo;</div>
              )}
            </Link>
          ))}
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