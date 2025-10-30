// app/layout.tsx (또는 src/app/layout.tsx)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundGradient from "@/shared/layout/BackgroundGradient";


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
        <BackgroundGradient
        stops={["#ced7dc", "#eaebed", "#f6efec", "#f8e7e0"]}
        highlights
        glass
      />

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
