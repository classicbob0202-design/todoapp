"use client";

import GoalForm from "@/components/GoalForm";
import GoalProgress from "@/components/GoalProgress";
import { useAppStore } from "@/components/StoreProvider";

export default function GoalsPage() {
  const store = useAppStore();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">1년 목표</h1>
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="card self-start">
          <GoalForm onAdd={store.addGoal} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">1년 목표 진행률</h2>
          <GoalProgress
            goals={store.goals}
            plans={store.plans}
            tasks={store.tasks}
            onUpdate={store.updateGoal}
            onDelete={store.deleteGoal}
          />
        </div>
      </div>
    </>
  );
}
