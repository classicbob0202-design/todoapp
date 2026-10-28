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
    const docs = await db.collection("tasks").find({ user_id: user.id }).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(docs.map((d) => withId(d)));
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const title = cleanTitle(body?.title);
  const planObjectId = toObjectId(body?.weeklyPlanId);
  if (!title) return badRequest("할 일 제목을 입력하세요");
  if (!planObjectId) return badRequest("연결할 주간 계획을 고르세요");
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    if (!(await db.collection("weeklyPlans").findOne({ _id: planObjectId, user_id: user.id }))) {
      return badRequest("없는 주간 계획이에요");
    }
    const task = {
      title,
      status: "todo",
      weeklyPlanId: planObjectId.toHexString(),
      createdAt: new Date().toISOString(),
      user_id: user.id,
    };
    const { insertedId } = await db.collection("tasks").insertOne({ ...task });
    return NextResponse.json({ id: insertedId.toHexString(), ...task }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
