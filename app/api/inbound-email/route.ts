import { NextRequest, NextResponse } from "next/server";
import { processInboundEmail } from "@/lib/lead-capture";
import type { InboundEmailPayload } from "@/lib/lead-capture";

function getConfiguredSecret() {
  return process.env.POSTMARK_WEBHOOK_SECRET || process.env.IMPORT_SECRET || "";
}

function getHeaderSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.replace(/^Bearer\s+/i, "").trim();

  return (
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-postmark-webhook-secret") ||
    bearerToken
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  const configuredSecret = getConfiguredSecret();

  if (!configuredSecret) {
    return NextResponse.json(
      { ok: false, error: "webhook_secret_not_configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const providedSecret = getString(body.secret) || getHeaderSecret(request) || "";

  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload: InboundEmailPayload = {
    recipient: getString(body.recipient),
    from: getString(body.from),
    fromName: getString(body.fromName),
    subject: getString(body.subject),
    text: getString(body.text),
    html: getString(body.html),
    raw: getString(body.raw),
    provider: getString(body.provider)
  };
  const result = await processInboundEmail(payload);

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
