import { MongoClient, ObjectId, type Db } from "mongodb";

declare global {
  // 개발 서버가 다시 불러올 때마다 연결이 새로 생기지 않도록 전역에 보관
  // eslint-disable-next-line no-var -- 전역 선언은 var만 가능
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 접속 정보가 없으면 null을 돌려줘 API가 503으로 응답하게 함
export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri).connect().catch((err) => {
      globalThis._mongoClientPromise = undefined;
      throw err;
    });
  }
  const client = await globalThis._mongoClientPromise;
  return client.db(process.env.MONGODB_DB || "todoapp");
}

export function toObjectId(id: unknown): ObjectId | null {
  return typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// MongoDB 문서의 _id를 화면에서 쓰는 문자열 id로 바꿈
export function withId<T extends { _id: ObjectId }>(doc: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toHexString() };
}
