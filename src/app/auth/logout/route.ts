import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// 세션 문서를 DB에서 지우고 쿠키도 삭제해 세션을 완전히 없앰
export async function POST(req: Request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const db = await getDb();
      await db?.collection("sessions").deleteOne({ token });
    } catch (err) {
      console.error(err);
    }
  }
  const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
