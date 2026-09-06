import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@/lib/supabase";

import {
  sanitize,
  isValidCode,
  normalizeCode,
} from "@/lib/sanitize";

import {
  rateLimit,
} from "@/lib/rate-limit";

import {
  verifyClaimToken,
} from "@/lib/claim-token";

const CLAIM_COOKIE_NAME =
  "ltf_claim";

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
    `found:${ip}`
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please wait a moment.",
      },
      {
        status: 429,
      }
    );
  }

  let body: {
    id?: string;
    finderName?: string;
    finderLocation?: string;
    finderCountry?: string;
    finderMessage?: string;
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

  const code =
    normalizeCode(
      body.id || ""
    );

  if (!isValidCode(code)) {
    return NextResponse.json(
      {
        error:
          "Invalid photo code.",
      },
      {
        status: 400,
      }
    );
  }

  const claimToken =
    request.cookies.get(
      CLAIM_COOKIE_NAME
    )?.value;

  if (
    !verifyClaimToken(
      claimToken,
      code
    )
  ) {
    return NextResponse.json(
      {
        error:
          "This finder session is invalid or has expired. Enter the finder code printed on the photograph again.",
      },
      {
        status: 403,
      }
    );
  }

  const finderName =
    body.finderName
      ? sanitize(
          body.finderName,
          80
        )
      : null;

  const finderLocation =
    body.finderLocation
      ? sanitize(
          body.finderLocation,
          100
        )
      : null;

  const finderCountry =
    body.finderCountry
      ? sanitize(
          body.finderCountry,
          80
        )
      : null;

  const finderMessage =
    body.finderMessage
      ? sanitize(
          body.finderMessage,
          400
        )
      : null;

  const supabase =
    createServerClient();

  const {
    data: existing,
    error: fetchError,
  } = await supabase
    .from("photos")
    .select("*")
    .eq("id", code)
    .single();

  if (
    fetchError ||
    !existing
  ) {
    return NextResponse.json(
      {
        error:
          "No record exists for this code.",
      },
      {
        status: 404,
      }
    );
  }

  const alreadyFound =
    existing.status ===
      "found" ||
    existing.found === true;

  if (alreadyFound) {
    return NextResponse.json(
      {
        error:
          "This photograph has already been found.",
      },
      {
        status: 409,
      }
    );
  }

  const foundMoment =
    new Date();

  const now =
    foundMoment.toISOString();

  const legacyFoundDate =
    new Intl.DateTimeFormat(
      "en",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }
    ).format(
      foundMoment
    );

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("photos")
    .update({
      status: "found",
      found: true,

      found_at: now,
      found_date:
        legacyFoundDate,

      finder_name:
        finderName,

      finder_location:
        finderLocation,

      finder_country:
        finderCountry,

      finder_message:
        finderMessage,

      finder_message_public:
        false,

      location:
        finderLocation,

      caption:
        finderMessage,

      updated_at: now,
    })
    .eq("id", code)
    .eq(
      "status",
      "out_there"
    )
    .eq(
      "found",
      false
    )
    .select()
    .single();

  if (
    updateError ||
    !updated
  ) {
    return NextResponse.json(
      {
        error:
          "Could not mark as found. Please try again.",
      },
      {
        status: 500,
      }
    );
  }

  const response =
    NextResponse.json(
      {
        record:
          updated,
      },
      {
        status: 200,
      }
    );

  /*
   * The photograph has now been
   * claimed, so remove the claim
   * permission immediately.
   */
  response.cookies.set(
    CLAIM_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      maxAge: 0,
      path: "/",
    }
  );

  return response;
}
