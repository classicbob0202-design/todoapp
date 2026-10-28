import type { Task, WeeklyPlan, YearGoal } from "@/lib/types";

export const VIEWS = ["day", "week", "year"] as const;
export type View = (typeof VIEWS)[number];

export function isView(value: unknown): value is View {
  return typeof value === "string" && (VIEWS as readonly string[]).includes(value);
}

// ISO 시각을 사용자 기준 로컬 날짜(YYYY-MM-DD)로 바꿈
export function localDate(value: string | Date): string {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Scope = { planId: string | null; goalId: string | null; today: string };

// 일: 오늘 만든 할 일 / 주: 고른 주간 계획의 할 일 / 년: 고른 1년 목표에 연결된 모든 할 일
export function filterBoardTasks(tasks: Task[], plans: WeeklyPlan[], view: View, scope: Scope): Task[] {
  if (view === "day") return tasks.filter((t) => localDate(t.createdAt) === scope.today);
  if (view === "week") return tasks.filter((t) => t.weeklyPlanId === scope.planId);
  const planIds = new Set(plans.filter((p) => p.goalId === scope.goalId).map((p) => p.id));
  return tasks.filter((t) => planIds.has(t.weeklyPlanId));
}

// 기본 1년 목표: 올해 목표 중 첫 번째, 없으면 첫 목표
export function defaultGoalId(goals: YearGoal[], year = new Date().getFullYear()): string | null {
  return (goals.find((g) => g.year === year) ?? goals[0])?.id ?? null;
}
