"use client";

import { useState, type FormEvent } from "react";
import type { YearGoal } from "@/lib/types";
import { currentIsoWeek } from "@/lib/week";

type Props = {
  goals: YearGoal[];
  onAdd: (title: string, week: string, goalId: string) => Promise<boolean>;
};

export default function WeeklyPlanForm({ goals, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [week, setWeek] = useState(currentIsoWeek);
  const [goalId, setGoalId] = useState("");
  const [saving, setSaving] = useState(false);

  // 1년 목표가 없으면 주간 계획을 만들 수 없음
  const noGoals = goals.length === 0;
  const selectedGoal = goals.some((g) => g.id === goalId) ? goalId : (goals[0]?.id ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedGoal || !week) return;
    setSaving(true);
    if (await onAdd(title.trim(), week, selectedGoal)) setTitle("");
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor="plan-title">
        주간 계획
      </label>
      <input
        id="plan-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={noGoals ? "먼저 1년 목표를 추가하세요" : "예: 랜딩 페이지 완성"}
        maxLength={200}
        disabled={noGoals}
        className="field"
      />
      <div className="flex gap-2">
        <input
          type="week"
          aria-label="주차"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          disabled={noGoals}
          className="field w-40"
        />
        <select
          aria-label="연결할 1년 목표"
          value={selectedGoal}
          onChange={(e) => setGoalId(e.target.value)}
          disabled={noGoals}
          className="field min-w-0 flex-1"
        >
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.year} · {g.title}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={saving || noGoals || !title.trim() || !week} className="btn self-end">
        주간 계획 추가
      </button>
    </form>
  );
}
