import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/app/lib/jwt";
import { rateLimit, getClientIp } from "@/app/lib/rate-limit";

// In-memory user store (demo-grade; swap for DB in production)
export const users: Map<string, { id: string; name: string; email: string; passwordHash: string }> = new Map();

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password } = body as { name?: string; email?: string; password?: string };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (users.has(email.toLowerCase())) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    users.set(email.toLowerCase(), { id: userId, name, email: email.toLowerCase(), passwordHash });

    const token = signToken({ userId, email: email.toLowerCase(), name });
    const response = NextResponse.json({ token, user: { id: userId, name, email: email.toLowerCase() } }, { status: 201 });
    response.cookies.set("wl_token", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
