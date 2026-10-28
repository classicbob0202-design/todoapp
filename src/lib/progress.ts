import type { Task, WeeklyPlan } from "@/lib/types";

function ratio(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return tasks.filter((t) => t.status === "done").length / tasks.length;
}

// 주간 진행률 = 그 주간 계획의 done 할 일 수 / 전체 할 일 수 (0~1, 할 일이 없으면 0)
export function weeklyProgress(tasks: Task[], weeklyPlanId: string): number {
  return ratio(tasks.filter((t) => t.weeklyPlanId === weeklyPlanId));
}

// 1년 목표 진행률 = 연결된 주간 계획들의 done 합 / 전체 합
// 주간 진행률의 평균이 아니라서, 할 일이 없는 주가 진행률을 깎지 않음
export function goalProgress(tasks: Task[], plans: WeeklyPlan[], goalId: string): number {
  const planIds = new Set(plans.filter((p) => p.goalId === goalId).map((p) => p.id));
  return ratio(tasks.filter((t) => planIds.has(t.weeklyPlanId)));
}
