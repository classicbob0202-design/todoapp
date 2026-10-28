"use client";

import { useState, type FormEvent } from "react";
import ProgressBar from "@/components/ProgressBar";
import type { PlanChanges } from "@/hooks/useStore";
import { weeklyProgress } from "@/lib/progress";
import type { Task, WeeklyPlan, YearGoal } from "@/lib/types";

type Props = {
  goals: YearGoal[];
  plans: WeeklyPlan[];
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, changes: PlanChanges) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function WeeklyProgress({ plans, ...rest }: Props) {
  if (plans.length === 0) {
    return <p className="text-sm text-slate-500">주간 계획을 추가하면 진행률이 여기에 보여요.</p>;
  }
  const sorted = [...plans].sort((a, b) => b.week.localeCompare(a.week) || a.title.localeCompare(b.title));
  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((plan) => (
        <PlanRow key={plan.id} plan={plan} {...rest} />
      ))}
    </ul>
  );
}

function PlanRow({
  plan,
  goals,
  tasks,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
}: Omit<Props, "plans"> & { plan: WeeklyPlan }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [week, setWeek] = useState(plan.week);
  const [goalId, setGoalId] = useState(plan.goalId);

  const planTasks = tasks.filter((t) => t.weeklyPlanId === plan.id);
  const done = planTasks.filter((t) => t.status === "done").length;
  const percent = Math.round(weeklyProgress(tasks, plan.id) * 100);
  const goal = goals.find((g) => g.id === plan.goalId);
  const selected = plan.id === selectedId;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !week) return;
    if (await onUpdate(plan.id, { title: title.trim(), week, goalId })) setEditing(false);
  }

  if (editing) {
    return (
      <li>
        <form onSubmit={save} className="flex flex-col gap-2">
          <input
            autoFocus
            aria-label="주간 계획 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="field"
          />
          <input type="week" aria-label="주차" value={week} onChange={(e) => setWeek(e.target.value)} className="field" />
          <select aria-label="연결할 1년 목표" value={goalId} onChange={(e) => setGoalId(e.target.value)} className="field">
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.year} · {g.title}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-1">
            <button type="submit" className="btn-sm bg-indigo-50 text-indigo-700">
              저장
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-sm">
              취소
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`-mx-2 rounded-lg px-2 py-1 ${selected ? "bg-indigo-50" : ""}`}>
      {/* 누르면 보드가 이 주간 계획으로 바뀜 */}
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        aria-pressed={selected}
        className="block w-full text-left"
      >
        <span className="flex items-baseline justify-between gap-2 text-sm">
          <span className="min-w-0 truncate font-medium text-slate-800">{plan.title}</span>
          <span className="shrink-0 tabular-nums text-slate-600">
            {percent}% <span className="text-xs text-slate-400">({done}/{planTasks.length})</span>
          </span>
        </span>
        <span className="block truncate text-xs text-slate-500">
          {plan.week}
          {goal && ` · ${goal.year} ${goal.title}`}
        </span>
      </button>
      <ProgressBar label={`${plan.title} 진행률`} percent={percent} />
      <div className="mt-1 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => {
            setTitle(plan.title);
            setWeek(plan.week);
            setGoalId(plan.goalId);
            setEditing(true);
          }}
          className="btn-sm"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          aria-label={`${plan.title} 삭제`}
          className="btn-sm text-rose-600 hover:bg-rose-50"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
