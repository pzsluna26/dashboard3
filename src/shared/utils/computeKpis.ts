import { KpiItem, PeriodKey } from "@/shared/types/common";

const LAWS = ["privacy", "child", "safety", "finance"] as const;

// 신규/구 스키마 모두 대응: 숫자 | { counts: {찬성,반대} } | {찬성,반대}
export function getSocialValue(entry: any): number {
  if (entry == null) return 0;
  if (typeof entry === "number") return entry;
  if (typeof entry === "object") {
    if ("counts" in entry && entry.counts && typeof entry.counts === "object") {
      const agree = typeof entry.counts["찬성"] === "number" ? entry.counts["찬성"] : 0;
      const disagree = typeof entry.counts["반대"] === "number" ? entry.counts["반대"] : 0;
      return agree + disagree;
    }
    const agree = typeof entry["찬성"] === "number" ? entry["찬성"] : 0;
    const disagree = typeof entry["반대"] === "number" ? entry["반대"] : 0;
    return agree + disagree;
  }
  return 0;
}

// 핵심인사이트 라인3 소셜언급량
function normalizeRawSocial(entry: any): Record<string, number> {
  if (!entry) return {};

  // monthly_timeline 구조 대응
  if (entry?.monthly_timeline) {
    const latestKey = Object.keys(entry.monthly_timeline).sort().pop();
    return entry.monthly_timeline[latestKey]?.counts ?? {};
  }

  // 이미 평평하거나 counts 구조면 그대로 리턴
  if (entry.counts) return entry.counts;
  return entry;
}

export function computeKpis(allData: any, period: PeriodKey): KpiItem[] {
  return LAWS.map((law) => {
    // 뉴스 데이터(선택된 기간)
    const timeline = allData[law].news[period];
    const dates = Object.keys(timeline).sort();

    const latest = dates[dates.length - 1];
    const prev = dates[dates.length - 2];

    // 기사량 계산
    const latestNewsTotal = Object.values(timeline[latest]?.중분류목록 ?? {}).reduce(
      (sum: number, cur: any) => sum + (cur?.count ?? 0),
      0
    );

    const prevNewsTotal = prev
      ? Object.values(timeline[prev]?.중분류목록 ?? {}).reduce(
          (sum: number, cur: any) => sum + (cur?.count ?? 0),
          0
        )
      : 0;

    // 증감률 계산 (안정화)
    let growthRate = 0;
    if (prevNewsTotal >= 5) {
      const rawRate = ((latestNewsTotal - prevNewsTotal) / prevNewsTotal) * 100;
      growthRate = Math.min(rawRate, 500);
    } else {
      growthRate = 0;
    }

    // 소셜 데이터 (깊은 구조 평탄화)
    const socialTimeline = allData[law].social?.[period];
    const socialLatest = socialTimeline?.[latest];
    const flatSocial = normalizeRawSocial(socialLatest);

    const socialTotal = getSocialValue(flatSocial);

    return {
      name: law,
      value: latestNewsTotal,
      growthRate,
      socialTotal,
      rawSocial: flatSocial,  
    };
  });
}
