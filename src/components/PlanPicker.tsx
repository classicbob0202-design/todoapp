"use client";

import type { WeeklyPlan } from "@/lib/types";
import { currentIsoWeek } from "@/lib/week";

// 기본 주간 계획: 이번 주 계획 중 첫 번째, 없으면 가장 최근 주의 계획
export function defaultPlanId(plans: WeeklyPlan[]): string | null {
  if (plans.length === 0) return null;
  const thisWeek = plans.find((p) => p.week === currentIsoWeek());
  if (thisWeek) return thisWeek.id;
  return [...plans].sort((a, b) => b.week.localeCompare(a.week))[0].id;
}

type Props = {
  plans: WeeklyPlan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function PlanPicker({ plans, selectedId, onSelect }: Props) {
  const thisWeek = currentIsoWeek();
  const hasThisWeek = plans.some((p) => p.week === thisWeek);
  const sorted = [...plans].sort((a, b) => b.week.localeCompare(a.week) || a.title.localeCompare(b.title));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="plan-picker" className="text-sm font-semibold text-slate-700">
        보드에 보일 주간 계획
      </label>
      <select
        id="plan-picker"
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={plans.length === 0}
        className="field min-w-0 flex-1 sm:max-w-sm"
      >
        {plans.length === 0 && <option value="">주간 계획이 없어요</option>}
        {sorted.map((p) => (
          <option key={p.id} value={p.id}>
            {p.week}
            {p.week === thisWeek ? " (이번 주)" : ""} · {p.title}
          </option>
        ))}
      </select>
      {plans.length > 0 && !hasThisWeek && (
        <span className="text-xs text-amber-700">이번 주({thisWeek}) 계획이 없어 최근 주를 보여 줘요</span>
      )}
    </div>
  );
}
