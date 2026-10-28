import AppShell from "@/components/AppShell";
import { StoreProvider } from "@/components/StoreProvider";

// 로그인 뒤에만 보이는 화면들: 데이터 공유 + 왼쪽 메뉴
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
