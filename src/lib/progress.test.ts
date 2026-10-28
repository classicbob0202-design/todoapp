import { test } from "node:test";
import assert from "node:assert/strict";
import { goalProgress, weeklyProgress } from "./progress.ts";
import type { Task, WeeklyPlan } from "./types.ts";

function task(id: string, weeklyPlanId: string, status: Task["status"]): Task {
  return { id, title: id, status, weeklyPlanId, createdAt: "2026-10-28T00:00:00.000Z" };
}

function plan(id: string, goalId: string): WeeklyPlan {
  return { id, title: id, week: "2026-W44", goalId };
}

test("할 일이 없으면 0", () => {
  assert.equal(weeklyProgress([], "w1"), 0);
});

test("2개 중 1개 done이면 0.5", () => {
  assert.equal(weeklyProgress([task("a", "w1", "done"), task("b", "w1", "doing")], "w1"), 0.5);
});

test("다른 주간 계획의 할 일은 세지 않음", () => {
  const tasks = [task("a", "w1", "done"), task("b", "w2", "todo"), task("c", "w2", "todo")];
  assert.equal(weeklyProgress(tasks, "w1"), 1);
});

test("1년 목표: 할 일 없는 주간 계획은 진행률을 깎지 않음", () => {
  const plans = [plan("w1", "g1"), plan("w2", "g1")];
  const tasks = [task("a", "w1", "done"), task("b", "w1", "done")];
  assert.equal(goalProgress(tasks, plans, "g1"), 1);
});

test("1년 목표: 연결된 주간 계획들의 done 합 / 전체 합", () => {
  const plans = [plan("w1", "g1"), plan("w2", "g1"), plan("w3", "g2")];
  const tasks = [
    task("a", "w1", "done"),
    task("b", "w2", "todo"),
    task("c", "w2", "doing"),
    task("d", "w3", "done"),
  ];
  assert.equal(goalProgress(tasks, plans, "g1"), 1 / 3);
});

test("1년 목표: 연결된 할 일이 없으면 0", () => {
  assert.equal(goalProgress([], [plan("w1", "g1")], "g1"), 0);
});
