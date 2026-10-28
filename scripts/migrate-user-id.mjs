// 로그인 기능 이전에 만든 데이터(user_id 없음)를 GitHub 사용자 한 명에게 넘기는 마이그레이션.
// 사용법: 그 GitHub 계정으로 한 번 로그인한 뒤  npm run migrate:user-id -- <GitHub username>
// 같은 명령을 다시 실행해도 user_id가 없는 문서만 바꾸므로 안전함.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // .env.local이 없으면 환경 변수만 사용
  }
}

loadEnv();
const username = process.argv[2];
if (!username) {
  console.error("사용법: npm run migrate:user-id -- <GitHub username>");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI가 없어요 (.env.local 확인)");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "todoapp");
  const user = await db.collection("users").findOne({ username });
  if (!user) {
    console.error(`'${username}' 사용자가 없어요. 먼저 그 계정으로 앱에 한 번 로그인하세요.`);
    process.exit(1);
  }
  const userId = user._id.toHexString();
  for (const name of ["goals", "weeklyPlans", "tasks"]) {
    const { modifiedCount } = await db
      .collection(name)
      .updateMany({ user_id: { $exists: false } }, { $set: { user_id: userId } });
    await db.collection(name).createIndex({ user_id: 1 });
    console.log(`${name}: ${modifiedCount}개에 user_id 추가`);
  }
  // 세션 토큰 조회용 인덱스 + 만료 시각이 지나면 MongoDB가 자동 삭제
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("users").createIndex({ githubId: 1 }, { unique: true });
  console.log("인덱스 준비 완료");
} finally {
  await client.close();
}
