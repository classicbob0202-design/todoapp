import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "할 일 관리",
  description: "할 일을 주간 계획과 1년 목표에 연결해 관리해요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans">{children}</body>
    </html>
  );
}
