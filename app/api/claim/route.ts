import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@/lib/supabase";

import {
  isValidCode,
  normalizeCode,
} from "@/lib/sanitize";

import {
  rateLimit,
} from "@/lib/rate-limit";

import {
  createClaimToken,
} from "@/lib/claim-token";

export async function POST(
  request: NextRequest
) {
  const ip =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get(
      "x-real-ip"
    ) ||
    "unknown";

  const limit = rateLimit(
    `claim:${ip}`
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many attempts. Please wait a moment.",
      },
      {
        status: 429,
      }
    );
  }

  let body: {
    code?: string;
  };

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }

  const code = normalizeCode(
    body.code || ""
  );

  if (!isValidCode(code)) {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a Left to Found code.",
      },
      {
        status: 400,
      }
    );
  }

  const supabase =
    createServerClient();

  const {
    data: record,
    error,
  } = await supabase
    .from("photos")
    .select("id, status, found")
    .eq("id", code)
    .single();

  if (error || !record) {
    return NextResponse.json(
      {
        error:
          "No photograph exists for that code.",
      },
      {
        status: 404,
      }
    );
  }

  const isFound =
    record.status === "found" ||
    record.found === true;

  /*
   * A valid physical code may still
   * open an already-found record,
   * but there is nothing left to claim.
   */
  if (isFound) {
    return NextResponse.json(
      {
        id: record.id,
        alreadyFound: true,
      },
      {
        status: 200,
      }
    );
  }

  const claimToken =
    createClaimToken(
      record.id
    );

  return NextResponse.json(
    {
      id: record.id,
      claimToken,
      alreadyFound: false,
    },
    {
      status: 200,
    }
  );
}
