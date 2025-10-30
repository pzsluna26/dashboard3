// 종합분석(누적라인차트+상세정보카드)

"use client";
import { ResponsiveLine } from "@nivo/line";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useBottomTicks } from "@/shared/hooks/useBottomTicks";
import type { CategoryKey, PeriodLabel } from "@/shared/types/common";
import type { Detail } from "@/shared/types/common";
import { LAW_LABEL } from '@/shared/constants/labels';
import { getSocialValue } from "@/shared/utils/computeKpis";

type LawTrendChartProps = {
  data: {
    name: CategoryKey;
    data: {
      date: string;
      news: number;
      social: number;
      detail?: Detail;
      rawSocial?: {
        counts?: {
          찬성?: number;
          반대?: number;
        };
        찬성_대표의견?: string[];
        반대_대표의견?: string[];
      };
    }[];
  }[];
  period: PeriodLabel;
};

export default function LawTrendChart({ data, period }: LawTrendChartProps) {
  const [selectedPeak, setSelectedPeak] = useState<any>(null);

  useEffect(() => {
    setSelectedPeak(null);
  }, [period]);

  const allDates = useMemo(() => {
    const s = new Set<string>();
    for (const law of data) for (const d of law.data) s.add(d.date);
    return Array.from(s).sort();
  }, [data]);

  const { bottomTickFormatter: tickFormatter, bottomTickValues: tickValues } =
    useBottomTicks(period, allDates);

  const { chartData, axisLeftLegend } = useMemo(() => {
    const socialSumByDate: Record<string, { y: number; rep?: any }> = {};
    const newsSumByDate: Record<string, { y: number; rep?: any }> = {};

    for (const date of allDates) {
      const entries = data
        .map((law) => {
          const found = law.data.find((d) => d.date === date);
          if (!found) return null;

          const normalizedDetail = found.detail
            ? {
                ...found.detail,
                sub:
                  typeof (found.detail as any).sub === "string"
                    ? { title: (found.detail as any).sub as unknown as string }
                    : found.detail.sub,
              }
            : undefined;

          return { ...found, law: law.name, detail: normalizedDetail };
        })
        .filter(Boolean) as any[];

      const socialSum = entries.reduce((acc, e) => acc + getSocialValue(e.rawSocial), 0);
      const newsSum = entries.reduce((acc, e) => acc + (e.news ?? 0), 0);

      const socialPeakData =
        entries.length > 0
          ? entries.reduce((a, b) =>
              getSocialValue(b.rawSocial) > getSocialValue(a.rawSocial) ? b : a
            )
          : undefined;

      const newsPeakData =
        entries.length > 0
          ? entries.reduce((a, b) => ((b.news ?? 0) > (a.news ?? 0) ? b : a))
          : undefined;

      socialSumByDate[date] = {
        y: socialSum,
        rep: socialPeakData ? { ...socialPeakData, kind: "social" } : undefined,
      };

      newsSumByDate[date] = {
        y: newsSum,
        rep: newsPeakData ? { ...newsPeakData, kind: "news" } : undefined,
      };
    }

    const socialSerie = {
      id: "소셜 언급량(합계)",
      data: allDates.map((date) => ({
        x: date,
        y: socialSumByDate[date]?.y ?? 0,
        ...socialSumByDate[date]?.rep,
      })),
    };

    const newsSerie = {
      id: "뉴스 언급량(합계)",
      data: allDates.map((date) => ({
        x: date,
        y: newsSumByDate[date]?.y ?? 0,
        ...newsSumByDate[date]?.rep,
      })),
    };

    return {
      chartData: [socialSerie, newsSerie],
      axisLeftLegend: "언급량(합계)",
    };
  }, [data, allDates]);

  const colors = [
    "#8B9DC3", // 부드러운 라벤더 블루
    "#A8C8EC", // 부드러운 스카이 블루
    "#B8A9C9", // 부드러운 라벤더
    "#C9A96E", // 부드러운 골드
    "#A8B8A8"  // 부드러운 세이지 그린
  ]; // 부드럽고 조화로운 색상 팔레트

  const MaxLabels = ({ series }: any) => {
    const maxNodes = series
      .map((s: any) => {
        const valid = s.data.filter(
          (d: any) => typeof d?.data?.y === "number" && isFinite(d.data.y)
        );
        if (!valid.length) return null;
        const maxDatum = valid.reduce((a: any, b: any) => (b.data.y > a.data.y ? b : a));
        return {
          id: s.id,
          color: s.color,
          value: maxDatum.data.y,
          x: maxDatum.position.x,
          y: maxDatum.position.y,
          raw: maxDatum.data,
        };
      })
      .filter(Boolean);

    return (
      <g>
        {maxNodes.map((p: any, idx: number) => (
          <g
            key={`${p.id}-${idx}`}
            transform={`translate(${p.x}, ${p.y})`}
            className="cursor-pointer"
            onClick={() => setSelectedPeak(p.raw)}
          >
            <circle r={12} fill="#ffffff" stroke={p.color} strokeWidth={3}>
              <title>마커를 클릭하면 우측 카드에서 상세정보를 확인할 수 있습니다.</title>
            </circle>
            <rect
              x={-80}
              y={-47}
              rx={10}
              ry={6}
              width={175}
              height={30}
              fill="color-mix(in oklab, var(--color-sky-100) 80%, transparent)"
              stroke={p.color}
            />
            <text x={-67} y={-26} fontSize={15} fill="color-mix(in oklab, var(--color-neutral-700) 100%, transparent)">
              {`${p.id}: ${p.value}`}
            </text>
          </g>
        ))}
      </g>
    );
  };

  function getPolarized(rawSocial?: any) {
    const flat = getSocialValue(rawSocial);
    const agree = rawSocial?.counts?.찬성 ?? rawSocial?.찬성 ?? 0;
    const disagree = rawSocial?.counts?.반대 ?? rawSocial?.반대 ?? 0;
    const total = agree + disagree;
    const agreePct = total ? Math.round((agree / total) * 100) : 0;
    const disagreePct = total ? 100 - agreePct : 0;

    return {
      agree,
      disagree,
      total,
      agreePct,
      disagreePct,
      agreeRep: rawSocial?.찬성_대표의견?.[0],
      disagreeRep: rawSocial?.반대_대표의견?.[0],
    };
  }

  // 우측 카드
  const Card = () => {
    if (!selectedPeak) {
      return (
        <div className="w-1/3 bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-[0_20px_60px_rgba(31,38,135,0.2)] text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)]">
          <h3 className="text-2xl font-bold font-[var(--font-blackhan)] text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] drop-shadow-sm mb-4">이슈에 대한 여론반응</h3>
          <p className="text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)]">
            최대값 마커를 클릭하면 상세 정보가 여기에 표시됩니다.
          </p>
        </div>
      );
    }

    const law = selectedPeak.law ?? "-";
    const rawDate: string = selectedPeak.x ?? "-";
    const displayDate =
      typeof tickFormatter === "function" ? tickFormatter(rawDate) : rawDate;

    const detail: Detail | undefined = selectedPeak.detail;
    const pol = getPolarized(selectedPeak.rawSocial);

    const isSocial = selectedPeak.kind === "social";
    const title = isSocial ? "소셜이 주목한 이슈" : "언론이 주목한 이슈";

    return (
      <div className="w-1/3 bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-[0_20px_60px_rgba(31,38,135,0.2)] text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)]">
        <div className="flex items-center mb-4 gap-2">
          <h3 className="text-2xl font-bold font-[var(--font-blackhan)] text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] drop-shadow-sm">
            {title} ({period}별)
          </h3>
         
        </div>

        <h4 className="text-xl font-bold text-[color-mix(in_oklab,var(--color-blue-700)_100%,transparent)] font-[var(--font-jua)]">
          {LAW_LABEL[law as keyof typeof LAW_LABEL] ?? law}{" "}
          (<abbr title={rawDate}>{displayDate}</abbr>)
        </h4>

        <p className="mb-1">
          <span className="font-bold text-lg text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)]">이 날의 핫이슈 사건:</span>{" "}
          {detail?.sub?.title ?? "정보 없음"}
          {typeof detail?.count === "number" && (
            <span className="text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)]"> (관련 기사 {detail.count}건)</span>
          )}
        </p>
        {detail?.mid && (
          <p className="text-lg text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)] mb-4">테마: {detail.mid}</p>
        )}
        {detail?.article && (
          <div className="mt-10 flex flex-col">
            <p className="font-bold mb-1 text-lg text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)]">관련 대표 기사</p>
            <a
              href={detail.article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color-mix(in_oklab,var(--color-sky-600)_100%,transparent)] hover:text-[color-mix(in_oklab,var(--color-sky-700)_100%,transparent)] hover:underline transition-colors duration-200"
            >
              {detail.article.title}
            </a>
          </div>
        )}

        {/* 찬반 가로 누적 막대 - CSS 팔레트 색상 사용 */}
        <div className="mt-10 mb-2">
          <h1 className="text-xl font-bold text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)]">'{displayDate}' 여론 찬/반 비율</h1>
          <div className="w-full h-6 bg-[color-mix(in_oklab,var(--color-neutral-200)_100%,transparent)] rounded-lg overflow-hidden flex mt-2 border border-white/30">
            <div
              className="h-6 transition-all duration-300"
              style={{ 
                width: `${pol.agreePct}%`, 
                backgroundColor: "#8B9DC3" // 부드러운 라벤더 블루
              }}
              title={`찬성 ${pol.agreePct}%`}
            />
            <div
              className="h-6 transition-all duration-300"
              style={{
                width: `${pol.disagreePct}%`,
                backgroundColor: "#B8A9C9", // 부드러운 라벤더
              }}
              title={`반대 ${pol.disagreePct}%`}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)] font-medium">
            <span className="px-2 py-1 bg-[color-mix(in_oklab,var(--color-blue-50)_80%,transparent)] rounded-md border border-[color-mix(in_oklab,var(--color-blue-200)_50%,transparent)]">
              찬성 {pol.agreePct}% ({pol.agree})
            </span>
            <span className="px-2 py-1 bg-[color-mix(in_oklab,var(--color-gray-50)_80%,transparent)] rounded-md border border-[color-mix(in_oklab,var(--color-gray-200)_50%,transparent)]">
              반대 {pol.disagreePct}% ({pol.disagree})
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full gap-6">
      {/* 차트 컨테이너: 글래스모피즘 스타일 */}
      <div className="w-2/3 h-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-[0_20px_60px_rgba(31,38,135,0.2)] text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)]">
        <div className="flex items-center mb-4 gap-2">
          <h3 className="text-2xl font-bold font-[var(--font-blackhan)] text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] drop-shadow-sm">법안별 언급량 추이 ({period}별)</h3>
           <Image
            src="/icons/info.png"
            alt="도움말"
            width={24}
            height={24}
            title={`(${period}별)의 해당 법안명, 일자, 핫이슈 사건(관련 기사수), 사건의 테마, 관련 대표 기사와 해당 날짜 여론의 찬성/반대 비율을 나타냅니다.`}
            className="object-contain cursor-pointer relative z-50"
          />
        </div>
        <div style={{ height: 350 }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 40, right: 120, bottom: 60, left: 70 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", stacked: false }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -35,
              tickValues,
              format: tickFormatter,
              legend: "기간",
              legendOffset: 46,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              legend: axisLeftLegend,
              legendOffset: -40,
              legendPosition: "middle",
            }}
            colors={colors}
            enablePoints={false}
            lineWidth={2}
            enableArea={true}
            areaOpacity={0.35}
            useMesh={true}
            theme={{
              text: { fill: "color-mix(in oklab, var(--color-neutral-700) 100%, transparent)" },
              axis: {
                domain: { line: { stroke: "color-mix(in oklab, var(--color-neutral-400) 100%, transparent)" } },
                ticks: {
                  line: { stroke: "color-mix(in oklab, var(--color-gray-300) 100%, transparent)" },
                  text: { fill: "color-mix(in oklab, var(--color-neutral-700) 100%, transparent)" },
                },
              },
              grid: { line: { stroke: "color-mix(in oklab, var(--color-gray-200) 100%, transparent)" } },
              crosshair: { line: { stroke: "color-mix(in oklab, var(--color-sky-500) 100%, transparent)", strokeWidth: 2 } },
              tooltip: {
                container: { 
                  background: "color-mix(in oklab, var(--color-white) 95%, transparent)", 
                  color: "color-mix(in oklab, var(--color-neutral-800) 100%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--color-white) 50%, transparent)",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)"
                },
              },
            }}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                translateX: 130,
                itemWidth: 120,
                itemHeight: 20,
                symbolSize: 12,
                itemTextColor: "color-mix(in oklab, var(--color-neutral-700) 100%, transparent)",
              },
            ]}
            layers={[
              "grid",
              "markers",
              "areas",
              "lines",
              "slices",
              "axes",
              "points",
              "legends",
              "crosshair",
              MaxLabels,
            ]}
          />
        </div>
      </div>

      {/* 우측 카드 */}
      <Card />
    </div>
  );
}
