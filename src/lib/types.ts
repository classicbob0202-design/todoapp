export const STATUSES = ["todo", "doing", "done"] as const;
export type Status = (typeof STATUSES)[number];

export type YearGoal = { id: string; title: string; year: number };
export type WeeklyPlan = { id: string; title: string; week: string; goalId: string };
export type Task = {
  id: string;
  title: string;
  status: Status;
  weeklyPlanId: string;
  createdAt: string;
};

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}
