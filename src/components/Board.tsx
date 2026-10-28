"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import Column from "@/components/Column";
import TaskCard from "@/components/TaskCard";
import type { TaskChanges } from "@/hooks/useStore";
import { STATUSES, isStatus, type Status, type Task, type WeeklyPlan } from "@/lib/types";

const COLUMN_LABEL: Record<Status, string> = { todo: "할 일", doing: "진행 중", done: "완료" };

type Props = {
  tasks: Task[];
  plans: WeeklyPlan[];
  onMove: (id: string, status: Status) => void;
  onUpdate: (id: string, changes: TaskChanges) => void;
  onDelete: (id: string) => void;
};

export default function Board({ tasks, plans, onMove, onUpdate, onDelete }: Props) {
  // 5px 이상 움직여야 드래그로 보고, 키보드는 Space로 들고 화살표로 옮김
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const titleOf = (id: string | number) => tasks.find((t) => t.id === id)?.title ?? "할 일";
  const columnOf = (id: string | number | undefined) => (isStatus(id) ? COLUMN_LABEL[id] : "보드 밖");
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${titleOf(active.id)}을(를) 들었어요.`,
    onDragOver: ({ active, over }) => `${titleOf(active.id)}: ${columnOf(over?.id)} 위`,
    onDragEnd: ({ active, over }) => `${titleOf(active.id)}을(를) ${columnOf(over?.id)}에 놓았어요.`,
    onDragCancel: ({ active }) => `${titleOf(active.id)} 옮기기를 취소했어요.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    const status = over?.id;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || !isStatus(status) || task.status === status) return;
    onMove(task.id, status);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: "Space로 들고, 화살표로 옮긴 뒤 Space로 놓아요. Esc는 취소예요.",
        },
      }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <Column key={status} status={status} label={COLUMN_LABEL[status]} count={columnTasks.length}>
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} plans={plans} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
}
