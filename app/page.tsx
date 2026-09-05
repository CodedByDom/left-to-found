import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import type { PhotoRecord } from "@/lib/types";
import CodeEntry from "./code-entry";

export const dynamic = "force-dynamic";

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

	//log
	console.log(
  records.map((record) => ({
    id: record.id,
    image_url: record.image_url,
    status: record.status,
  }))
);

  const foundCount = records.filter((r) => r.status === "found").length;
  const outCount = records.filter((r) => r.status !== "found").length;

  return (
    <div className="archive-home fade-in">
      <section className="archive-hero">
        <p className="archive-eyebrow">A photographic project</p>
        <h1 className="archive-heading">Photographs left around the world for strangers to discover.</h1>
        <p className="archive-intro">
          A growing archive of physical photographs. Each one stays obscured here until somebody finds it out in the world.
        </p>
        <p className="archive-stats-line">
          <strong>{records.length}</strong> left <span>·</span> <strong>{foundCount}</strong> found <span>·</span> <strong>{outCount}</strong> still out there
        </p>
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-section-head">
          <span className="mono-label">Archive</span>
          <span className="archive-note">Found photographs reveal themselves.</span>
        </div>

        {records.length === 0 ? (
          <p className="empty-text">The first photograph has not been added yet.</p>
        ) : (
          <div className="photo-grid">
            {records.map((record) => {
              const isFound = record.status === "found";
              const location = [record.drop_location, record.drop_country].filter(Boolean).join(", ") || "Location withheld";
              return (
                <Link
                  href={`/found/${record.id}`}
                  className={`photo-card ${isFound ? "is-found" : "is-out"}`}
                  key={record.id}
                  aria-label={`${record.id}, ${location}, ${isFound ? "found" : "out there"}`}
                >
                  <div className={`photo-card-image ${!isFound ? "is-unrevealed" : ""}`}>
                    {record.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={record.image_url} alt={isFound ? (record.title || record.id) : "Unrevealed photograph"} />
                    ) : (
                      <div className="photo-card-placeholder" aria-hidden="true">
                        <span>{String(Number(record.id.replace("LTF-", "")) || 0).padStart(2, "0")}</span>
                      </div>
                    )}
                    {!isFound && <div className="photo-card-veil" />}
                    <span className={`photo-card-state-dot ${isFound ? "is-found" : ""}`} aria-hidden="true" />
                    <div className="photo-card-overlay">
                      <span>{record.id}</span>
                      <span>{location}</span>
                      <span>{isFound ? "FOUND" : "OUT THERE"}</span>
                    </div>
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
