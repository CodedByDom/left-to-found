export type PhotoStatus = "out_there" | "found";

export interface PhotoRecord {
  id: string; // e.g. "LTF-0001"
  title: string | null;
  image_url: string | null;
  story: string | null;

  drop_location: string | null;
  drop_country: string | null;
  dropped_at: string | null;

  status: PhotoStatus;

  found_at: string | null;
  finder_name: string | null;
  finder_location: string | null;
  finder_country: string | null;
  finder_message: string | null;
  finder_message_public: boolean;

  created_at: string;
  updated_at: string;

  // Legacy v1 fields retained during migration.
  hidden_date?: string | null;
  found?: boolean | null;
  found_date?: string | null;
  location?: string | null;
  caption?: string | null;
}
