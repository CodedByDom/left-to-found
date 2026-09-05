// Strip HTML tags, trim, enforce max length.
export function sanitize(input: string, maxLength: number = 200): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

// V2 photo code format: LTF-0001, LTF-0002, ...
export function isValidCode(code: string): boolean {
  return /^LTF-\d{4}$/.test(code);
}

export function normalizeCode(input: string): string {
  const raw = input.trim().toUpperCase().replace(/\s+/g, "");

  // Convenience: allow a finder to type only the number.
  if (/^\d{1,4}$/.test(raw)) {
    return `LTF-${raw.padStart(4, "0")}`;
  }

  const digits = raw.replace(/^LTF-?/, "").replace(/\D/g, "").slice(0, 4);
  if (raw.startsWith("LTF") && digits) {
    return `LTF-${digits.padStart(4, "0")}`;
  }

  return raw;
}
