import { NextResponse } from "next/server";
import { getDb, toObjectId, withId } from "@/lib/mongodb";
import { badRequest, cleanTitle, conflict, noDb, notFound, readJson, serverError, unauthorized } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const goalId = toObjectId(params.id);
  if (!goalId) return notFound("없는 1년 목표예요");
  const body = await readJson(req);
  if (!body) return badRequest("바꿀 내용이 없어요");

  const update: { title?: string; year?: number } = {};
  if ("title" in body) {
    const title = cleanTitle(body.title);
    if (!title) return badRequest("목표 제목을 입력하세요");
    update.title = title;
  }
  if ("year" in body) {
    const year = body.year;
    if (typeof year !== "number" || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return badRequest("연도가 올바르지 않아요");
    }
    update.year = year;
  }
  if (Object.keys(update).length === 0) return badRequest("바꿀 내용이 없어요");

  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    const doc = await db
      .collection("goals")
      .findOneAndUpdate({ _id: goalId, user_id: user.id }, { $set: update }, { returnDocument: "after" });
    if (!doc) return notFound("없는 1년 목표예요");
    return NextResponse.json(withId(doc));
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const goalId = toObjectId(params.id);
  if (!goalId) return notFound("없는 1년 목표예요");
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    if (!(await db.collection("goals").findOne({ _id: goalId, user_id: user.id }))) {
      return notFound("없는 1년 목표예요");
    }
    // 연결된 주간 계획이 남아 있으면 지우지 않음
    if (await db.collection("weeklyPlans").findOne({ goalId: goalId.toHexString() })) {
      return conflict("연결된 주간 계획을 먼저 옮기거나 지우세요");
    }
    const { deletedCount } = await db.collection("goals").deleteOne({ _id: goalId, user_id: user.id });
    if (!deletedCount) return notFound("없는 1년 목표예요");
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return serverError(err);
  }
}
