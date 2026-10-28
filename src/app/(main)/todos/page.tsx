"use client";

import { useEffect, useState } from "react";
import Board from "@/components/Board";
import GoalPicker from "@/components/GoalPicker";
import PlanPicker, { defaultPlanId } from "@/components/PlanPicker";
import { useAppStore } from "@/components/StoreProvider";
import TaskForm from "@/components/TaskForm";
import ViewTabs from "@/components/ViewTabs";
import { defaultGoalId, filterBoardTasks, isView, localDate, type View } from "@/lib/filter";

// 새로고침해도 같은 보기가 유지되도록 선택값을 URL 쿼리에 저장
function setQuery(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
}

export default function TodosPage() {
  const store = useAppStore();
  const [view, setView] = useState<View>("week");
  const [chosenPlanId, setChosenPlanId] = useState<string | null>(null);
  const [chosenGoalId, setChosenGoalId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    if (isView(v)) setView(v);
    setChosenPlanId(params.get("plan"));
    setChosenGoalId(params.get("goal"));
  }, []);

  // 고른 항목이 없거나 지워졌으면 기본값으로 대체 (주간 계획: 이번 주 → 최근 주, 목표: 올해 → 첫 목표)
  const selectedPlanId =
    chosenPlanId && store.plans.some((p) => p.id === chosenPlanId) ? chosenPlanId : defaultPlanId(store.plans);
  const selectedGoalId =
    chosenGoalId && store.goals.some((g) => g.id === chosenGoalId) ? chosenGoalId : defaultGoalId(store.goals);
  const boardTasks = filterBoardTasks(store.tasks, store.plans, view, {
    planId: selectedPlanId,
    goalId: selectedGoalId,
    today: localDate(new Date()),
  });

  function changeView(next: View) {
    setView(next);
    setQuery("view", next);
  }

  function selectPlan(id: string) {
    setChosenPlanId(id);
    setQuery("plan", id);
  }

  function selectGoal(id: string) {
    setChosenGoalId(id);
    setQuery("goal", id);
  }

  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">칸반 보드</h1>
        <span className="text-sm tabular-nums text-slate-500">전체 {boardTasks.length}개</span>
      </div>

      <div className="card flex flex-col gap-4">
        <ViewTabs view={view} onChange={changeView} />
        {view === "day" && <p className="text-sm text-slate-600">오늘 만든 할 일을 보여 줘요.</p>}
        {view === "week" && <PlanPicker plans={store.plans} selectedId={selectedPlanId} onSelect={selectPlan} />}
        {view === "year" && <GoalPicker goals={store.goals} selectedId={selectedGoalId} onSelect={selectGoal} />}
        {/* 보드에서 고른 주간 계획이 바뀌면 입력칸의 기본 연결 대상도 함께 바뀜 */}
        <TaskForm key={selectedPlanId ?? "none"} plans={store.plans} defaultPlanId={selectedPlanId} onAdd={store.addTask} />
      </div>

      <Board
        tasks={boardTasks}
        plans={store.plans}
        onMove={store.moveTask}
        onUpdate={store.updateTask}
        onDelete={store.deleteTask}
      />
    </>
  );
}
