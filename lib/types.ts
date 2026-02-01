export interface PhotoRecord {
  id: string;           // 4-char code e.g. "A9F2"
  hidden_date: string;  // e.g. "14 February 2026"
  found: boolean;
  found_date: string | null;
  location: string | null;
  caption: string | null;
  created_at: string;
  found_at: string | null;
}
