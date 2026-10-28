"use client";

import { useState, type FormEvent } from "react";

type Props = { onAdd: (title: string, year: number) => Promise<boolean> };

export default function GoalForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    if (await onAdd(title.trim(), year)) setTitle("");
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor="goal-title">
        1년 목표
      </label>
      <div className="flex gap-2">
        <input
          id="goal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 사이드 프로젝트 3개 출시"
          maxLength={200}
          className="field min-w-0 flex-1"
        />
        <input
          type="number"
          aria-label="연도"
          value={year}
          min={2000}
          max={2100}
          onChange={(e) => setYear(Number(e.target.value))}
          className="field w-24"
        />
      </div>
      <button type="submit" disabled={saving || !title.trim()} className="btn self-end">
        목표 추가
      </button>
    </form>
  );
}
