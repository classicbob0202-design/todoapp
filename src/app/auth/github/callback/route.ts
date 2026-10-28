import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS, STATE_COOKIE, cookieOptions, newToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function fail(origin: string, reason: string) {
  const res = NextResponse.redirect(`${origin}/login?error=${reason}`);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = cookies().get(STATE_COOKIE)?.value;
  if (!code || !state || state !== savedState) return fail(origin, "state");

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(origin, "config");

  try {
    // 받은 code를 access token으로 바꿈
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/auth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return fail(origin, "token");

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "todoapp",
      },
    });
    if (!userRes.ok) return fail(origin, "profile");
    const profile = await userRes.json();

    const db = await getDb();
    if (!db) return fail(origin, "db");

    // GitHub 사용자 번호로 찾아서 username, avatar_url을 저장(있으면 갱신)
    const user = await db.collection("users").findOneAndUpdate(
      { githubId: profile.id },
      {
        $set: { username: profile.login, avatar_url: profile.avatar_url, updatedAt: new Date() },
        $setOnInsert: { githubId: profile.id, createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (!user) return fail(origin, "db");

    const token = newToken();
    const maxAge = SESSION_DAYS * 24 * 60 * 60;
    await db.collection("sessions").insertOne({
      token,
      userId: user._id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + maxAge * 1000),
    });

    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set(SESSION_COOKIE, token, cookieOptions(maxAge));
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err) {
    console.error(err);
    return fail(origin, "server");
  }
}
