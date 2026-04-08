/**
 * WealthLens AI — Twilio SMS Overspending Alerts
 * Sends real-time SMS when spending exceeds a category threshold.
 * Gracefully no-ops if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set.
 */

export interface SMSAlertPayload {
  to: string;          // recipient phone in E.164 format e.g. +919876543210
  category: string;
  amount: number;
  threshold: number;
  currency?: string;
}

export interface SMSResult {
  sent: boolean;
  sid?: string;
  error?: string;
  simulated?: boolean; // true when Twilio credentials are absent
}

export async function sendOverspendAlert(payload: SMSAlertPayload): Promise<SMSResult> {
  const { to, category, amount, threshold, currency = "₹" } = payload;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER ?? "+15005550006"; // Twilio magic test number

  // ── Graceful no-op when credentials are absent ────────────────────────────
  if (!accountSid || !authToken || accountSid === "your_account_sid_here") {
    const body = buildMessageBody(category, amount, threshold, currency);
    console.log(`[WealthLens SMS — SIMULATED] To: ${to}\n${body}`);
    return {
      sent: false,
      simulated: true,
      error: "Twilio credentials not configured — message simulated in console.",
    };
  }

  try {
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);

    const body = buildMessageBody(category, amount, threshold, currency);
    const message = await client.messages.create({ body, from: fromNumber, to });

    return { sent: true, sid: message.sid };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[WealthLens SMS Error]", msg);
    return { sent: false, error: msg };
  }
}

function buildMessageBody(category: string, amount: number, threshold: number, currency: string): string {
  const pct = Math.round(((amount - threshold) / threshold) * 100);
  return (
    `🚨 WealthLens Alert: You've overspent in ${category}!\n` +
    `Spent: ${currency}${amount.toLocaleString("en-IN")} | ` +
    `Budget: ${currency}${threshold.toLocaleString("en-IN")} (${pct}% over)\n` +
    `Open your dashboard to review. Reply STOP to unsubscribe.`
  );
}
