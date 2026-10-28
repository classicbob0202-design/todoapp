import { NextResponse, type NextRequest } from "next/server";

// 세션 쿠키가 없으면 화면 요청을 로그인 페이지로 보냄.
// 세션이 진짜 유효한지는 DB를 보는 API가 판단(401)하고, 화면은 401을 받으면 로그인으로 이동함
export function middleware(req: NextRequest) {
  if (!req.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|auth|api|_next|favicon.ico).*)"],
};
