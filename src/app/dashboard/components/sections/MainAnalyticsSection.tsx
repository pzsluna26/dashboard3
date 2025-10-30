'use client';

import { useState, useCallback } from 'react';
import { DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import LegalArticleRanking from '../ranking/LegalArticleRanking';
import TrendChart from '../charts/TrendChart';
import OpinionDistributionChart from '../charts/OpinionDistributionChart';
import { useTrendData } from '@/shared/hooks/useTrendData';
import { useOpinionDistributionSimple as useOpinionDistribution } from '@/shared/hooks/useOpinionDistributionSimple';

interface MainAnalyticsSectionProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function MainAnalyticsSection({ filters, data }: MainAnalyticsSectionProps) {
  // 트렌드 차트 기간 상태 관리
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  
  // 트렌드 데이터 로딩
  const { data: trendData, loading: trendLoading, error: trendError } = useTrendData(trendPeriod, filters);
  
  // 여론 분포 데이터 로딩
  const { data: opinionData, loading: opinionLoading, error: opinionError } = useOpinionDistribution(filters);

  // 트렌드 기간 변경 핸들러
  const handleTrendPeriodChange = useCallback((period: '7d' | '14d' | '30d' | 'all') => {
    setTrendPeriod(period);
  }, []);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
      {/* 왼쪽: 입법수요 TOP 5 랭킹 */}
      <div className="lg:col-span-1">
        <LegalArticleRanking filters={filters} data={data} />
      </div>

      {/* 중간: 시간대별 트렌드 차트 */}
      <div className="lg:col-span-1">
        {trendError ? (
          <div className="bg-white rounded-lg shadow-sm p-3 min-h-[240px] flex flex-col">
            <h3 className="text-base font-semibold mb-2">주간 이슈 트렌드</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 text-xs">{trendError}</p>
              </div>
            </div>
          </div>
        ) : trendLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-3 min-h-[240px] flex flex-col">
            <h3 className="text-base font-semibold mb-2">주간 이슈 트렌드</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">트렌드 데이터를 불러오는 중...</p>
              </div>
            </div>
          </div>
        ) : (
          <TrendChart
            data={trendData}
            period={trendPeriod}
            onPeriodChange={handleTrendPeriodChange}
            filters={filters}
          />
        )}
      </div>

      {/* 오른쪽: 전체 여론 성향 분포 */}
      <div className="lg:col-span-1">
        <OpinionDistributionChart
          data={opinionData}
          loading={opinionLoading}
          error={opinionError}
        />
      </div>
    </section>
  );
}