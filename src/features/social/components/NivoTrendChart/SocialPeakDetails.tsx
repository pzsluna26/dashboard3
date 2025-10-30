// 상세분석(도넛차트 상세정보)

"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useBottomTicks } from "@/shared/hooks/useBottomTicks";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type Sentiment = "찬성" | "반대";
export type SubRankItem = { name: string; value: number };
export type SocialItem = {
  url?: string;
  content?: string;
  channel?: "트위터" | "커뮤니티" | "블로그" | "인스타" | string;
  date?: string;
  subCategory?: string;
};

type Props = {
  date?: string;
  sentiment?: Sentiment;
  subRanking?: Record<string, SubRankItem[]>;
  socialList?: SocialItem[];
  onClose?: () => void;
  periodLabel: string;
  midCategoryList: string[];
  subRankingMap: Record<string, SubRankItem[]>;
  resetTrigger?: number;
};

export default function SocialPeakDetails({
  date = "",
  sentiment = "찬성",
  subRanking = {},
  socialList = [],
  periodLabel = "",
  midCategoryList = [],
  onClose = () => { },
  resetTrigger, // <-- add this line
}: Props) {
  const color = sentiment === "찬성" ? "#a0c3f89f" : "#287dfd75";
  const { bottomTickFormatter } = useBottomTicks(periodLabel, [date]);

  const formattedDate = useMemo(() => {
    return bottomTickFormatter && date ? bottomTickFormatter(date) : date || "-";
  }, [bottomTickFormatter, date]);

  const [selectedMidCategory, setSelectedMidCategory] = useState<string>(midCategoryList[0] ?? "");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const topData = useMemo(() => {
    const data = subRanking[selectedMidCategory] ?? [];
    return data
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }, [subRanking, selectedMidCategory]);
const didInit = useRef(false);

useEffect(() => {
  if (!didInit.current && topData.length > 0) {
    setSelectedSubCategory(topData[0].name);
    setPage(1);
    didInit.current = true;
  }
}, [topData]);
  const option = useMemo(() => {
    const names = topData.map((d) => `${d.rank}. ${d.name}`);
    const values = topData.map((d) => d.value);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p?.name ?? ""}<br/><b>${p?.value ?? 0}</b> 건`;
        },
      },
      grid: { left: 150, right: 10, top: 10, bottom: 20 },
      xAxis: {
        type: "value",
        axisLabel: { color: "#d4d4d4" },
        splitLine: { lineStyle: { color: "#262626" } },
      },
      yAxis: {
        type: "category",
        data: names,
        inverse: true,
        axisLabel: { color: "#d4d4d4" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: "bar",
          data: values,
          barWidth: 20,
          itemStyle: { color, borderRadius: [1, 4, 4, 1] },
          label: {
            show: true,
            position: "right",
            color: "#e5e7eb",
            formatter: "{c}",
          },
        },
      ],
    } as const;
  }, [topData, color]);

  const onChartClick = (params: any) => {
    const match = params.name.match(/^\d+\. (.+)$/);
    const sub = match?.[1];
    if (sub) {
      setSelectedSubCategory(sub);
      setPage(1);
    }
  };

  const [selected, setSelected] = useState<SocialItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = (item: SocialItem) => {
    setSelected(item);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelected(null), 150);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);
  
  useEffect(() => {
    setSelectedSubCategory(null);
    setPage(1);
  }, [resetTrigger]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const PAGE_BUTTON_COUNT = 10;

  const filteredSocial = useMemo(() => {
    if (!selectedSubCategory) return [];
    return socialList.filter((item) => item.subCategory === selectedSubCategory);
  }, [socialList, selectedSubCategory]);

  const total = filteredSocial.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedSocial = filteredSocial.slice(start, start + PAGE_SIZE);

  const currentBlock = Math.floor((page - 1) / PAGE_BUTTON_COUNT);
  const startPage = currentBlock * PAGE_BUTTON_COUNT + 1;
  const endPage = Math.min(startPage + PAGE_BUTTON_COUNT - 1, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const ellipsis = (v?: string, n = 90) => (v ? (v.length > n ? `${v.slice(0, n)}…` : v) : "");

  return (
    <section className="w-full h-full rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center mb-4 gap-2">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              핫이슈 사건 및 여론반응
            </h3>
            <Image
              src="/icons/info.png"
              alt="도움말"
              width={24}
              height={24}
              title={`소셜 언급량 피크일(${periodLabel}별)의 사건별 여론 반응을 확인할 수 있습니다.`}
              className="object-contain cursor-pointer"
            />
          </div>
        </div>
        <p className="text-sm text-neutral-400 mt-1">
          <span className="mr-2">
            날짜: <span className="text-neutral-200">{formattedDate}</span>
          </span>
          <span>
            감성:{" "}
            <span className={sentiment === "찬성" ? "text-emerald-400" : "text-red-400"}>
              {sentiment}
            </span>
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar Chart */}

        <div className="lg:col-span-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <div className="mb-3">
            <select
              value={selectedMidCategory}
              onChange={(e) => {
                setSelectedMidCategory(e.target.value);
                setSelectedSubCategory(null); // 초기화!
                setPage(1);
              }}
              className="w-full text-sm bg-neutral-800 border border-neutral-700 text-white rounded-md px-2 py-1"
            >
              {midCategoryList.map((mid) => (
                <option key={mid} value={mid}>
                  {mid}
                </option>
              ))}
            </select>
          </div>

          {topData.length > 0 ? (
            <ReactECharts
              option={option}
              notMerge
              lazyUpdate
              style={{ height: 320 }}
              onEvents={{ click: onChartClick }}
            />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-neutral-400 text-center px-4">
              <span className="mx-1 font-semibold text-white">중분류</span>를 선택해주세요.
            </div>
          )}
        </div>


        {/* Right: Social Table OR 안내문구 */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          {selectedSubCategory ? (
            <>
              <div className="mb-2 text-xs text-neutral-400">
                <span className="text-sky-400 font-semibold">[{selectedSubCategory}]</span> 관련 의견만 표시 중 ·{" "}
                <button
                  onClick={() => {
                    setSelectedSubCategory(null);
                    setPage(1);
                  }}
                  className="underline text-sky-400 hover:text-sky-300"
                >
                  필터 해제
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-neutral-300">
                  대표의견{" "}
                  <span className={sentiment === "찬성" ? "text-emerald-400" : "text-red-400"}>
                    ({sentiment})
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  총 {total}건 · {page}/{totalPages} 페이지
                </div>
              </div>

              <div className="overflow-auto rounded-lg border border-neutral-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-900 sticky top-0 z-10">
                    <tr className="text-neutral-300">
                      <th className="px-3 py-2 text-left font-medium border-b border-neutral-800 w-28">소셜채널</th>
                      <th className="px-3 py-2 text-left font-medium border-b border-neutral-800 w-36">날짜</th>
                      <th className="px-3 py-2 text-left font-medium border-b border-neutral-800">대표의견</th>
                      <th className="px-3 py-2 text-right font-medium border-b border-neutral-800 w-20">보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSocial.map((a, idx) => (
                      <tr
                        key={`${a.channel}-${a.date}-${idx}-${page}`}
                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                      >
                        <td className="px-3 py-2 text-neutral-200 whitespace-nowrap">{a.channel}</td>
                        <td className="px-3 py-2 text-neutral-300 whitespace-nowrap font-mono">{a.date}</td>
                        <td className="px-3 py-2 text-neutral-300">
                          <span title={a.content} className="line-clamp-1">
                            {ellipsis(a.content, 90)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => openModal(a)}
                            className="px-2.5 py-1 text-xs rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                          >
                            자세히
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pagedSocial.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-neutral-500">
                          표시할 대표의견이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => goPage(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded bg-neutral-800 text-sm text-neutral-300 disabled:opacity-50"
                  >
                    ◀ 이전
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`px-3 py-1 rounded text-sm ${p === page
                        ? "bg-sky-600 text-white font-bold"
                        : "bg-neutral-700 text-neutral-300"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded bg-neutral-800 text-sm text-neutral-300 disabled:opacity-50"
                  >
                    다음 ▶
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-neutral-400 text-center px-4">
              <p>
                <span className="font-semibold text-white">소분류 바 항목</span>을 클릭하면 <br />
                관련 의견이 이곳에 표시됩니다.
              </p>
            </div>
          )}


          <p className="text-xs text-neutral-500 mt-4">
            중분류를 선택하면 해당 소분류별 언급량 순위를 볼 수 있습니다. <br />
            바를 클릭하면 해당 소분류 관련 의견만 우측에 표시됩니다.
          </p>
        </div>

      </div>



      {/* 모달 */}
      {isOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div
            ref={modalRef}
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl"
          >
            <div className="flex items-start justify-between p-4 md:p-5 border-b border-neutral-800">
              <div>
                <h4 className="text-base md:text-lg font-semibold text-white">대표의견 상세</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  <span className="mr-2">
                    채널: <span className="text-neutral-200">{selected.channel ?? "-"}</span>
                  </span>
                  <span>
                    날짜: <span className="font-mono text-neutral-300">{selected.date ?? "-"}</span>
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700"
              >
                닫기
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              <div>
                <div className="text-xs text-neutral-400 mb-1">대표의견</div>
                <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed">{selected.content ?? ""}</div>
              </div>
              {selected.url && (
                <div className="pt-2">
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm underline text-neutral-200 hover:text-white"
                  >
                    원문 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
