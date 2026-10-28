import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Db } from "mongodb";

export const SESSION_COOKIE = "session";
export const STATE_COOKIE = "oauth_state";
export const SESSION_DAYS = 30;

export type SessionUser = { id: string; username: string; avatar_url: string };

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

// 세션 쿠키로 로그인한 사용자를 찾음 (만료됐거나 없으면 null)
export async function getSessionUser(db: Db): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.collection("sessions").findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db.collection("users").findOne({ _id: session.userId });
  if (!user) return null;
  return { id: user._id.toHexString(), username: user.username, avatar_url: user.avatar_url };
}
