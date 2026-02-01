import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sanitize, isValidCode } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // ── Rate limit ──
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // ── Parse body ──
  let body: { id?: string; location?: string; caption?: string };
  try {
    body = await request.json();
  } catch (_) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id, location, caption } = body;

  // ── Validate code ──
  if (!id || !isValidCode(id.toUpperCase())) {
    return NextResponse.json(
      { error: "Invalid photo code." },
      { status: 400 }
    );
  }

  const code = id.toUpperCase();
  const cleanLocation = location ? sanitize(location, 100) : null;
  const cleanCaption = caption ? sanitize(caption, 200) : null;

  // ── Check record exists and is not already found ──
  const supabase = createServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("photos")
    .select("*")
    .eq("id", code)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "No record exists for this code." },
      { status: 404 }
    );
  }

  if (existing.found) {
    return NextResponse.json(
      { error: "This photograph has already been found." },
      { status: 409 }
    );
  }

  // ── Format found date ──
  const now = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const foundDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  // ── Update record ──
  const { data: updated, error: updateError } = await supabase
    .from("photos")
    .update({
      found: true,
      found_date: foundDate,
      found_at: now.toISOString(),
      location: cleanLocation,
      caption: cleanCaption,
    })
    .eq("id", code)
    .eq("found", false) // extra guard: only update if still not found
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Could not mark as found. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ record: updated }, { status: 200 });
}