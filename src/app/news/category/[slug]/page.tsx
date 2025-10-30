"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import NivoTrendChart from "@/features/social/components/NivoTrendChart/index";
import SocialPeakDetails from "@/features/social/components/NivoTrendChart/SocialPeakDetails";

import { CATEGORIES } from "@/shared/constants/navigation";
import { PERIOD_LABEL_MAP } from "@/shared/constants/labels";

import type { PeriodKey, Sentiment } from "@/shared/types/common";
import type { SubRankItem, SocialItem } from "@/features/social/components/NivoTrendChart/types";

function buildMidListFromSocial(socialByPeriod: any, date: string): string[] {
  const day = socialByPeriod?.[date];
  if (!day) return [];
  return Object.keys(day.중분류목록 ?? {});
}

function buildSubRankingMap(
  socialByPeriod: any,
  date: string
): Record<string, SubRankItem[]> {
  const day = socialByPeriod?.[date];
  if (!day) return {};
  const result: Record<string, SubRankItem[]> = {};
  Object.entries(day.중분류목록 ?? {}).forEach(([mid, midVal]: any) => {
    const acc = new Map<string, number>();
    Object.entries(midVal?.소분류목록 ?? {}).forEach(([subName, subVal]: any) => {
      const count = Number(subVal?.count ?? 0);
      acc.set(subName, (acc.get(subName) ?? 0) + count);
    });
    result[mid] = [...acc.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });
  return result;
}

function buildSubRankingFromSocial(socialByPeriod: any, date: string): SubRankItem[] {
  const day = socialByPeriod?.[date];
  if (!day) return [];
  const acc = new Map<string, number>();
  Object.values(day?.중분류목록 ?? {}).forEach((mid: any) => {
    Object.entries(mid?.소분류목록 ?? {}).forEach(([subName, subVal]: any) => {
      const c = Number(subVal?.count ?? 0);
      acc.set(subName, (acc.get(subName) ?? 0) + c);
    });
  });
  return [...acc.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function buildSocialListFromSocial(
  socialByPeriod: any,
  date: string,
  sentiment: Sentiment
): SocialItem[] {
  const day = socialByPeriod?.[date];
  if (!day) return [];
  const rows: SocialItem[] = [];
  Object.values(day?.중분류목록 ?? {}).forEach((mid: any) => {
    Object.entries(mid?.소분류목록 ?? {}).forEach(([subName, subVal]: any) => {
      const list = subVal?.[sentiment]?.소셜목록 ?? [];
      for (const item of list) {
        rows.push({
          channel: item?.channel ?? "",
          date: item?.date ?? date,
          content: item?.content ?? "",
          url: item?.url ?? "",
          subCategory: subName,
        });
      }
    });
  });
  return rows;
}

export default function CategoryPage() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const params = useParams();
  const slugRaw = params?.slug as string | string[];
  const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw;

  const [period, setPeriod] = useState<PeriodKey>("weekly_timeline");
  const [data, setData] = useState<any>(null);
  const [socialDetail, setSocialDetail] = useState<null | { date: string; sentiment: Sentiment }>(null);
  const [view, setView] = useState<"news" | "social">("news");

  const periodLabel = PERIOD_LABEL_MAP[period];

  const currentCat = useMemo(
    () => CATEGORIES.find((c) => c.key === slug) ?? CATEGORIES[0],
    [slug]
  );

  const newsResetRef = useRef<() => void>(() => {});
  const socialResetRef = useRef<() => void>(() => {});

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/data/data.json", { cache: "no-store" });
      const all = await res.json();
      setData(all[slug as string]);
      setSocialDetail(null);
    }
    if (slug) fetchData();
  }, [slug]);

  useEffect(() => {
    if (view === "news") {
      setSocialDetail(null);
    }
  }, [view]);

  const newsByPeriod = data?.news?.[period] ?? {};
  const socialByPeriod = data?.social?.[period] ?? {};

  const subRanking: SubRankItem[] = useMemo(() => {
    if (!socialDetail) return [];
    return buildSubRankingFromSocial(socialByPeriod, socialDetail.date);
  }, [socialDetail, socialByPeriod]);

  const socialList: SocialItem[] = useMemo(() => {
    if (!socialDetail) return [];
    return buildSocialListFromSocial(socialByPeriod, socialDetail.date, socialDetail.sentiment);
  }, [socialDetail, socialByPeriod]);

  const midCategoryList = useMemo(() => {
    if (!socialDetail) return [];
    return buildMidListFromSocial(socialByPeriod, socialDetail.date);
  }, [socialDetail, socialByPeriod]);

  const subRankingMap = useMemo(() => {
    if (!socialDetail) return {};
    return buildSubRankingMap(socialByPeriod, socialDetail.date);
  }, [socialDetail, socialByPeriod]);

  if (!data) {
    return (
      <div className="w-full h-screen grid place-items-center bg-[#C8D4E5] text-neutral-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full text-neutral-700 overflow-hidden">
      {/* ===== 배경 레이어: 대시보드와 동일 팔레트 ===== */}
      <div className="fixed -inset-2 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E6EBF1] via-[#C8D4E5] to-[#B4C4E2]" />
        <div className="absolute inset-0 bg-[radial-gradient(620px_320px_at_18%_15%,rgba(111,145,232,0.50),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_420px_at_85%_82%,rgba(151,170,214,0.45),transparent_62%)]" />
        <div className="absolute inset-0 bg-white/12" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* ===== 콘텐츠 래퍼: 90vw 중앙 정렬 ===== */}
      <div className="flex w-full mx-auto gap-0">
        {/* 좌측 사이드바 (글래스) */}
        <aside
          className="w-[150px] shrink-0 bg-white backdrop-blur-md 
                     flex flex-col items-center py-6 
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)]"
        >
          <div className="mt-10 w-35 h-16 rounded-full mb-10 overflow-hidden border border-white/60">
            <img src="/icons/logo.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col space-y-4 items-center">
            {CATEGORIES.map((cat) => {
              const isActive = cat.key === slug;
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

        {/* 메인 (글래스) */}
        <main
          className="flex-1 flex flex-col p-10 bg-white/25 backdrop-blur-md
                     shadow-[0_12px_40px_rgba(20,30,60,0.12)] overflow-hidden"
        >
          {/* 헤더 */}
          <div className="w-full mx-auto flex items-center justify-between px-7 py-5">
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-[#2D2928] drop-shadow-sm">
              {currentCat.name} 상세분석
            </h2>
            <select
              className="border border-white/60 rounded px-3 py-2 bg-white/40 text-[#2D2928]
                         focus:outline-none focus:ring-2 focus:ring-[#699FFC]/40 backdrop-blur"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as PeriodKey);
                setSocialDetail(null);
                setResetTrigger((v) => v + 1);
                newsResetRef.current?.();
                socialResetRef.current?.();
              }}
            >
              <option className="text-neutral-900" value="daily_timeline">일별</option>
              <option className="text-neutral-900" value="weekly_timeline">주별</option>
              <option className="text-neutral-900" value="monthly_timeline">월별</option>
            </select>
          </div>

          {/* 설명 */}
          <div className="px-7 py-2 text-[#2D2928]/70">
            현재 <strong className="text-[#2D2928]">{periodLabel}</strong> 단위로{" "}
            <strong className="text-[#2D2928]">{currentCat.name}</strong>이(가) 분석됩니다.
          </div>

          {/* 콘텐츠 */}
          <div className="flex flex-col overflow-y-auto p-6 space-y-6 h-screen">
            <NivoTrendChart
              newsTimeline={newsByPeriod}
              socialTimeline={socialByPeriod}
              periodLabel={periodLabel}
              view={view}
              setView={setView}
              onSocialSliceClick={(date, sentiment) => {
                setSocialDetail({ date, sentiment });
              }}
              onInitResetRef={(fn) => { newsResetRef.current = fn; }}
              onSocialResetRef={(fn) => { socialResetRef.current = fn; }}
            />

            {/* 필요 시 소셜 상세 패널 활성화 */}
            {/* {view === "social" ? (
              socialDetail ? (
                <SocialPeakDetails
                  date={socialDetail.date}
                  sentiment={socialDetail.sentiment}
                  midCategoryList={midCategoryList}
                  subRanking={subRankingMap}
                  periodLabel={periodLabel}
                  socialList={socialList}
                  onClose={() => setSocialDetail(null)}
                  resetTrigger={resetTrigger}
                />
              ) : (
                <section className="w-full h-[400px] rounded-2xl border border-white/50 bg-white/35 backdrop-blur-md p-6 flex items-center justify-center text-neutral-700">
                  <p className="text-sm text-neutral-700/80 text-center leading-relaxed">
                    도넛 차트에서 <span className="font-semibold text-neutral-800">찬성/반대</span> 조각을 클릭하면 <br />
                    사건별 여론 반응이 이곳에 표시됩니다.
                  </p>
                </section>
              )
            ) : null} */}
          </div>
        </main>
      </div>
    </div>
  );
}
