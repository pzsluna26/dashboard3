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
import BackgroundGradient from "@/shared/layout/BackgroundGradient";


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
    <div className="relative h-screen w-full text-neutral-900 overflow-hidden">
      {/* ===== 배경 레이어 (이미지와 동일 팔레트) ===== */}

      <BackgroundGradient
        stops={["#ced7dc", "#eaebed", "#f6efec", "#f8e7e0"]}
        highlights
        glass
      />
      {/* ===== 콘텐츠 (Windows 화면 비율 최적화) ===== */}
      <div className="flex h-full w-full">
        {/* 사이드바 (글래스모피즘) - 대형 화면에서 더 넓게 */}
        <aside
          className="hidden md:flex w-[160px] lg:w-[200px] xl:w-[240px] 2xl:w-[280px] 3xl:w-[320px]
                     bg-white/70 backdrop-blur-md border border-white/40
                     flex-col items-center py-6 
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)]"
        >
          <div className="mt-8 w-36 xl:w-40 2xl:w-44 h-16 xl:h-18 2xl:h-20 rounded-full mb-10 overflow-hidden border border-white/60">
            <img src="/icons/logo.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col space-y-4 xl:space-y-5 items-center">
            {CATEGORIES.map((cat) => {
              const isActive = cat.href === "/";
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className={`flex flex-col items-center p-2 transition-colors rounded-lg ${isActive ? "text-[#2D2928]" : "text-[#2D2928]/60 hover:text-[#2D2928]"
                    }`}
                  title={cat.name}
                >
                  <img
                    src={isActive ? cat.activeImage : cat.image}
                    alt={cat.name}
                    className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 object-contain"
                  />
                </Link>
              );
            })}
          </div>
        </aside>

        {/* 메인 래퍼 (글래스) - 대형 화면에서 더 큰 패딩 */}
        <main
          className="flex flex-col p-4 md:p-6 xl:p-10 2xl:p-12 3xl:p-16 bg-white/25 backdrop-blur-md
                     md:rounded-tr-3xl md:rounded-br-3xl border border-white/40
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)] flex-1 h-full overflow-y-auto"
        >
          {/* 헤더 - 대형 화면에서 더 큰 타이틀과 간격 */}
          <div className="flex items-center justify-between px-4 xl:px-6 2xl:px-8 py-4 xl:py-6 mb-3 xl:mb-4">
            <div className="flex items-center gap-4 xl:gap-6">
              {/* 모바일 네비게이션 */}
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/60">
                  <img src="/icons/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-1">
                  {CATEGORIES.slice(0, 3).map((cat) => {
                    const isActive = cat.href === "/";
                    return (
                      <Link
                        key={cat.key}
                        href={cat.href}
                        className={`p-1 transition-colors rounded ${isActive ? "text-[#2D2928]" : "text-[#2D2928]/60"
                          }`}
                        title={cat.name}
                      >
                        <img
                          src={isActive ? cat.activeImage : cat.image}
                          alt={cat.name}
                          className="w-6 h-6 object-contain"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-semibold text-[#2D2928] drop-shadow-sm">
                {currentTitle}
              </h2>
            </div>
            <select
              className="border border-white/60 rounded px-4 py-3 xl:px-5 xl:py-4 bg-white/40 text-[#2D2928]
                         focus:outline-none focus:ring-2 focus:ring-[#699FFC]/40 backdrop-blur text-sm xl:text-base"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            >
              <option className="text-neutral-900" value="daily_timeline">일별</option>
              <option className="text-neutral-900" value="weekly_timeline">주별</option>
              <option className="text-neutral-900" value="monthly_timeline">월별</option>
            </select>
          </div>

          {/* 설명 - 대형 화면에서 더 큰 텍스트 */}
          <div className="px-4 xl:px-6 2xl:px-8 py-2 xl:py-3 text-sm xl:text-base 2xl:text-lg text-[#2D2928]/70 mb-4 xl:mb-6">
            현재 <strong className="text-[#2D2928]">{periodLabel}</strong> 단위로{" "}
            <strong className="text-[#2D2928]">{currentTitle}</strong>이(가) 분석됩니다.
          </div>

          {/* 본문 - 대형 화면에서 더 큰 간격 */}
          <div className="flex flex-col px-4 xl:px-6 2xl:px-8 space-y-4 xl:space-y-6 2xl:space-y-8 flex-1 min-h-0">
            {/* KPI 카드 - 대형 화면에서 더 큰 패딩 */}
            <section className="flex-shrink-0">
              <div className="bg-white/35 backdrop-blur-md rounded-xl xl:rounded-2xl p-4 xl:p-6 2xl:p-8 border border-white/50">
                <KPISection data={kpis} period={periodLabel} />
              </div>
            </section>

            {/* 메인 콘텐츠 영역 - 대형 화면에서 더 많은 컬럼 */}
            <section className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-4 xl:gap-6 2xl:gap-8 min-h-0">
              {/* 좌측: 추세 그래프 - 대형 화면에서 더 넓게 */}
              <div className="lg:col-span-2 xl:col-span-3 2xl:col-span-4 bg-white/35 backdrop-blur-md rounded-xl xl:rounded-2xl p-4 xl:p-6 2xl:p-8 border border-white/50 min-h-0">
                <LawTrendChart data={trend} period={periodLabel} />
              </div>

              {/* 우측: 랭킹 - 대형 화면에서 적절한 비율 */}
              <div className="lg:col-span-1 xl:col-span-2 2xl:col-span-3 bg-white/35 backdrop-blur-md rounded-xl xl:rounded-2xl p-4 xl:p-6 2xl:p-8 border border-white/50 min-h-0">
                <LawRankingCard data={kpis} periodLabel={periodLabel} />
              </div>
            </section>

            {/* 하단: 인사이트 카드 - 대형 화면에서 더 큰 패딩 */}
            <section className="flex-shrink-0">
              <div className="bg-white/35 backdrop-blur-md rounded-xl xl:rounded-2xl p-4 xl:p-6 2xl:p-8 border border-white/50">
                <CoreInsightsCard data={kpis} periodLabel={periodLabel} trend={trend} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
