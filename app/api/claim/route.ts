import {
  createHash,
} from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@/lib/supabase";

import {
  rateLimit,
} from "@/lib/rate-limit";

import {
  createClaimToken,
} from "@/lib/claim-token";

const CLAIM_COOKIE_NAME =
  "ltf_claim";

const CLAIM_COOKIE_MAX_AGE =
  60 * 60;

function normalizeClaimCode(
  value: string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function hashClaimCode(
  value: string
) {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

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

  const claimCode =
    normalizeClaimCode(
      body.code || ""
    );

  if (
    claimCode.length < 10 ||
    claimCode.length > 40 ||
    !/^[A-Z0-9-]+$/.test(
      claimCode
    )
  ) {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a Left to Found finder code.",
      },
      {
        status: 400,
      }
    );
  }

  const claimCodeHash =
    hashClaimCode(
      claimCode
    );

  const supabase =
    createServerClient();

  const {
    data: record,
    error,
  } = await supabase
    .from("photos")
    .select(
      "id, status, found"
    )
    .eq(
      "claim_code_hash",
      claimCodeHash
    )
    .single();

  if (error || !record) {
    return NextResponse.json(
      {
        error:
          "No photograph exists for that finder code.",
      },
      {
        status: 404,
      }
    );
  }

  const isFound =
    record.status ===
      "found" ||
    record.found === true;

  /*
   * Already-found photographs
   * can still open their public
   * record, but no claim session
   * is created.
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

  const response =
    NextResponse.json(
      {
        id: record.id,
        alreadyFound: false,
      },
      {
        status: 200,
      }
    );

  /*
   * Permission to claim the
   * photograph is stored only in
   * an HttpOnly cookie.
   *
   * JavaScript cannot read it,
   * and it never appears in the
   * URL.
   */
  response.cookies.set(
    CLAIM_COOKIE_NAME,
    claimToken,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      maxAge:
        CLAIM_COOKIE_MAX_AGE,
      path: "/",
    }
  );

  return response;
}
