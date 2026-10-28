import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultGoalId, filterBoardTasks, localDate } from "./filter.ts";
import type { Task, WeeklyPlan, YearGoal } from "./types.ts";

function task(id: string, weeklyPlanId: string, createdAt: Date): Task {
  return { id, title: id, status: "todo", weeklyPlanId, createdAt: createdAt.toISOString() };
}

const plans: WeeklyPlan[] = [
  { id: "w1", title: "w1", week: "2026-W44", goalId: "g1" },
  { id: "w2", title: "w2", week: "2026-W45", goalId: "g1" },
  { id: "w3", title: "w3", week: "2026-W44", goalId: "g2" },
];
const today = new Date(2026, 9, 28, 9, 0);
const yesterday = new Date(2026, 9, 27, 23, 30);
const tasks = [task("a", "w1", today), task("b", "w2", yesterday), task("c", "w3", today)];
const scope = { planId: "w1", goalId: "g1", today: localDate(today) };

const ids = (list: Task[]) => list.map((t) => t.id);

test("일: 오늘(로컬 날짜) 만든 할 일만", () => {
  assert.deepEqual(ids(filterBoardTasks(tasks, plans, "day", scope)), ["a", "c"]);
});

test("주: 고른 주간 계획의 할 일만", () => {
  assert.deepEqual(ids(filterBoardTasks(tasks, plans, "week", scope)), ["a"]);
});

test("년: 고른 1년 목표에 연결된 모든 주간 계획의 할 일", () => {
  assert.deepEqual(ids(filterBoardTasks(tasks, plans, "year", scope)), ["a", "b"]);
});

test("기본 1년 목표: 올해 목표 우선, 없으면 첫 목표", () => {
  const goals: YearGoal[] = [
    { id: "g1", title: "g1", year: 2025 },
    { id: "g2", title: "g2", year: 2026 },
  ];
  assert.equal(defaultGoalId(goals, 2026), "g2");
  assert.equal(defaultGoalId(goals, 2030), "g1");
  assert.equal(defaultGoalId([], 2026), null);
});
