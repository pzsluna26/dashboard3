// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundGradient from "@/shared/layout/BackgroundGradient";
import Nav from "@/shared/layout/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISSUE & LAW",
  description: "법률과 여론을 이슈 중심으로 분석하는 사이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        {/* 배경은 항상 뒤쪽 레이어에 고정 */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <BackgroundGradient
            stops={["#ced7dc", "#eaebed", "#f6efec", "#f8e7e0"]}
            highlights
            glass
          />
        </div>

        {/* 전역 네비게이션 */}
        <Nav />

        {/* 콘텐츠 영역: 레이어 분리 + 세로만 채우기 */}
        <main className="relative isolate min-h-screen w-full flex flex-col pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
