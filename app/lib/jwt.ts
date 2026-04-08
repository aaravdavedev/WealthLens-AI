/**
 * WealthLens AI — JWT Authentication Helpers
 * HS256, 7-day expiry, signed with JWT_SECRET env var.
 */

import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "wealthlens-dev-secret-change-in-production";
const EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRY, algorithm: "HS256" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JWTPayload;
}

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  // Also check cookie
  const cookieToken = req.cookies.get("wl_token")?.value;
  return cookieToken ?? null;
}

export function requireAuth(req: NextRequest): JWTPayload {
  const token = extractToken(req);
  if (!token) throw new Error("UNAUTHORIZED");
  return verifyToken(token);
}
