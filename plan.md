# 프로젝트 계획: 할 일 관리 앱

- 상태: P0(1~6단계) + 검토 반영(7~9단계) + 10단계 중 기간별 필터 구현 완료 (2026-10-28) · "오늘 보기"는 일 탭으로 대체
- 근거 문서: `PRD.md`
- 작업 위치: `C:\Users\bobby\Desktop\docs\docs2`

## 0. 플랜 검토 (시니어 PM 관점, 우선순위 순)
1. [문제] 보드가 모든 주의 할 일을 한꺼번에 보여 줘서, 주간 진행률(PRD.md:41-43)과 보드가 서로 다른 범위를 봄
   / [수정 방향] 보드 기본 범위를 "이번 주 주간 계획"으로 한정하고 주간 계획 선택기를 P0로 올림 → 7단계
2. [문제] 1년 목표·주간 계획을 P0에서 수정·삭제할 수 없어, 오타·잘못 만든 항목·테스트 데이터를 고칠 방법이 없음
   / [수정 방향] 수정과 "하위 항목이 없을 때만 삭제"를 P0로 올리고, 하위가 있으면 삭제를 막음 → 8단계
3. [문제] User Flow 7(1년 목표 진척 확인, PRD.md:19)을 구현하는 단계가 없고, "평균" 집계는 할 일 0개인 주가 진척을 깎음
   / [수정 방향] 1년 목표 진행률 = 연결된 할 일 done 합 / 전체 합으로 정의하고 P0에 표시 → 9단계

## 1. 요구 사항 요약
* 할 일 CRUD, 상태 todo/doing/done (PRD.md:24-30)
* 상태별 3컬럼 보드 + 드래그 앤 드롭으로 상태 변경, 즉시 저장 (PRD.md:31-33)
* 기간 구조: 할 일(일일) → 주간 계획 → 1년 목표, 하위는 상위 하나에만 연결 (PRD.md:34-40)
* 주간 진행률 = 그 주 done 수 / 그 주 전체 수, 변경 즉시 재계산 (PRD.md:41-43)
* P1: 주간 계획·1년 목표 CRUD, 1년 목표 진행률, 기간별 필터 (PRD.md:45-49)

### PRD 보완이 필요한 점
* User Flow 1~2단계(목표·주간 계획 생성, PRD.md:13-14)가 P0인데, 주간 계획·1년 목표 CRUD는 P1(PRD.md:46-47)로 분류됨
  → 계획: P0에 생성·목록·수정·삭제(하위 없을 때만) 포함 (검토 2번)
* User Flow 7(PRD.md:19)은 P0 흐름인데 1년 목표 진행률은 P1(PRD.md:48)
  → 계획: 1년 목표 진행률 표시를 P0로 올림 (검토 3번)
* "해당 주"(PRD.md:42)의 범위가 모호함 → 계획: 주간 계획 하나 단위로 계산
* 저장 방식·로그인 언급 없음 → 계획: 1인용(로그인 없음), MongoDB Atlas에 저장

## 2. 기술 선택
* Next.js 14 App Router + TypeScript + Tailwind (linknamu와 같은 스택)
* 드래그 앤 드롭: `@dnd-kit/core` (키보드·터치 지원)
* 저장: MongoDB Atlas + Node 드라이버 `mongodb`
  * linknamu와 같은 클러스터 사용, DB 이름만 `todoapp`으로 분리
  * 접속 정보는 `.env.local`의 `MONGODB_URI`, `MONGODB_DB` (커밋 금지, `.env.example`만 커밋)
  * 브라우저 → Next.js API(Route Handler) → MongoDB, 브라우저는 DB에 직접 접근하지 않음
* 날짜: 주 시작은 월요일, 주 식별자 `YYYY-Www`(ISO 주차)

## 3. 데이터 모델 (`src/lib/types.ts`)
```ts
type Status = "todo" | "doing" | "done";
type YearGoal   = { id: string; title: string; year: number };
type WeeklyPlan = { id: string; title: string; week: string; goalId: string };
type Task       = { id: string; title: string; status: Status; weeklyPlanId: string; createdAt: string };
```
* 컬렉션: `goals`, `weeklyPlans`, `tasks` (id는 MongoDB `_id` 문자열로 변환해 전달)
* 인덱스: `weeklyPlans.goalId`, `tasks.weeklyPlanId`

## 4. 구현 단계

### 1단계: 프로젝트 생성 ✅
* `create-next-app`으로 docs2에 생성, `@dnd-kit/core`, `mongodb` 설치
* `.env.example` 작성, `.env.local`에 접속 문자열 입력
* 완료 기준: `npm run dev` 후 http://localhost:3001 에서 페이지가 에러 없이 열림

### 2단계: 데이터 계층 (DB + API) ✅
* `src/lib/types.ts`, `src/lib/mongodb.ts`, `src/lib/progress.ts`, `src/lib/api.ts`
* API: `src/app/api/goals/route.ts`, `src/app/api/weekly-plans/route.ts`, `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`
* `src/hooks/useStore.ts`: 낙관적 업데이트, 실패 시 되돌리고 안내
* 완료 기준: progress 단위 테스트 통과, 잘못된 입력은 400

### 3단계: 목표·주간 계획 생성 ✅
* `src/components/GoalForm.tsx`, `src/components/WeeklyPlanForm.tsx`
* 완료 기준: 목표 없이 주간 계획 생성 불가, 새로고침 후에도 목록 유지

### 4단계: 할 일 CRUD ✅
* `src/components/TaskForm.tsx`, `src/components/TaskCard.tsx`
* 완료 기준: 빈 제목 저장 불가, 생성·수정·삭제가 새로고침 후에도 유지

### 5단계: 보드 + 드래그 앤 드롭 ✅
* `src/components/Board.tsx`, `src/components/Column.tsx`
* 완료 기준: 컬럼 이동 시 status 저장, 키보드로도 이동 가능

### 6단계: 주간 진행률 ✅
* `src/components/WeeklyProgress.tsx`
* 완료 기준: 생성·삭제·상태 변경 직후 숫자가 바뀜

### 7단계: 보드 범위를 주간 계획으로 한정 (검토 1번) ✅
* `src/components/PlanPicker.tsx`(신규): 주간 계획 선택, 기본값은 이번 주(`currentIsoWeek`)의 첫 주간 계획, 없으면 가장 최근 주
* `src/app/page.tsx`: 선택한 주간 계획의 할 일만 `Board`에 전달, `TaskForm`의 기본 연결 대상도 같은 계획
* 선택값은 URL 쿼리(`?plan=<id>`)로 유지해 새로고침해도 같은 주가 보임
* 완료 기준: 주간 계획 A·B에 할 일을 하나씩 만들면 A 선택 시 보드에 A 것만 보이고, 진행률 숫자와 보드 카드 수가 일치

### 8단계: 목표·주간 계획 수정·삭제 (검토 2번) ✅
* API: `src/app/api/goals/[id]/route.ts`, `src/app/api/weekly-plans/[id]/route.ts` (PATCH 제목·연도·주차·연결 목표, DELETE)
* DELETE는 하위 항목(주간 계획 또는 할 일)이 있으면 409와 "하위 항목을 먼저 옮기거나 지우세요" 응답
* 화면: 목표·주간 계획 목록에 수정·삭제 버튼, 409면 안내 문구 표시
* 완료 기준: 할 일이 연결된 주간 계획 삭제 시 409, 비운 뒤에는 삭제됨, 수정은 새로고침 후에도 유지

### 9단계: 1년 목표 진행률 (검토 3번) ✅
* `src/lib/progress.ts`에 `goalProgress(tasks, plans, goalId)` 추가: 연결된 주간 계획들의 done 합 / 전체 합 (할 일 0개면 0)
* `src/components/GoalProgress.tsx`(신규): 목표별 진행 막대, `WeeklyProgress` 위에 표시
* 완료 기준: 단위 테스트 — 주간 계획 2개(2개 중 2 done, 할 일 0개) → 100% (평균이었다면 50%)

### 10단계 (P1, 승인 시에만)
* 기간(일/주/년)별 필터 보기
* 할 일 생성일 기준 "오늘" 보기

## 5. 위험 요소와 대응
* 하위 항목이 있는 상위 항목 삭제 → API에서 409로 막고 안내 (8단계)
* DB 연결 실패·접속 정보 없음 → API가 503 응답, 화면에 "저장 서버에 연결할 수 없음" 표시
* 로그인이 없어 배포하면 주소를 아는 누구나 수정 가능 → 현재 범위는 로컬 사용, 배포 전 인증 추가 여부 결정
* 접속 비밀번호 유출 → `.env.local`은 .gitignore 확인 후 커밋, 채팅·로그에 값 출력 금지
* 드래그 중 API 실패 → 카드를 원래 컬럼으로 되돌림
* 이번 주 주간 계획이 없을 때 빈 보드 → PlanPicker가 가장 최근 주로 대체하고 "이번 주 계획 없음" 표시 (7단계)

## 6. 검증 방법
* `npm test`, `npm run lint`, `npm run build` 통과
* 브라우저에서 User Flow 1~7(PRD.md:13-19) 순서대로 직접 실행, 7번은 1년 목표 진행률로 확인
* 새로고침·다른 브라우저에서 열어도 같은 데이터가 보임 (Atlas에 저장 확인)
* 모바일 폭(375px)에서 보드가 가로 스크롤 없이 세로로 쌓임
