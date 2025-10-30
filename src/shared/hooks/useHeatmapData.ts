'use client';

import { useMemo } from 'react';
import { ProcessedData, DashboardFilters, HeatmapCellData, HeatmapInsight } from '@/shared/types/dashboard';

interface UseHeatmapDataResult {
  heatmapData: HeatmapCellData[];
  insights: HeatmapInsight[];
  categories: string[];
  stances: Array<{ key: 'reform' | 'abolish' | 'oppose'; label: string }>;
  loading: boolean;
  error: string | null;
}

export function useHeatmapData(
  data: ProcessedData | null,
  filters: DashboardFilters
): UseHeatmapDataResult {
  return useMemo(() => {
    console.log('Processing heatmap data:', { data: !!data, filters });

    if (!data) {
      return {
        heatmapData: [],
        insights: [],
        categories: [],
        stances: [
          { key: 'reform', label: '개정강화' },
          { key: 'abolish', label: '폐지완화' },
          { key: 'oppose', label: '반대' }
        ],
        loading: false,
        error: null
      };
    }

    try {
      // 필터 적용된 댓글 데이터
      const filteredComments = data.comments.filter(comment => {
        // 기간 필터
        const withinPeriod = isWithinPeriod(comment.createdAt, filters.period);
        if (!withinPeriod) return false;

        // 카테고리 필터
        if (filters.category.length > 0) {
          const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
          if (!legalArticle || !filters.category.includes(legalArticle.category)) {
            return false;
          }
        }

        // 출처 필터
        if (filters.source.length > 0 && !filters.source.includes(comment.source)) {
          return false;
        }

        return true;
      });

      console.log('Filtered comments for heatmap:', filteredComments.length);

      // 법 분야별 입장 분포 계산
      const categoryStanceMap = new Map<string, Map<string, number>>();
      
      filteredComments.forEach(comment => {
        const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
        if (!legalArticle) return;

        const category = legalArticle.category;
        const stance = comment.stance;

        if (!categoryStanceMap.has(category)) {
          categoryStanceMap.set(category, new Map([
            ['reform', 0],
            ['abolish', 0],
            ['oppose', 0]
          ]));
        }

        const stanceMap = categoryStanceMap.get(category)!;
        stanceMap.set(stance, (stanceMap.get(stance) || 0) + 1);
      });

      console.log('Category stance map:', Array.from(categoryStanceMap.entries()));

      // 카테고리 목록 생성
      const categories = Array.from(categoryStanceMap.keys()).sort();
      
      // 히트맵 데이터 생성
      const heatmapData: HeatmapCellData[] = [];
      const stances: Array<{ key: 'reform' | 'abolish' | 'oppose'; label: string }> = [
        { key: 'reform', label: '개정강화' },
        { key: 'abolish', label: '폐지완화' },
        { key: 'oppose', label: '반대' }
      ];

      // 전체 댓글 수 계산 (비율 계산용)
      const totalComments = filteredComments.length;
      
      // 각 카테고리별 총 댓글 수 계산
      const categoryTotals = new Map<string, number>();
      categories.forEach(category => {
        const stanceMap = categoryStanceMap.get(category)!;
        const total = Array.from(stanceMap.values()).reduce((sum, count) => sum + count, 0);
        categoryTotals.set(category, total);
      });

      // 최대값 찾기 (색상 강도 정규화용)
      let maxValue = 0;
      categories.forEach(category => {
        stances.forEach(stance => {
          const value = categoryStanceMap.get(category)?.get(stance.key) || 0;
          maxValue = Math.max(maxValue, value);
        });
      });

      // 히트맵 셀 데이터 생성
      categories.forEach(category => {
        stances.forEach(stance => {
          const value = categoryStanceMap.get(category)?.get(stance.key) || 0;
          const categoryTotal = categoryTotals.get(category) || 0;
          const percentage = categoryTotal > 0 ? (value / categoryTotal) * 100 : 0;
          const intensity = maxValue > 0 ? value / maxValue : 0;
          
          // 색상 결정 (요구사항 8.2에 따라)
          let color: string;
          if (percentage >= 50) {
            color = '#DC2626'; // 진한 빨강 (50% 이상)
          } else if (percentage >= 20) {
            color = '#F59E0B'; // 노랑 (20-50%)
          } else {
            color = '#10B981'; // 초록 (20% 미만)
          }

          heatmapData.push({
            category,
            stance: stance.key,
            value,
            percentage,
            color,
            intensity
          });
        });
      });

      console.log('Generated heatmap data:', heatmapData);

      // 인사이트 생성
      const insights: HeatmapInsight[] = generateInsights(heatmapData, categories, stances);

      return {
        heatmapData,
        insights,
        categories,
        stances,
        loading: false,
        error: null
      };

    } catch (error) {
      console.error('Error processing heatmap data:', error);
      return {
        heatmapData: [],
        insights: [],
        categories: [],
        stances: [
          { key: 'reform', label: '개정강화' },
          { key: 'abolish', label: '폐지완화' },
          { key: 'oppose', label: '반대' }
        ],
        loading: false,
        error: error instanceof Error ? error.message : '히트맵 데이터 처리 중 오류가 발생했습니다.'
      };
    }
  }, [data, filters]);
}

// 기간 필터 헬퍼 함수
function isWithinPeriod(dateString: string, period: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  switch (period) {
    case '7d':
      return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '14d':
      return date >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case '30d':
      return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return true;
    default:
      return true;
  }
}

// 인사이트 생성 함수
function generateInsights(
  heatmapData: HeatmapCellData[], 
  categories: string[], 
  stances: Array<{ key: 'reform' | 'abolish' | 'oppose'; label: string }>
): HeatmapInsight[] {
  const insights: HeatmapInsight[] = [];

  if (heatmapData.length === 0) return insights;

  // 가장 높은 비율 찾기
  const highestCell = heatmapData.reduce((max, cell) => 
    cell.percentage > max.percentage ? cell : max
  );

  if (highestCell.percentage > 0) {
    const stanceLabel = stances.find(s => s.key === highestCell.stance)?.label || highestCell.stance;
    insights.push({
      type: 'highest',
      category: highestCell.category,
      stance: highestCell.stance,
      value: highestCell.value,
      percentage: highestCell.percentage,
      description: `${highestCell.category} 분야에서 ${stanceLabel} 의견이 ${highestCell.percentage.toFixed(1)}%로 가장 높습니다.`
    });
  }

  // 가장 낮은 비율 찾기 (0이 아닌 값 중에서)
  const nonZeroCells = heatmapData.filter(cell => cell.percentage > 0);
  if (nonZeroCells.length > 0) {
    const lowestCell = nonZeroCells.reduce((min, cell) => 
      cell.percentage < min.percentage ? cell : min
    );

    const stanceLabel = stances.find(s => s.key === lowestCell.stance)?.label || lowestCell.stance;
    insights.push({
      type: 'lowest',
      category: lowestCell.category,
      stance: lowestCell.stance,
      value: lowestCell.value,
      percentage: lowestCell.percentage,
      description: `${lowestCell.category} 분야에서 ${stanceLabel} 의견이 ${lowestCell.percentage.toFixed(1)}%로 가장 낮습니다.`
    });
  }

  // 트렌드 분석 (개정강화 의견이 많은 분야)
  const reformCells = heatmapData.filter(cell => cell.stance === 'reform' && cell.percentage >= 40);
  if (reformCells.length > 0) {
    const topReformCategory = reformCells.reduce((max, cell) => 
      cell.percentage > max.percentage ? cell : max
    );

    insights.push({
      type: 'trend',
      category: topReformCategory.category,
      stance: 'reform',
      value: topReformCategory.value,
      percentage: topReformCategory.percentage,
      description: `${topReformCategory.category} 분야는 개정강화 요구가 ${topReformCategory.percentage.toFixed(1)}%로 높아 주목이 필요합니다.`
    });
  }

  return insights.slice(0, 3); // 최대 3개 인사이트
}