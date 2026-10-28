"use client";

import type { YearGoal } from "@/lib/types";

type Props = {
  goals: YearGoal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function GoalPicker({ goals, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="goal-picker" className="text-sm font-semibold text-slate-700">
        보드에 보일 1년 목표
      </label>
      <select
        id="goal-picker"
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={goals.length === 0}
        className="field min-w-0 flex-1 sm:max-w-sm"
      >
        {goals.length === 0 && <option value="">1년 목표가 없어요</option>}
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.year} · {g.title}
          </option>
        ))}
      </select>
    </div>
  );
}
