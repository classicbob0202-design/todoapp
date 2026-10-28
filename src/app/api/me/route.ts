import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { noDb, serverError, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return noDb();
    const user = await getSessionUser(db);
    if (!user) return unauthorized();
    return NextResponse.json(user);
  } catch (err) {
    return serverError(err);
  }
}
