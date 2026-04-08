import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/jwt";
import { rateLimit, getClientIp } from "@/app/lib/rate-limit";
import { sendOverspendAlert } from "@/app/lib/twilio";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip + ":alert", 5, 60_000); // stricter limit for SMS
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded for alerts.", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phone, category, amount, threshold, currency = "₹" } = body as {
      phone?: string;
      category?: string;
      amount?: number;
      threshold?: number;
      currency?: string;
    };

    if (!category || !amount || !threshold) {
      return NextResponse.json({ error: "category, amount, and threshold are required." }, { status: 400 });
    }
    if (amount <= threshold) {
      return NextResponse.json({ error: "Amount does not exceed threshold — no alert needed." }, { status: 400 });
    }

    const to = phone ?? process.env.TWILIO_DEFAULT_TO ?? "+911234567890";
    const result = await sendOverspendAlert({ to, category, amount, threshold, currency });

    return NextResponse.json({
      success: true,
      alert: {
        category,
        amount,
        threshold,
        overspendBy: parseFloat((amount - threshold).toFixed(2)),
        overspendPct: parseFloat((((amount - threshold) / threshold) * 100).toFixed(1)),
      },
      sms: result,
    });
  } catch (err) {
    console.error("[Alert Error]", err);
    return NextResponse.json({ error: "Alert sending failed." }, { status: 500 });
  }
}
