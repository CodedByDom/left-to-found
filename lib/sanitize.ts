// Strip HTML tags, trim, enforce max length
export function sanitize(input: string, maxLength: number = 200): string {
  return input
    .replace(/<[^>]*>/g, "")   // strip HTML
    .replace(/[<>"']/g, "")    // strip remaining dangerous chars
    .trim()
    .slice(0, maxLength);
}

// Validate photo code format: 4 uppercase alphanumeric chars
export function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{4}$/.test(code);
}
