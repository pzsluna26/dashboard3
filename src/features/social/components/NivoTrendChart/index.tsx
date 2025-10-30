// 상세분석(메인)

"use client";

import { useEffect, useRef, useState } from "react";
import type { TrendProps, Sentiment } from "@/features/social/components/NivoTrendChart/types";
import { useBottomTicks } from "@/shared/hooks/useBottomTicks";
import {
  useSortedDates,
  useNewsSeries,
  useSocialSeries,
  useInitNewsSelection,
  useInitSocialSelection,
  useSocialReset,
  useBubbleNodes,
  useBubbleOption,
  useSocialOption,
} from "./hooks";

import LineChart from "./LineChart";
import BubblePanel from "./BubblePanel";
import SocialDonutCard from "./SocialDonutCard";
import ArticleSlider from "./ArticleSlider";
import Image from "next/image";

type Props = TrendProps & {
  onInitResetRef?: (fn: () => void) => void;
  onSocialResetRef?: (fn: () => void) => void;
  onClickSocialTab?: () => void;
};

export default function NivoTrendChart({
  newsTimeline,
  socialTimeline,
  view,
  setView,
  periodLabel = "",
  onSocialSliceClick,
  onInitResetRef,
  onSocialResetRef,
  onClickSocialTab,
}: Props) {
  // 날짜 및 시리즈 계산
  const sortedDates = useSortedDates(newsTimeline, socialTimeline);
  const newsSeries = useNewsSeries(newsTimeline, sortedDates);
  const socialSeries = useSocialSeries(socialTimeline, sortedDates);
  const chartData = view === "news" ? newsSeries : socialSeries;
  const yLegend = view === "news" ? "기사량" : "소셜 언급량";
  const { bottomTickFormatter, bottomTickValues } = useBottomTicks(periodLabel, sortedDates);

  const [resetTrigger, setResetTrigger] = useState(0);

  // 뉴스 초기 상태
  const {
    bubbleDate,
    setBubbleDate,
    selectedMid,
    setSelectedMid,
    selectedSub,
    setSelectedSub,
    selectedArticles,
    setSelectedArticles,
    resetToInitialNewsState,
  } = useInitNewsSelection(newsTimeline, sortedDates);

  // 부모에서 뉴스 초기화 함수 등록
  useEffect(() => {
    onInitResetRef?.(resetToInitialNewsState);
  }, [onInitResetRef, resetToInitialNewsState]);

  // 소셜 초기 선택 (피크일 기준 자동 선택)
  const { socialDate, setSocialDate } = useInitSocialSelection(
    view,
    socialTimeline,
    sortedDates,
    onSocialSliceClick
  );

  // 소셜 초기화 훅
  const { resetToInitialSocialState } = useSocialReset(setSocialDate);

  // 부모에서 소셜 초기화 함수 등록
  useEffect(() => {
    onSocialResetRef?.(resetToInitialSocialState);
  }, [onSocialResetRef, resetToInitialSocialState]);

  // 버블 관련 상태
  const { midNodes, subNodes, subByName } = useBubbleNodes(newsTimeline, bubbleDate, selectedMid);
  const bubbleNodes = selectedMid ? subNodes : midNodes;
  const bubbleOption = useBubbleOption(bubbleNodes, selectedMid);

  // 도넛 옵션
  const socialOption = useSocialOption(socialTimeline, socialDate);

  // 기사 슬라이드
  const slideRef = useRef<HTMLDivElement | null>(null);

  // 피크 포인트 클릭 시
  const handleMaxPointClick = (date: string) => {
    if (view === "news") {
      setBubbleDate(date);
      setSelectedMid(null);
      setSelectedSub(null);
      setSelectedArticles(null);
    } else {
      setSocialDate(date);
    }
  };

  // 데이터 없을 때
  if (sortedDates.length === 0) {
    return (
      <div className="bg-white/35 backdrop-blur-md p-6 rounded-xl border border-white/50 text-neutral-700">
        데이터가 없습니다.
      </div>
    );
  }

  // 소셜탭 클릭 핸들러
  const handleClickSocialTab = () => {
    if (onClickSocialTab) {
      // 부모(CategoryPage)가 완전 초기화를 담당함
      onClickSocialTab();
    } else {
      // 독립적으로 사용할 때 fallback
      setView("social");
      resetToInitialSocialState();
      setSelectedMid(null);
      setSelectedSub(null);
      setResetTrigger((v) => v + 1);
    }
  };

  const pillBase =
    "px-3 py-1.5 rounded-full text-sm border transition-colors";
  const pillActive = "bg-black text-white border-black";
  const pillIdle = "bg-white/70 text-neutral-700 border-white hover:bg-white";

  return (
    <>
      {/* 상단: 라인차트 */}
      <div className="flex w-full gap-6">
        {/* 라인차트 카드 (화이트 글래스) */}
        <div className="w-2/3 bg-white/35 backdrop-blur-md p-6 rounded-xl shadow-[0_12px_40px_rgba(20,30,60,0.12)] border border-white/50 text-neutral-700">
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-4 gap-2">
              <h2 className="text-xl font-semibold">
                뉴스/소셜 언급량 추이 ({periodLabel}별)
              </h2>
              <Image
                src="/icons/info.png"
                alt="도움말"
                width={24}
                height={24}
                title={`${periodLabel}별 뉴스/소셜 언급량 추이와 피크일을 나타낸 그래프입니다.`}
                className="object-contain cursor-pointer"
              />
            </div>

            {/* 탭 버튼 (pill) */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setView("news");
                  resetToInitialNewsState();
                }}
                className={`${pillBase} ${view === "news" ? pillActive : pillIdle}`}
              >
                뉴스
              </button>

              <button
                onClick={handleClickSocialTab}
                className={`${pillBase} ${view === "social" ? pillActive : pillIdle}`}
              >
                소셜
              </button>
            </div>
          </div>

          <LineChart
            view={view}
            data={chartData}
            yLegend={yLegend}
            periodLabel={periodLabel}

            onMaxPointClick={handleMaxPointClick}
          />
        </div>

        {/* 오른쪽 패널 (화이트 글래스) */}
        <div className="w-1/3 bg-white/35 backdrop-blur-md p-6 rounded-xl shadow-[0_12px_40px_rgba(20,30,60,0.12)]
                        h-[px]border border-white/50 text-neutral-700">
          {/* 소셜뷰 */}
          {view !== "news" ? (
            socialDate && socialOption ? (
              <SocialDonutCard
                socialDate={socialDate}
                option={socialOption}
                counts={{
                  찬성: socialTimeline[socialDate]?.counts?.찬성 ?? 0,
                  반대: socialTimeline[socialDate]?.counts?.반대 ?? 0,
                }}
                periodLabel={periodLabel}
                onClearDate={() => setSocialDate(null)}
                onSliceClick={(sentiment) => {
                  onSocialSliceClick?.(socialDate, sentiment);
                }}
              />
            ) : (
              <p className="text-neutral-700/70">
                그래프의{" "}
                <span className="mx-1 font-semibold text-neutral-800">
                  정점(피크일)
                </span>
                을 클릭하면 도넛 차트를 볼 수 있습니다.
              </p>
            )
          ) : !bubbleDate ? (
            // 뉴스뷰 - 버블 없음
            <p className="text-neutral-700/70">
              <span className="font-semibold">뉴스 피크일</span> 클릭 시 중분류 버블이 표시됩니다.
            </p>
          ) : (
            // 뉴스뷰 - 버블 있음
            <BubblePanel
              title={
                selectedMid
                  ? `${selectedMid} (${periodLabel}별)`
                  : `사건 테마 (${periodLabel}별)`
              }
              option={bubbleOption}
              periodLabel={periodLabel}
              onResetAll={() => {
                setBubbleDate(null);
                setSelectedMid(null);
                setSelectedSub(null);
                setSelectedArticles(null);
              }}
              onBackToMid={
                selectedMid
                  ? () => {
                    setSelectedMid(null);
                    setSelectedSub(null);
                    setSelectedArticles(null);
                  }
                  : undefined
              }
              onNodeClick={(id) => {
                if (!selectedMid) {
                  setSelectedMid(id);
                  setSelectedSub(null);
                  setSelectedArticles(null);
                } else {
                  const found = subByName.get(id);
                  setSelectedSub(id);
                  setSelectedArticles(found?.articles ?? []);
                  setTimeout(
                    () => slideRef.current?.scrollIntoView({ behavior: "smooth" }),
                    0
                  );
                }
              }}
              isSubCategory={!!selectedMid}

              titleClass="text-[#2D2928]"
              textClass="text-neutral-700"
              mutedTextClass="text-neutral-600"
            />
          )}
        </div>
      </div>

      {/* 기사 슬라이드 or 안내 */}
      {selectedMid && selectedSub && (selectedArticles?.length ?? 0) > 0 ? (
        <ArticleSlider
          slideRef={slideRef}
          periodLabel={periodLabel}
          date={bubbleDate!}
          mid={selectedMid}
          sub={selectedSub}
          articles={selectedArticles!}
          onClose={() => {
            setSelectedSub(null);
            setSelectedArticles(null);
          }}
        />
      ) : (
        view === "news" && (
          <div
            ref={slideRef}
            className="mt-2 w-full h-[320px] bg-white/35 backdrop-blur-md p-5 rounded-xl border border-white/50 text-neutral-700"
          >
            {selectedMid ? (
              <p className="text-neutral-700/80">
                <span className="mx-1 font-semibold">소분류 버블</span>을 클릭하면 기사 슬라이드가 나타납니다.
              </p>
            ) : (
              <p className="text-neutral-700/80">
                <span className="mx-1 font-semibold">중분류 버블</span>을 클릭하면 소분류로 드릴다운합니다.
              </p>
            )}
          </div>
        )
      )}
    </>
  );
}
