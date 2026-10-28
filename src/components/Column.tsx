"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Status } from "@/lib/types";

type Props = { status: Status; label: string; count: number; children: ReactNode };

export default function Column({ status, label, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${label} 컬럼`}
      className={`flex min-h-48 flex-col rounded-2xl border-2 p-3 transition-colors ${
        isOver ? "border-indigo-400 bg-indigo-50" : "border-transparent bg-slate-100"
      }`}
    >
      <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-700">
        {label}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs tabular-nums text-slate-500">{count}</span>
      </h3>
      {count === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-sm text-slate-400">
          여기에 드래그하세요
        </p>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  );
}
