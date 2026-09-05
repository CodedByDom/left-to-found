import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import type { PhotoRecord } from "@/lib/types";
import CodeEntry from "./code-entry";

export const dynamic = "force-dynamic";

function dateLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function HomePage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .like("id", "LTF-%")
    .order("created_at", { ascending: false });

  const records = ((data || []) as PhotoRecord[]).map((record) => ({
    ...record,
    status: record.status || (record.found ? "found" : "out_there"),
  }));

  const foundCount = records.filter((r) => r.status === "found").length;
  const outCount = records.filter((r) => r.status !== "found").length;

  return (
    <div className="archive-home fade-in">
      <section className="archive-hero">
        <p className="archive-eyebrow">A photographic project</p>
        <h1 className="archive-heading">Photographs left around the world for strangers to discover.</h1>
        <p className="archive-intro">
          Each print begins with one story, then leaves with someone else. When it is found, its record changes too.
        </p>
      </section>

      <section className="archive-stats" aria-label="Project statistics">
        <div><strong>{records.length}</strong><span>left</span></div>
        <div><strong>{foundCount}</strong><span>found</span></div>
        <div><strong>{outCount}</strong><span>still out there</span></div>
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-section-head">
          <span className="mono-label">The archive</span>
          <span className="archive-note">Found photographs reveal themselves.</span>
        </div>

        {records.length === 0 ? (
          <p className="empty-text">The first photograph has not been added yet.</p>
        ) : (
          <div className="photo-grid">
            {records.map((record) => {
              const isFound = record.status === "found";
              const metaDate = dateLabel(isFound ? record.found_at : record.dropped_at);
              return (
                <Link href={`/found/${record.id}`} className="photo-card" key={record.id}>
                  <div className={`photo-card-image ${!isFound ? "is-unrevealed" : ""}`}>
                    {record.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={record.image_url} alt={record.title || record.id} />
                    ) : (
                      <div className="photo-card-placeholder"><span>{record.id}</span></div>
                    )}
                    {!isFound && record.image_url && <div className="photo-card-veil" />}
                    <span className={`photo-card-status ${isFound ? "is-found" : ""}`}>{isFound ? "FOUND" : "OUT THERE"}</span>
                  </div>
                  <div className="photo-card-copy">
                    <div>
                      <h2>{record.title || "Untitled photograph"}</h2>
                      <p>{[record.drop_location, record.drop_country].filter(Boolean).join(", ") || "Location withheld"}</p>
                    </div>
                    <span>{metaDate || record.id}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <CodeEntry />
    </div>
  );
}
