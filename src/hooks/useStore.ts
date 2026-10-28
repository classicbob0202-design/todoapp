"use client";

import { useCallback, useEffect, useState } from "react";
import type { Status, Task, WeeklyPlan, YearGoal } from "@/lib/types";

export type SessionUser = { id: string; username: string; avatar_url: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  // 세션이 만료됐거나 없으면 로그인 화면으로
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("로그인이 필요해요");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "저장 서버에 연결할 수 없어요");
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export type TaskChanges = Partial<Pick<Task, "title" | "status" | "weeklyPlanId">>;
export type GoalChanges = Partial<Pick<YearGoal, "title" | "year">>;
export type PlanChanges = Partial<Pick<WeeklyPlan, "title" | "week" | "goalId">>;

export function useStore() {
  const [goals, setGoals] = useState<YearGoal[]>([]);
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      request<SessionUser>("/api/me"),
      request<YearGoal[]>("/api/goals"),
      request<WeeklyPlan[]>("/api/weekly-plans"),
      request<Task[]>("/api/tasks"),
    ])
      .then(([u, g, p, t]) => {
        setUser(u);
        setGoals(g);
        setPlans(p);
        setTasks(t);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addGoal = useCallback(async (title: string, year: number) => {
    try {
      const goal = await request<YearGoal>("/api/goals", { method: "POST", body: JSON.stringify({ title, year }) });
      setGoals((prev) => [...prev, goal]);
      setError(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  const addWeeklyPlan = useCallback(async (title: string, week: string, goalId: string) => {
    try {
      const plan = await request<WeeklyPlan>("/api/weekly-plans", {
        method: "POST",
        body: JSON.stringify({ title, week, goalId }),
      });
      setPlans((prev) => [...prev, plan]);
      setError(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  const addTask = useCallback(async (title: string, weeklyPlanId: string) => {
    try {
      const task = await request<Task>("/api/tasks", { method: "POST", body: JSON.stringify({ title, weeklyPlanId }) });
      setTasks((prev) => [...prev, task]);
      setError(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  // 화면에 먼저 반영하고, 저장에 실패하면 원래대로 되돌림
  const updateTask = useCallback(
    async (id: string, changes: TaskChanges) => {
      const before = tasks.find((t) => t.id === id);
      if (!before) return;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
      try {
        await request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
        setError(null);
      } catch (err) {
        setTasks((prev) => prev.map((t) => (t.id === id ? before : t)));
        setError((err as Error).message);
      }
    },
    [tasks],
  );

  const moveTask = useCallback((id: string, status: Status) => updateTask(id, { status }), [updateTask]);

  const deleteTask = useCallback(
    async (id: string) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return;
      const removed = tasks[index];
      setTasks((prev) => prev.filter((t) => t.id !== id));
      try {
        await request<null>(`/api/tasks/${id}`, { method: "DELETE" });
        setError(null);
      } catch (err) {
        setTasks((prev) => [...prev.slice(0, index), removed, ...prev.slice(index)]);
        setError((err as Error).message);
      }
    },
    [tasks],
  );

  const updateGoal = useCallback(
    async (id: string, changes: GoalChanges) => {
      const before = goals.find((g) => g.id === id);
      if (!before) return false;
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...changes } : g)));
      try {
        await request<YearGoal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
        setError(null);
        return true;
      } catch (err) {
        setGoals((prev) => prev.map((g) => (g.id === id ? before : g)));
        setError((err as Error).message);
        return false;
      }
    },
    [goals],
  );

  const updateWeeklyPlan = useCallback(
    async (id: string, changes: PlanChanges) => {
      const before = plans.find((p) => p.id === id);
      if (!before) return false;
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
      try {
        await request<WeeklyPlan>(`/api/weekly-plans/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
        setError(null);
        return true;
      } catch (err) {
        setPlans((prev) => prev.map((p) => (p.id === id ? before : p)));
        setError((err as Error).message);
        return false;
      }
    },
    [plans],
  );

  // 하위 항목이 있으면 서버가 409로 거절하므로, 응답을 받은 뒤에 화면에서 지움
  const deleteGoal = useCallback(async (id: string) => {
    try {
      await request<null>(`/api/goals/${id}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const deleteWeeklyPlan = useCallback(async (id: string) => {
    try {
      await request<null>(`/api/weekly-plans/${id}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return {
    user,
    goals,
    plans,
    tasks,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    addWeeklyPlan,
    updateWeeklyPlan,
    deleteWeeklyPlan,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
  };
}
