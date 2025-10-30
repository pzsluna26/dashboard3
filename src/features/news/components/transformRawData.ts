// 종합분석(누적그래프,핵심인사이트)
// 법안별 날짜, 뉴스합계, 소셜합계, 디테일(메타정보)
// trend

import type { PeriodKey, CategoryKey } from "@/shared/types/common";
import type { Detail } from "@/shared/types/common";
import { getSocialValue } from "@/shared/utils/computeKpis"; 

type LawTrendChartData = {
  name: CategoryKey;
  data: {
    date: string;
    news: number;
    social: number;
    detail?: Detail;
    rawSocial?: any;
  }[];
};

export function transformRawData(
  raw: Record<CategoryKey, any>,
  period: PeriodKey
): LawTrendChartData[] {
  // 법안별 데이터(원본 데이터)
  const lawData = Object.keys(raw) as CategoryKey[];

  return lawData.map((law) => {
    // 뉴스데이터(기간별)
    const timeline = raw[law]?.news?.[period] || {};
    // 소셜데이터(기간별)
    const socialTimeline = raw[law]?.social?.[period] || {};
    // x축 날짜 정렬
    const dates = Object.keys(timeline).sort();

    const entries = dates.map((date) => {
      const midList = timeline[date]?.["중분류목록"] || {};
      let detail: Detail | undefined;

      // 1) 기사 수(count)가 가장 많은 중분류(mid) 선택
      let bestMid: string | null = null;
      let bestMidCount = -1;
      for (const [mid, midData] of Object.entries<any>(midList)) {
        const c = midData.count || 0;
        if (c > bestMidCount) {
          bestMidCount = c;
          bestMid = mid;
        }
      }

      // 2) 선택된 중분류 안에서 가장 기사 많은 소분류 선택
      let bestSub: { name: string; count: number; article?: any } | null = null;
      if (bestMid) {
        const subList = (midList[bestMid] as any)?.["소분류목록"] || {};

        for (const [subName, subData] of Object.entries<any>(subList)) {
          const c = subData.count || 0;
          if (!bestSub || c > bestSub.count) {
            bestSub = {
              name: subName,
              count: c,
              article: subData.articles?.[0],
            };
          }
        }

        if (!bestSub) {
          bestSub = {
            name: "(소분류 없음)",
            count: (midList[bestMid] as any)?.count || 0,
            article: undefined,
          };
        }

        detail = {
          mid: bestMid,
          sub: { title: bestSub.name },
          count: bestSub.count,
          article: bestSub.article,
        };
      }

      // 소셜 데이터 처리
      const socialEntry = socialTimeline?.[date];
      const rawSocial = socialEntry?.counts ?? socialEntry ?? {}; // counts가 있으면 counts 사용

      const socialTotal = getSocialValue(rawSocial);

      return {
        date,
        news: Object.values(midList).reduce(
          (sum: number, m: any) => sum + (m.count || 0),
          0
        ),
        social: socialTotal, 
        detail,
        rawSocial,
      };
    });

    return { name: law, data: entries };
  });
}
