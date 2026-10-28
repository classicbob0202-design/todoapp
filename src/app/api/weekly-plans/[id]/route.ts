import { NextResponse } from "next/server";
import { getDb, toObjectId, withId } from "@/lib/mongodb";
import { badRequest, cleanTitle, conflict, noDb, notFound, readJson, serverError, unauthorized } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const planId = toObjectId(params.id);
  if (!planId) return notFound("없는 주간 계획이에요");
  const body = await readJson(req);
  if (!body) return badRequest("바꿀 내용이 없어요");

  const update: Record<string, string> = {};
  if ("title" in body) {
    const title = cleanTitle(body.title);
    if (!title) return badRequest("주간 계획 제목을 입력하세요");
    update.title = title;
  }
  if ("week" in body) {
    if (typeof body.week !== "string" || !/^\d{4}-W\d{2}$/.test(body.week)) return badRequest("주차가 올바르지 않아요");
    update.week = body.week;
  }
  let goalId = null;
  if ("goalId" in body) {
    goalId = toObjectId(body.goalId);
    if (!goalId) return badRequest("연결할 1년 목표를 고르세요");
    update.goalId = goalId.toHexString();
  }
  if (Object.keys(update).length === 0) return badRequest("바꿀 내용이 없어요");

  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    if (goalId && !(await db.collection("goals").findOne({ _id: goalId, user_id: user.id }))) {
      return badRequest("없는 1년 목표예요");
    }
    const doc = await db
      .collection("weeklyPlans")
      .findOneAndUpdate({ _id: planId, user_id: user.id }, { $set: update }, { returnDocument: "after" });
    if (!doc) return notFound("없는 주간 계획이에요");
    return NextResponse.json(withId(doc));
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const planId = toObjectId(params.id);
  if (!planId) return notFound("없는 주간 계획이에요");
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    if (!(await db.collection("weeklyPlans").findOne({ _id: planId, user_id: user.id }))) {
      return notFound("없는 주간 계획이에요");
    }
    // 연결된 할 일이 남아 있으면 지우지 않음
    if (await db.collection("tasks").findOne({ weeklyPlanId: planId.toHexString() })) {
      return conflict("연결된 할 일을 먼저 옮기거나 지우세요");
    }
    const { deletedCount } = await db.collection("weeklyPlans").deleteOne({ _id: planId, user_id: user.id });
    if (!deletedCount) return notFound("없는 주간 계획이에요");
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return serverError(err);
  }
}
