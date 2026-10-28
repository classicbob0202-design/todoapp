import { NextResponse } from "next/server";
import { getDb, toObjectId, withId } from "@/lib/mongodb";
import { badRequest, cleanTitle, noDb, readJson, serverError, unauthorized } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    const docs = await db.collection("weeklyPlans").find({ user_id: user.id }).sort({ week: -1, _id: 1 }).toArray();
    return NextResponse.json(docs.map((d) => withId(d)));
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const title = cleanTitle(body?.title);
  const week = body?.week;
  const goalObjectId = toObjectId(body?.goalId);
  if (!title) return badRequest("주간 계획 제목을 입력하세요");
  if (typeof week !== "string" || !/^\d{4}-W\d{2}$/.test(week)) return badRequest("주차가 올바르지 않아요");
  if (!goalObjectId) return badRequest("연결할 1년 목표를 고르세요");
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    // 하위 항목은 실제로 있는 (본인의) 상위 항목에만 연결
    if (!(await db.collection("goals").findOne({ _id: goalObjectId, user_id: user.id }))) {
      return badRequest("없는 1년 목표예요");
    }
    const goalId = goalObjectId.toHexString();
    const { insertedId } = await db.collection("weeklyPlans").insertOne({ title, week, goalId, user_id: user.id });
    return NextResponse.json({ id: insertedId.toHexString(), title, week, goalId }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
