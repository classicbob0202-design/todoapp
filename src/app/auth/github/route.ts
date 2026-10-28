import { NextResponse } from "next/server";
import { STATE_COOKIE, cookieOptions, newToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GitHub 로그인 화면으로 보냄. state 값을 쿠키에 저장해 콜백에서 위조 요청을 걸러 냄
export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GITHUB_CLIENT_ID가 설정되지 않았어요" }, { status: 500 });
  }
  const origin = new URL(req.url).origin;
  const state = newToken();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/auth/github/callback`);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, cookieOptions(10 * 60));
  return res;
}
