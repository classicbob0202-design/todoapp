"use client";

import { useState, type FormEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { TaskChanges } from "@/hooks/useStore";
import { STATUSES, type Task, type WeeklyPlan } from "@/lib/types";

const STATUS_LABEL = { todo: "할 일", doing: "진행 중", done: "완료" } as const;

type Props = {
  task: Task;
  plans: WeeklyPlan[];
  onUpdate: (id: string, changes: TaskChanges) => void;
  onDelete: (id: string) => void;
};

export default function TaskCard({ task, plans, onUpdate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function saveTitle(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    if (title !== task.title) onUpdate(task.id, { title });
    setEditing(false);
  }

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${isDragging ? "relative z-10 opacity-80 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2">
        {/* 손잡이로만 끌어야 입력칸·버튼을 눌러도 드래그가 시작되지 않음 */}
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={`${task.title} 옮기기`}
          className="mt-0.5 cursor-grab touch-none rounded px-1 text-slate-400 hover:text-slate-700 active:cursor-grabbing"
        >
          ⠿
        </button>
        {editing ? (
          <form onSubmit={saveTitle} className="flex min-w-0 flex-1 gap-1">
            <input
              autoFocus
              aria-label="할 일 제목"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              maxLength={200}
              className="field min-w-0 flex-1 py-1"
            />
            <button type="submit" className="btn-sm">
              저장
            </button>
          </form>
        ) : (
          <p className={`min-w-0 flex-1 break-words ${task.status === "done" ? "text-slate-400 line-through" : ""}`}>
            {task.title}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <select
          aria-label="상태"
          value={task.status}
          onChange={(e) => onUpdate(task.id, { status: e.target.value as Task["status"] })}
          className="field py-0.5 text-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="주간 계획"
          value={task.weeklyPlanId}
          onChange={(e) => onUpdate(task.id, { weeklyPlanId: e.target.value })}
          className="field min-w-0 max-w-[10rem] flex-1 py-0.5 text-xs"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.week} · {p.title}
            </option>
          ))}
        </select>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(task.title);
              setEditing(true);
            }}
            className="btn-sm"
          >
            수정
          </button>
        )}
        <button type="button" onClick={() => onDelete(task.id)} className="btn-sm text-rose-600 hover:bg-rose-50">
          삭제
        </button>
      </div>
    </li>
  );
}
