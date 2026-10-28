"use client";

import { useState, type FormEvent } from "react";
import ProgressBar from "@/components/ProgressBar";
import type { GoalChanges } from "@/hooks/useStore";
import { goalProgress } from "@/lib/progress";
import type { Task, WeeklyPlan, YearGoal } from "@/lib/types";

type Props = {
  goals: YearGoal[];
  plans: WeeklyPlan[];
  tasks: Task[];
  onUpdate: (id: string, changes: GoalChanges) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function GoalProgress({ goals, plans, tasks, onUpdate, onDelete }: Props) {
  if (goals.length === 0) {
    return <p className="text-sm text-slate-500">1년 목표를 추가하면 진행률이 여기에 보여요.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {goals.map((goal) => (
        <GoalRow key={goal.id} goal={goal} plans={plans} tasks={tasks} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function GoalRow({
  goal,
  plans,
  tasks,
  onUpdate,
  onDelete,
}: Omit<Props, "goals"> & { goal: YearGoal }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [year, setYear] = useState(goal.year);

  const planIds = new Set(plans.filter((p) => p.goalId === goal.id).map((p) => p.id));
  const goalTasks = tasks.filter((t) => planIds.has(t.weeklyPlanId));
  const done = goalTasks.filter((t) => t.status === "done").length;
  const percent = Math.round(goalProgress(tasks, plans, goal.id) * 100);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (await onUpdate(goal.id, { title: title.trim(), year })) setEditing(false);
  }

  if (editing) {
    return (
      <li>
        <form onSubmit={save} className="flex flex-col gap-2">
          <input
            autoFocus
            aria-label="목표 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="field"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="연도"
              value={year}
              min={2000}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
              className="field w-24"
            />
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
    <li>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-medium text-slate-800">
          <span className="mr-1 text-xs text-slate-400">{goal.year}</span>
          {goal.title}
        </span>
        <span className="shrink-0 tabular-nums text-slate-600">
          {percent}% <span className="text-xs text-slate-400">({done}/{goalTasks.length})</span>
        </span>
      </div>
      <ProgressBar label={`${goal.title} 진행률`} percent={percent} tone="emerald" />
      <div className="mt-1 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => {
            setTitle(goal.title);
            setYear(goal.year);
            setEditing(true);
          }}
          className="btn-sm"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(goal.id)}
          aria-label={`${goal.title} 삭제`}
          className="btn-sm text-rose-600 hover:bg-rose-50"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
