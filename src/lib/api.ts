import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function noDb() {
  return NextResponse.json({ error: "저장 서버에 연결할 수 없어요" }, { status: 503 });
}

export function serverError(err: unknown) {
  console.error(err);
  return NextResponse.json({ error: "저장 서버에 연결할 수 없어요" }, { status: 503 });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function cleanTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const title = value.trim();
  return title && title.length <= 200 ? title : null;
}
