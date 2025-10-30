// 종합분석(법안랭킹)

"use client";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { KpiItem } from "@/shared/types/common";
import { LAW_LABEL } from "@/shared/constants/labels";

const ITEM_HEIGHT = 44;
const TOP_N = 4;
const STAGGER = 0.35;
const ENTER_DUR = 0.4;
const HOLD_AFTER = 1.2;
const INTRO_ONLY_1 = 0.8;

export default function LawRankingCard({
  data,
  className,
  periodLabel,
}: {
  data: KpiItem[];
  className?: string;
  periodLabel: string;
}) {
  const ranking = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          b.value - a.value ||
          b.socialTotal - a.socialTotal ||
          a.name.localeCompare(b.name)
      )
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }, [data]);

  const top = ranking.slice(0, Math.min(TOP_N, ranking.length));

  const [cycleKey, setCycleKey] = useState(0);
  useEffect(() => {
    if (top.length < 1) return;
    const total =
      INTRO_ONLY_1 + (Math.max(0, top.length - 1) * STAGGER + ENTER_DUR) + HOLD_AFTER;
    const id = setInterval(() => setCycleKey((k) => k + 1), total * 1000);
    return () => clearInterval(id);
  }, [top.length]);

  return (
    <div
      className={`
        ${className ?? ""}
      `}
    >
      <div className="flex items-center mb-4 gap-2">
        <h3 className="text-2xl font-bold leading-none align-middle p-1 text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] font-[var(--font-blackhan)] drop-shadow-sm">법안 랭킹 ({periodLabel}별)</h3>
        <Image
          src="/icons/info.png"
          alt="도움말"
          width={24}
          height={24}
          title={`전체 법안의 데이터 중 가장 최근 (${periodLabel}별) 기사 수 기준 랭킹입니다.
                • 기사 수가 같을 경우, 소셜 언급량이 많은 법안을 우선 표시합니다.
                • 기사 수와 소셜 언급량이 같으면 이름순으로 정렬됩니다.

                [증감률 계산 안내]
                • 전 기간 대비 기사 수 증감률(%)을 계산합니다.
                • 전 기간 기사 수가 5건 미만일 경우, 증감률은 0%로 표시됩니다.
                • 계산된 증감률이 500%를 초과할 경우, 최대 500%로 제한됩니다.`}
          className="object-contain cursor-pointer align-middle"
        />
      </div>
        <div className="h-[275px] flex flex-col
        bg-white/30 backdrop-blur-xl rounded-2xl p-4
        border border-white/40 mt-6
        shadow-[0_20px_60px_rgba(31,38,135,0.2)]
        text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)]">
      <ol className="mt-5 flex-1 min-h-0 overflow-hidden list-none m-0 p-0">
        <div style={{ height: ITEM_HEIGHT * Math.max(1, top.length) }}>
          {top.map((item, idx) => {
            const isUp = item.growthRate > 0;
            const isDown = item.growthRate < 0;

            return (
              <li
                key={`${item.name}-${cycleKey}`}
                className="flex items-center justify-between px-2 rounded-lg h-[55px]"
              >
                <motion.div
                  initial={idx === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx === 0 ? 0 : INTRO_ONLY_1 + (idx - 1) * STAGGER,
                    duration: ENTER_DUR,
                    ease: "easeOut",
                  }}
                  className="w-full flex items-center justify-between"
                >
                  {/* 순위 + 이름 */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] text-lg font-bold shadow-sm">
                      {item.rank}
                    </span>
                    <Link
                      href={`/news/category/${encodeURIComponent(item.name)}`}
                      className="truncate hover:underline text-lg font-medium text-[color-mix(in_oklab,var(--color-neutral-700)_100%,transparent)] hover:text-[color-mix(in_oklab,var(--color-blue-600)_100%,transparent)] transition-colors duration-200"
                      title={LAW_LABEL[item.name]}
                    >
                      {LAW_LABEL[item.name]}
                    </Link>
                  </div>

                  {/* 기사량 + 증감률 */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)] hidden md:inline font-medium">
                      {item.value.toLocaleString()}건
                    </span>
                    <span
                      className={`text-xs md:text-sm font-bold px-2 py-1 rounded-md backdrop-blur-sm border ${
                        isUp
                          ? "text-[color-mix(in_oklab,var(--color-emerald-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-green-50)_80%,transparent)] border-[color-mix(in_oklab,var(--color-emerald-400)_30%,transparent)]"
                          : isDown
                          ? "text-[color-mix(in_oklab,var(--color-rose-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-red-50)_80%,transparent)] border-[color-mix(in_oklab,var(--color-red-400)_30%,transparent)]"
                          : "text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-gray-50)_80%,transparent)] border-[color-mix(in_oklab,var(--color-gray-300)_30%,transparent)]"
                      }`}
                      title="전기간 대비 증감률"
                    >
                      {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
                      {Math.abs(item.growthRate).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </div>
      </ol>
      </div>
    </div>
  );
}
