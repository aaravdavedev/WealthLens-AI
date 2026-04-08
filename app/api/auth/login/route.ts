import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/app/lib/jwt";
import { rateLimit, getClientIp } from "@/app/lib/rate-limit";
import { users } from "@/app/api/auth/signup/route";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip + ":login", 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = users.get(email.toLowerCase());
    // Use constant-time comparison to prevent timing attacks
    const dummyHash = "$2a$12$invalidhashfortimingnormalization000000000000000000";
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    response.cookies.set("wl_token", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
