"use client";

import { useEffect, useState } from "react";
import KPISection from "@/features/news/components/KPISection";
import LawTrendChart from "@/features/news/components/LawTrendChart";
import LawRankingCard from "@/features/news/components/LawRankingCard";
import CoreInsightsCard from "@/features/news/components/CoreInsightsCard";
import { transformRawData } from "@/features/news/components/transformRawData";
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
    <div className="relative h-screen w-full text-neutral-900">
      <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-8 py-4 h-full">
        <main className="flex flex-col h-full space-y-4 overflow-y-auto">
          {/* 헤더 + 필터 */}
          <div className="flex items-center justify-between flex-shrink-0 h-[10%]">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl xl:text-4xl font-semibold text-[#2D2928] drop-shadow-sm">
                {currentTitle}
              </h2>
            </div>
            <select
              className="border border-white/60 rounded px-3 py-2 md:px-4 md:py-3 bg-white/40 text-[#2D2928]
                         focus:outline-none focus:ring-2 focus:ring-[#699FFC]/40 backdrop-blur text-sm md:text-base"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            >
              <option className="text-neutral-900" value="daily_timeline">일별</option>
              <option className="text-neutral-900" value="weekly_timeline">주별</option>
              <option className="text-neutral-900" value="monthly_timeline">월별</option>
            </select>
          </div>

          {/* 설명 */}
          <div className="text-sm md:text-base text-[#2D2928]/70 flex-shrink-0">
            현재 <strong className="text-[#2D2928]">{periodLabel}</strong> 단위로{" "}
            <strong className="text-[#2D2928]">{currentTitle}</strong>이(가) 분석됩니다.
          </div>

          {/* KPI */}
          <section className="flex-shrink-0 h-[15%]">
            <div className="bg-white/35 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/50 h-full">
              <KPISection data={kpis} period={periodLabel} />
            </div>
          </section>

          {/* 그래프 + 랭킹 */}
          <section className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <div className="lg:col-span-2 xl:col-span-3 bg-white/35 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/50 overflow-hidden">
              {/* <LawTrendChart data={trend} period={periodLabel} /> */}
            </div>
            <div className="lg:col-span-1 xl:col-span-2 bg-white/35 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/50 overflow-hidden">
              {/* <LawRankingCard data={kpis} periodLabel={periodLabel} /> */}
            </div>
          </section>

          {/* 인사이트 */}
          <section className="flex-shrink-0 h-[22%]">
            <div className="bg-white/35 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/50 h-full overflow-auto">
              {/* <CoreI
              nsightsCard data={kpis} periodLabel={periodLabel} trend={trend} /> */}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
