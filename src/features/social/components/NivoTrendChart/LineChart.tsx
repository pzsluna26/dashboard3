// 상세분석(누적라인차트+뉴스,소셜탭)

"use client";
import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useBottomTicks } from "@/shared/hooks/useBottomTicks";

type Props = {
  view: "news" | "social";
  data: Array<{
    id: string;
    color?: string;
    data: Array<{ x: string; y: number }>;
  }>;
  yLegend: string;
  periodLabel?: string;
  onMaxPointClick: (date: string) => void;
};

export default function LineChart({
  view,
  data,
  yLegend,
  periodLabel,
  onMaxPointClick,
}: Props) {
  const allDates = useMemo(() => {
    const s = new Set<string>();
    for (const serie of data ?? []) {
      for (const p of serie?.data ?? []) s.add(String(p.x));
    }
    return Array.from(s).sort();
  }, [data]);

  const { bottomTickFormatter, bottomTickValues } = useBottomTicks(
    periodLabel,
    allDates
  );

  // 커스텀 최댓값 라벨
  const MaxLabels = ({ series }: any) => {
    const maxNodes = series
      .map((s: any) => {
        const valid = s.data.filter(
          (d: any) => typeof d?.data?.y === "number" && isFinite(d.data.y)
        );
        if (!valid.length) return null;
        const maxDatum = valid.reduce((a: any, b: any) =>
          b.data.y > a.data.y ? b : a
        );
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
        {maxNodes.map((p: any, i: number) => (
          <g
            key={`${p.id}-${i}`}
            transform={`translate(${p.x}, ${p.y})`}
            className="cursor-pointer"
            onClick={() => onMaxPointClick(p.raw?.x as string)}
          >
            <circle r={7} fill="#ffffff" stroke={p.color} strokeWidth={3} />
            <rect
              x={-21}
              y={-29}
              rx={8}
              ry={8}
              width={50}
              height={20}
              fill="rgba(59,130,246,0.10)"  // 더 옅게
              stroke="#3B82F6"
            />
            <text x={-15} y={-15} fontSize={12} fill="#374151">{/* neutral-700 */}
              {`  ${p.value} 건`}
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 30, bottom: 60, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "0", max: "auto", stacked: false }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -35,
          format: bottomTickFormatter as any,
          tickValues: bottomTickValues as any,
          legend: periodLabel ? `${periodLabel} 단위` : undefined,
          legendOffset: 50,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: yLegend,
          legendOffset: -50,
          legendPosition: "middle",
        }}
        enablePoints={false}
        enableArea={true}
        useMesh={true}
        theme={{
          // 전체 텍스트 기본색 (x축 날짜 레이블 포함)
          textColor: "#374151", // neutral-700
          axis: {
            // 축 틱 텍스트 색
            ticks: { text: { fill: "#374151" } }, // x,y 공통
            legend: { text: { fill: "#374151" } },
            domain: { line: { stroke: "#E5E7EB" } }, // 축선 라이트
          },
          // 격자를 더 옅게
          grid: { line: { stroke: "#E5E7EB", strokeWidth: 1 } }, // neutral-200 정도
          // 라이트 톤 툴팁
          tooltip: {
            container: {
              background: "#FFFFFF",
              color: "#111827",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            },
          },
        }}
        colors={{ datum: "color" }}
        lineWidth={2}
        legends={
          view === "social"
            ? [
                {
                  anchor: "bottom-right",
                  direction: "row",
                  translateX: 5,
                  translateY: -320,
                  itemWidth: 50,
                  itemHeight: 20,
                  symbolSize: 15,
                  symbolShape: "circle",
                  toggleSerie: true,
                  itemTextColor: "#374151", // 라이트 톤
                },
              ]
            : undefined
        }
        layers={[
          "grid",
          "markers",
          "areas",
          "lines",
          "slices",
          "axes",
          "legends",
          "crosshair",
          MaxLabels,
        ]}
      />
    </div>
  );
}
