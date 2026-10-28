"use client";

import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { useAppStore } from "@/components/StoreProvider";
import { goalProgress, weeklyProgress } from "@/lib/progress";
import { STATUSES, type Status } from "@/lib/types";
import { currentIsoWeek } from "@/lib/week";

const STATUS_LABEL: Record<Status, string> = { todo: "할 일", doing: "진행 중", done: "완료" };

export default function DashboardPage() {
  const { goals, plans, tasks } = useAppStore();
  const thisWeek = currentIsoWeek();
  const weekPlans = plans.filter((p) => p.week === thisWeek);
  const weekPlanIds = new Set(weekPlans.map((p) => p.id));
  const weekTasks = tasks.filter((t) => weekPlanIds.has(t.weeklyPlanId));
  const weekDone = weekTasks.filter((t) => t.status === "done").length;
  const weekPercent = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;
  const year = new Date().getFullYear();
  const yearGoals = goals.filter((g) => g.year === year);

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>

      <section className="card" aria-labelledby="week-heading">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="week-heading" className="font-semibold text-slate-800">
            이번 주 진행률 <span className="text-sm font-normal text-slate-400">{thisWeek}</span>
          </h2>
          {weekPlans.length > 0 && (
            <span className="tabular-nums text-slate-700">
              <span className="text-2xl font-bold">{weekPercent}%</span>{" "}
              <span className="text-sm text-slate-400">
                ({weekDone}/{weekTasks.length})
              </span>
            </span>
          )}
        </div>
        {weekPlans.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            이번 주 계획이 없습니다.{" "}
            <Link href="/weekly" className="font-medium text-indigo-600 hover:underline">
              주간 계획 만들기
            </Link>
          </p>
        ) : (
          <>
            <ProgressBar label="이번 주 전체 진행률" percent={weekPercent} />
            <ul className="mt-4 flex flex-col gap-3">
              {weekPlans.map((plan) => {
                const percent = Math.round(weeklyProgress(tasks, plan.id) * 100);
                return (
                  <li key={plan.id}>
                    <Link href={`/todos?view=week&plan=${plan.id}`} className="block rounded-lg hover:bg-slate-50">
                      <span className="flex justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate text-slate-700">{plan.title}</span>
                        <span className="shrink-0 tabular-nums text-slate-500">{percent}%</span>
                      </span>
                      <ProgressBar label={`${plan.title} 진행률`} percent={percent} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section className="card" aria-labelledby="status-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="status-heading" className="font-semibold text-slate-800">
            할 일 현황
          </h2>
          <Link href="/todos" className="text-sm font-medium text-indigo-600 hover:underline">
            칸반 보드 열기
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">전체</dt>
            <dd className="text-2xl font-bold tabular-nums text-slate-900">{tasks.length}</dd>
          </div>
          {STATUSES.map((s) => (
            <div key={s} className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">{STATUS_LABEL[s]}</dt>
              <dd className="text-2xl font-bold tabular-nums text-slate-900">
                {tasks.filter((t) => t.status === s).length}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card" aria-labelledby="goal-heading">
        <h2 id="goal-heading" className="font-semibold text-slate-800">
          {year}년 목표 진행률
        </h2>
        {yearGoals.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            올해 목표가 없습니다.{" "}
            <Link href="/goals" className="font-medium text-indigo-600 hover:underline">
              1년 목표 만들기
            </Link>
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {yearGoals.map((goal) => {
              const percent = Math.round(goalProgress(tasks, plans, goal.id) * 100);
              return (
                <li key={goal.id}>
                  <span className="flex justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-slate-700">{goal.title}</span>
                    <span className="shrink-0 tabular-nums text-slate-500">{percent}%</span>
                  </span>
                  <ProgressBar label={`${goal.title} 진행률`} percent={percent} tone="emerald" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
