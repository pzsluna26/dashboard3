// 상세분석(찬성/반대 도넛차트)

"use client";
import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useBottomTicks } from "@/shared/hooks/useBottomTicks";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Props = {
  socialDate: string;
  option: any;
  periodLabel: string;
  counts: { 찬성: number; 반대: number };
  onClearDate: () => void;
  onSliceClick?: (sentiment: "찬성" | "반대") => void;
};

export default function SocialDonutCard({
  socialDate,
  option,
  periodLabel,
  counts,
  onClearDate,
  onSliceClick,
}: Props) {
  const { bottomTickFormatter } = useBottomTicks(periodLabel, [socialDate]);
  const formattedDate = bottomTickFormatter?.(socialDate) ?? socialDate;

  const onEvents = React.useMemo(
    () => ({
      click: (params: any) => {
        const name = params?.name as "찬성" | "반대" | undefined;
        if (name === "찬성" || name === "반대") onSliceClick?.(name);
      },
    }),
    [onSliceClick]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center mb-4 gap-2">
            <h4 className="text-xl font-semibold">여론 찬/반 비율 ({periodLabel}별)</h4>
            <Image
              src="/icons/info.png"
              alt="도움말"
              width={24}
              height={24}
              title={`소셜 언급량 피크일(${periodLabel}별)의 여론 찬성/반대 비율을 나타낸 그래프입니다.`}
              className="object-contain cursor-pointer"
            />
          </div>
          <span>{formattedDate}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300"
            onClick={onClearDate}
          >
            초기화
          </button>
        </div>
      </div>

      <ReactECharts
        key={socialDate}
        option={option}
        notMerge={false}
        lazyUpdate={false}
        onEvents={onEvents}
        style={{ height: 360 }}
      />

      <p className="text-neutral-400 text-xs mt-15">
        도넛에서 <span className="mx-1 font-semibold text-white">찬성/반대</span> 조각을 클릭하면 상세가 열립니다.
      </p>
    </>
  );
}
