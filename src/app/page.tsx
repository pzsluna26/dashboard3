// 종합분석 페이지 (Home: /)

"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

import KPISection from "@/features/news/components/KPISection";
import LawTrendChart from "@/features/news/components/LawTrendChart";
import LawRankingCard from "@/features/news/components/LawRankingCard";
import CoreInsightsCard from "@/features/news/components/CoreInsightsCard";

import { transformRawData } from "@/features/news/components/transformRawData";
import { CATEGORIES } from "@/shared/constants/navigation";
import { PERIOD_LABEL_MAP } from "@/shared/constants/labels";
import { computeKpis } from "@/shared/utils/computeKpis";

import type { PeriodKey } from "@/shared/types/common";

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("weekly_timeline");
  const [data, setData] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const periodLabel = PERIOD_LABEL_MAP[period];

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/data/data.json", { cache: "no-store" });
      const data = await res.json();
      setData(data);

      const transformed = transformRawData(data, period);
      setTrend(transformed);

      const nextKpis = computeKpis(data, period);
      setKpis(nextKpis);
    }
    fetchData();
  }, [period]);

  if (!data || !trend || !kpis) {
    return (
      <div className="w-full h-screen grid place-items-center bg-[#C8D4E5] text-neutral-700">
        Loading...
      </div>
    );
  }

  const currentTitle = "종합분석";

  return (
    <div className="relative min-h-screen w-full text-neutral-900 overflow-hidden">
      {/* ===== 배경 레이어 (이미지와 동일 팔레트) ===== */}
      <div className="fixed -inset-2 -z-10">
        {/* 메인 그라데이션: E6EBF1 → C8D4E5 → B4C4E2 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E6EBF1] via-[#C8D4E5] to-[#B4C4E2]" />

        {/* 푸른 라디얼 글로우 (좌상단) */}
        <div className="absolute inset-0 bg-[radial-gradient(620px_320px_at_18%_15%,rgba(111,145,232,0.50),transparent_60%)]" />

        {/* 라벤더/보라 라디얼 글로우 (우하단) */}
        <div className="absolute inset-0 bg-[radial-gradient(760px_420px_at_85%_82%,rgba(151,170,214,0.45),transparent_62%)]" />

        {/* 대비 확보용 아주 옅은 틴트 */}
        <div className="absolute inset-0 bg-white/12" />

        {/* 살짝 블러 */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* ===== 콘텐츠 (화면 너비의 90% / 중앙 정렬) ===== */}
      <div className="flex w-full mx-auto ">
        {/* 사이드바 (글래스모피즘) */}
        <aside
          className="w-[150px] bg-white/70 backdrop-blur-md border border-white/40
                     flex flex-col items-center py-6 
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)]"
        >
          <div className="mt-10 w-35 h-16 rounded-full mb-10 overflow-hidden border border-white/60">
            <img src="/icons/logo.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col space-y-4 items-center">
            {CATEGORIES.map((cat) => {
              const isActive = cat.href === "/";
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className={`flex flex-col items-center p-2 transition-colors rounded-lg ${
                    isActive ? "text-[#2D2928]" : "text-[#2D2928]/60 hover:text-[#2D2928]"
                  }`}
                  title={cat.name}
                >
                  <img
                    src={isActive ? cat.activeImage : cat.image}
                    alt={cat.name}
                    className="w-10 h-10 object-contain"
                  />
                </Link>
              );
            })}
          </div>
        </aside>

        {/* 메인 래퍼 (글래스) */}
        <main
          className="flex flex-col p-10 bg-white/25 backdrop-blur-md
                     rounded-tr-3xl rounded-br-3xl border border-white/40
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)] flex-1"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-7 py-5">
            <h2 className="mt-2 text-4xl md:text-5xl font-semibold text-[#2D2928] drop-shadow-sm">
              {currentTitle}
            </h2>
            <select
              className="border border-white/60 rounded px-3 py-2 bg-white/40 text-[#2D2928]
                         focus:outline-none focus:ring-2 focus:ring-[#699FFC]/40 backdrop-blur"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            >
              <option className="text-neutral-900" value="daily_timeline">일별</option>
              <option className="text-neutral-900" value="weekly_timeline">주별</option>
              <option className="text-neutral-900" value="monthly_timeline">월별</option>
            </select>
          </div>

          {/* 설명 */}
          <div className="px-7 py-2 text-[#2D2928]/70">
            현재 <strong className="text-[#2D2928]">{periodLabel}</strong> 단위로{" "}
            <strong className="text-[#2D2928]">{currentTitle}</strong>이(가) 분석됩니다.
          </div>

          {/* 본문 */}
          <div className="flex flex-col p-6 space-y-6">
            {/* KPI 카드 */}
            <section>
              <div className="bg-white/35 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                <KPISection data={kpis} period={periodLabel} />
              </div>
            </section>

            {/* 추세 그래프 카드 */}
            <section className="bg-white/35 backdrop-blur-md rounded-3xl p-4 border border-white/50">
              <LawTrendChart data={trend} period={periodLabel} />
            </section>

            {/* 랭킹 + 인사이트 */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white/35 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                <LawRankingCard data={kpis} periodLabel={periodLabel} />
              </div>
              <div className="lg:col-span-2 h-full bg-white/35 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                <CoreInsightsCard data={kpis} periodLabel={periodLabel} trend={trend} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
