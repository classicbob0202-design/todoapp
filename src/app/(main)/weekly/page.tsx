"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/components/StoreProvider";
import WeeklyPlanForm from "@/components/WeeklyPlanForm";
import WeeklyProgress from "@/components/WeeklyProgress";

export default function WeeklyPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">주간 계획</h1>
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="card self-start">
          <WeeklyPlanForm goals={store.goals} onAdd={store.addWeeklyPlan} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">주간 진행률</h2>
          {/* 계획을 누르면 그 주간 계획의 칸반 보드로 이동 */}
          <WeeklyProgress
            goals={store.goals}
            plans={store.plans}
            tasks={store.tasks}
            selectedId={null}
            onSelect={(id) => router.push(`/todos?view=week&plan=${id}`)}
            onUpdate={store.updateWeeklyPlan}
            onDelete={store.deleteWeeklyPlan}
          />
        </div>
      </div>
    </>
  );
}
