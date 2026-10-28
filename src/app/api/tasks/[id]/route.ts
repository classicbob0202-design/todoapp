import { NextResponse } from "next/server";
import { getDb, toObjectId, withId } from "@/lib/mongodb";
import { badRequest, cleanTitle, noDb, readJson, serverError, unauthorized } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { isStatus } from "@/lib/types";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const taskId = toObjectId(params.id);
  if (!taskId) return badRequest("없는 할 일이에요");
  const body = await readJson(req);
  if (!body) return badRequest("바꿀 내용이 없어요");

  const update: Record<string, string> = {};
  if ("title" in body) {
    const title = cleanTitle(body.title);
    if (!title) return badRequest("할 일 제목을 입력하세요");
    update.title = title;
  }
  if ("status" in body) {
    if (!isStatus(body.status)) return badRequest("상태는 todo, doing, done 중 하나예요");
    update.status = body.status;
  }
  let planId = null;
  if ("weeklyPlanId" in body) {
    planId = toObjectId(body.weeklyPlanId);
    if (!planId) return badRequest("연결할 주간 계획을 고르세요");
    update.weeklyPlanId = planId.toHexString();
  }
  if (Object.keys(update).length === 0) return badRequest("바꿀 내용이 없어요");

  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    if (planId && !(await db.collection("weeklyPlans").findOne({ _id: planId, user_id: user.id }))) {
      return badRequest("없는 주간 계획이에요");
    }
    const doc = await db
      .collection("tasks")
      .findOneAndUpdate({ _id: taskId, user_id: user.id }, { $set: update }, { returnDocument: "after" });
    if (!doc) return NextResponse.json({ error: "없는 할 일이에요" }, { status: 404 });
    return NextResponse.json(withId(doc));
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const taskId = toObjectId(params.id);
  if (!taskId) return badRequest("없는 할 일이에요");
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    const { deletedCount } = await db.collection("tasks").deleteOne({ _id: taskId, user_id: user.id });
    if (!deletedCount) return NextResponse.json({ error: "없는 할 일이에요" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return serverError(err);
  }
}
