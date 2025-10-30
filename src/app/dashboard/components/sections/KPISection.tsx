'use client';

import { useMemo } from 'react';
import Image from "next/image";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
  XAxis,
} from "recharts";
import { KPIMetrics, DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { defaultFilters } from '@/shared/store/dashboardAtoms';
import { DataProcessor } from '@/shared/services/dataProcessor';

type SeriesPoint = { date: string; value: number };

type KpiSeries = {
  label: string;               // 카드 타이틀
  value: number;               // 선택기간 집계값
  deltaPct?: number;           // 전년동기간(or 전기간) 대비 증감(%)
  growthRate?: number;         // computeKpis가 growthRate로 줄 때 대응
  series?: SeriesPoint[];      // ✅ 뉴스량(레벨) 시계열
  socialSeries?: SeriesPoint[];// ✅ 소셜합(찬성+반대) 시계열
  prefix?: string;
  suffix?: string;
  subtitle?: string;
};

interface KPISectionProps {
  filters?: DashboardFilters;
  data?: ProcessedData | null;
  className?: string;
}

// 간단 className 합성
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function formatNumber(n: number) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  if (Math.abs(n) >= 1000) return `${Math.round(n).toLocaleString()}`;
  if (Math.abs(n) >= 100) return `${Math.round(n)}`;
  return `${Math.round(n * 10) / 10}`;
}

function formatDelta(delta?: number) {
  if (delta === undefined || delta === null) return "–";
  const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
  return `${sign} ${Math.abs(Math.round(delta * 10) / 10)}%`;
}

// 뉴스/소셜 시계열을 date 기준 병합 (누적용: 빈 값은 0으로)
function mergeSeries(level?: SeriesPoint[], social?: SeriesPoint[]) {
  const map = new Map<string, { date: string; level: number; social: number }>();
  (level ?? []).forEach((p) => map.set(p.date, { date: p.date, level: p.value, social: 0 }));
  (social ?? []).forEach((p) => {
    const prev = map.get(p.date) ?? { date: p.date, level: 0, social: 0 };
    prev.social = p.value;
    map.set(p.date, prev);
  });
  return Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
}

function KpiCard({ item }: { item: KpiSeries }) {
  const delta =
    typeof item.deltaPct === "number"
      ? item.deltaPct
      : typeof item.growthRate === "number"
        ? item.growthRate
        : 0;

  const up = (delta ?? 0) > 0;
  const down = (delta ?? 0) < 0;

  const levelSeries = Array.isArray(item.series) ? item.series : [];
  const socialSeries = Array.isArray(item.socialSeries) ? item.socialSeries : undefined;
  const data = mergeSeries(levelSeries, socialSeries);
  const hasSocial = !!socialSeries && socialSeries.length > 0;

  return (
    <div className="relative group transform hover:scale-105 transition-all duration-500">
      {/* 메인 카드 - 글래스모피즘 + Layout 스타일 */}
      <div className="relative p-2 xl:p-3 2xl:p-4 bg-transparent rounded-xl xl:rounded-2xl transition-all duration-500 overflow-visible">

        {/* 내부 그라데이션 오버레이 */}
        {/* <div
          className="absolute inset-0 opacity-20 rounded-2xl xl:rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(206,215,220,0.4) 0%, rgba(234,235,237,0.3) 25%, rgba(246,239,236,0.2) 75%, rgba(248,231,224,0.4) 100%)"
          }}
        /> */}

        {/* 라디얼 글로우 효과 */}
        {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(111,145,232,0.15),transparent_60%)] rounded-2xl xl:rounded-3xl pointer-events-none" /> */}

        {/* 콘텐츠 */}
        <div className="relative z-10">
          {/* 법안명 - 한글 폰트 적용 */}
          <div className="text-xs xl:text-sm font-medium text-[#2D2928]/70 mb-1 font-[var(--font-jua)]">
            {item.label ?? "-"}
          </div>

          {/* 메인 수치와 증감률 */}
          <div className="flex items-end gap-2 mb-2">
            <div className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-[#2D2928] font-[var(--font-blackhan)] drop-shadow-sm">
              {item.prefix ?? ""}
              {formatNumber(Number(item.value) || 0)}
              {item.suffix ?? ""}
            </div>
            <div
              className={cx(
                "text-xs xl:text-sm font-semibold drop-shadow-sm",
                up && "text-[#6B8E6B]", // 부드러운 세이지 그린
                down && "text-[#C9A96E]", // 부드러운 골드 (경고색 대신)
                !up && !down && "text-[#8B9DC3]" // 부드러운 라벤더 블루
              )}
            >
              {formatDelta(delta)}{" "}
              {item.subtitle ? <span className="text-[#2D2928]/60 font-normal">{item.subtitle}</span> : null}
            </div>
          </div>

          {/* 누적 면적 차트: level(뉴스) + social(소셜합) 한 축에 스택 */}
          <div className="h-8 xl:h-10 bg-transparent rounded-lg p-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} stackOffset="none">
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "level") return [formatNumber(Number(value) || 0), "뉴스"];
                    if (name === "social") return [formatNumber(Number(value) || 0), "소셜(찬성+반대)"];
                    return [value, name];
                  }}
                  labelFormatter={(l) => l}
                  contentStyle={{
                    fontSize: 11,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '6px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                {/* 뉴스 영역 - 부드러운 라벤더 그레이 */}
                <Area
                  type="monotone"
                  dataKey="level"
                  stackId="sum"
                  stroke="#B8A9C9"
                  fill="#D4C4D9"
                  fillOpacity={0.7}
                  name="level"
                />
                {/* 소셜 영역 - 부드러운 스카이 블루 */}
                {hasSocial && (
                  <Area
                    type="monotone"
                    dataKey="social"
                    stackId="sum"
                    stroke="#8B9DC3"
                    fill="#A8C8EC"
                    fillOpacity={0.6}
                    name="social"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 호버 효과를 위한 추가 글로우 */}
        <div className="absolute inset-0 bg-transparent rounded-2xl xl:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />


      </div>

      {/* 카드 하단 그림자 효과 */}
      <div className="absolute -bottom-1 left-2 right-2 h-2  from-transparent via-black/10 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

export default function KPISection({
  filters = defaultFilters,
  data = null,
  className = ''
}: KPISectionProps) {
  // 법안명 매핑
  const lawNameMap: { [key: string]: string } = {
    privacy: "개인정보보호법",
    finance: "금융소비자보호법",
    safety: "산업안전보건법",
    child: "아동복지법"
  };

  // 4개 법안 데이터 생성 (privacy, finance, safety, child)
  const lawNames = ['privacy', 'finance', 'safety', 'child'];
  const items: KpiSeries[] = lawNames.map((lawName, index) => {
    // Mock 데이터 생성
    const baseValue = [3432, 26, 28, 100][index] || 0;
    const previousValue = [3200, 24, 25, 95][index] || 0;
    const growthRate = previousValue !== 0 ? ((baseValue - previousValue) / previousValue) * 100 : 0;

    return {
      label: lawNameMap[lawName] || lawName,
      value: baseValue,
      growthRate: growthRate,
      // 뉴스 시계열 (레벨) - 더미 데이터
      series: Array.from({ length: 7 }, (_, i) => ({
        date: String(i + 1),
        value: Math.floor(Math.random() * 50) + 10 + (index * 10)
      })),
      // 소셜 시계열 (찬성+반대 합) - 더미 데이터
      socialSeries: Array.from({ length: 7 }, (_, i) => ({
        date: String(i + 1),
        value: Math.floor(Math.random() * 100) + 20 + (index * 15)
      })),
      suffix: index === 3 ? "%" : "건",
    };
  });

  return (
    <section className={`relative w-full ${className}`}>


      {/* 메인 콘텐츠 */}
      <div className="relative z-10 p-2 xl:p-3 2xl:p-4">
        {/* 헤더 - 한글 폰트와 그라데이션 스타일 */}
        <div className="flex items-center justify-center mb-2 xl:mb-3 gap-3">
          <h3 className="text-lg xl:text-xl 2xl:text-2xl font-bold font-[var(--font-blackhan)]
                 text-[#2D2928] drop-shadow-lg text-center">
            전체 법안 요약 지표 (주별)
          </h3>
          <div className="relative group">
            <Image
              src="/icons/info.png"
              alt="도움말"
              width={20}
              height={20}
              title={`전체 법안들의 데이터 중 가장 최근 (주별) 기사량, 소셜 언급량, 전 기간 대비 기사 수 증감률 정보를 요약한 지표입니다.
                      [증감률 계산 안내]
                      • 전 기간 대비 기사 수 증감률(%)을 계산합니다.
                      • 전 기간 기사 수가 5건 미만일 경우, 증감률은 0%로 표시됩니다.
                      • 계산된 증감률이 500%를 초과할 경우, 최대 500%로 제한됩니다.`}
              className="object-contain cursor-pointer opacity-80 hover:opacity-100 transition-all duration-300 filter drop-shadow-md hover:scale-110"
            />
          </div>
        </div>

        {/* KPI 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 xl:gap-3 2xl:gap-4">
          {items.map((item, idx) => (
            <KpiCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

