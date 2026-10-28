"use client";

import { VIEWS, type View } from "@/lib/filter";

const LABEL: Record<View, string> = { day: "일", week: "주", year: "년" };

type Props = { view: View; onChange: (view: View) => void };

export default function ViewTabs({ view, onChange }: Props) {
  return (
    <div role="tablist" aria-label="기간" className="inline-flex rounded-lg bg-slate-100 p-1">
      {VIEWS.map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={view === v}
          onClick={() => onChange(v)}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            view === v ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {LABEL[v]}
        </button>
      ))}
    </div>
  );
}
