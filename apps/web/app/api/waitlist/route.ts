import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map<string, { n: number; t: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > 60 * 60 * 1000) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  if (row.n >= 8) return false;
  row.n += 1;
  return true;
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Try later." }, { status: 429 });
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; website?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhook) {
    console.error("GOOGLE_SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json(
      { ok: false, error: "Waitlist is not connected yet." },
      { status: 503 },
    );
  }

  try {
    const url = new URL(webhook);
    url.searchParams.set("email", email);
    url.searchParams.set("source", "waitlist");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, source: "waitlist" }),
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Sheet webhook ${res.status}`);
    }
  } catch (err) {
    console.error("Waitlist sheet write failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your email. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
