import {
  createHmac,
  timingSafeEqual,
} from "crypto";

const TOKEN_TTL_SECONDS = 60 * 60;

function getSecret() {
  const secret =
    process.env.CLAIM_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "CLAIM_TOKEN_SECRET is not configured."
    );
  }

  return secret;
}

function sign(payload: string) {
  return createHmac(
    "sha256",
    getSecret()
  )
    .update(payload)
    .digest("base64url");
}

export function createClaimToken(
  id: string
) {
  const payload = Buffer.from(
    JSON.stringify({
      id,
      exp:
        Math.floor(Date.now() / 1000) +
        TOKEN_TTL_SECONDS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyClaimToken(
  token: string | null | undefined,
  id: string
) {
  if (!token) {
    return false;
  }

  const [payload, suppliedSignature] =
    token.split(".");

  if (
    !payload ||
    !suppliedSignature
  ) {
    return false;
  }

  const expectedSignature =
    sign(payload);

  const supplied = Buffer.from(
    suppliedSignature
  );

  const expected = Buffer.from(
    expectedSignature
  );

  if (
    supplied.length !==
      expected.length ||
    !timingSafeEqual(
      supplied,
      expected
    )
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(
        payload,
        "base64url"
      ).toString("utf8")
    ) as {
      id?: string;
      exp?: number;
    };

    return (
      decoded.id === id &&
      typeof decoded.exp ===
        "number" &&
      decoded.exp >
        Math.floor(
          Date.now() / 1000
        )
    );
  } catch {
    return false;
  }
}
