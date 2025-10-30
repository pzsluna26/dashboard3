// app/layout.tsx (또는 src/app/layout.tsx)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISSUE & LAW",
  description: "법률과 여론을 이슈 중심으로 분석하는 사이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ===== 배경 레이어 (이미지와 동일 팔레트) ===== */}
        <div className="fixed inset-0 -z-10">
          {/* 메인 그라데이션: E6EBF1 → C8D4E5 → B4C4E2 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E6EBF1] via-[#C8D4E5] to-[#B4C4E2]" />
          {/* 푸른 라디얼 글로우 (좌상단) */}
          <div className="absolute inset-0 bg-[radial-gradient(620px_320px_at_18%_15%,rgba(111,145,232,0.50),transparent_60%)]" />
          {/* 라벤더 라디얼 글로우 (우하단) */}
          <div className="absolute inset-0 bg-[radial-gradient(760px_420px_at_85%_82%,rgba(151,170,214,0.45),transparent_62%)]" />
          {/* 아주 옅은 화이트 틴트 + 미세 블러로 부드럽게 */}
          <div className="absolute inset-0 bg-white/12 backdrop-blur-[2px]" />
        </div>

        {/* ===== 콘텐츠 래퍼 ===== */}
        <div className="w-full mx-auto flex flex-col justify-center items-center min-h-screen overflow-hidden">
          <main className="w-full h-full flex flex-col justify-center items-center overflow-y-auto flex-grow">
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
