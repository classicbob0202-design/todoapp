"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStore } from "@/hooks/useStore";

type Store = ReturnType<typeof useStore>;

const StoreContext = createContext<Store | null>(null);

// 메뉴를 옮겨 다녀도 데이터를 다시 불러오지 않도록 레이아웃에서 한 번만 불러와 공유
export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAppStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore는 StoreProvider 안에서만 쓸 수 있어요");
  return store;
}
