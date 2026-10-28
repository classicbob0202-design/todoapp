"use client";

import { useState, type FormEvent } from "react";
import type { WeeklyPlan } from "@/lib/types";

type Props = {
  plans: WeeklyPlan[];
  defaultPlanId: string | null;
  onAdd: (title: string, weeklyPlanId: string) => Promise<boolean>;
};

export default function TaskForm({ plans, defaultPlanId, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [planId, setPlanId] = useState(defaultPlanId ?? "");
  const [saving, setSaving] = useState(false);

  const noPlans = plans.length === 0;
  const selectedPlan = plans.some((p) => p.id === planId) ? planId : (plans[0]?.id ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedPlan) return;
    setSaving(true);
    if (await onAdd(title.trim(), selectedPlan)) setTitle("");
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="task-title">
        할 일
      </label>
      <input
        id="task-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={noPlans ? "먼저 주간 계획을 추가하세요" : "새 할 일"}
        maxLength={200}
        disabled={noPlans}
        className="field min-w-0 flex-1"
      />
      <select
        aria-label="연결할 주간 계획"
        value={selectedPlan}
        onChange={(e) => setPlanId(e.target.value)}
        disabled={noPlans}
        className="field sm:w-56"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.week} · {p.title}
          </option>
        ))}
      </select>
      <button type="submit" disabled={saving || noPlans || !title.trim()} className="btn">
        할 일 추가
      </button>
    </form>
  );
}
