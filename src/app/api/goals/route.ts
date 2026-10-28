import { NextResponse } from "next/server";
import { getDb, withId } from "@/lib/mongodb";
import { badRequest, cleanTitle, noDb, readJson, serverError, unauthorized } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    const docs = await db.collection("goals").find({ user_id: user.id }).sort({ year: -1, _id: 1 }).toArray();
    return NextResponse.json(docs.map((d) => withId(d)));
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const title = cleanTitle(body?.title);
  const year = body?.year;
  if (!title) return badRequest("목표 제목을 입력하세요");
  if (typeof year !== "number" || !Number.isInteger(year) || year < 2000 || year > 2100) {
    return badRequest("연도가 올바르지 않아요");
  }
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    const { insertedId } = await db.collection("goals").insertOne({ title, year, user_id: user.id });
    return NextResponse.json({ id: insertedId.toHexString(), title, year }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
