"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/components/StoreProvider";

const NAV = [
  { href: "/", label: "대시보드", icon: "🏠" },
  { href: "/todos", label: "할 일", icon: "✅" },
  { href: "/weekly", label: "주간 계획", icon: "📅" },
  { href: "/goals", label: "1년 목표", icon: "🎯" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const store = useAppStore();

  return (
    <div className="min-h-screen md:flex">
      {/* 넓은 화면에서는 왼쪽 세로 메뉴, 좁은 화면에서는 위쪽 가로 메뉴 */}
      <aside className="relative bg-slate-900 text-slate-100 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="px-5 py-4 text-lg font-bold md:py-8">할일 + 계획</div>
        <nav aria-label="주 메뉴">
          <ul className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {store.user && (
          <div className="flex items-center gap-3 border-t border-white/10 px-5 py-3 md:absolute md:bottom-0 md:w-60">
            {/* GitHub 아바타는 외부 주소라 next/image 설정 없이 img 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.user.avatar_url} alt="" className="h-8 w-8 rounded-full bg-white/20" />
            <span className="min-w-0 flex-1 truncate text-sm">{store.user.username}</span>
            <form action="/auth/logout" method="post">
              <button type="submit" className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                로그아웃
              </button>
            </form>
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
          {store.error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {store.error}
            </p>
          )}
          {store.loading ? <p className="text-sm text-slate-500">불러오는 중…</p> : children}
        </div>
      </div>
    </div>
  );
}
