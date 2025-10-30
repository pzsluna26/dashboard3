'use client';

import { useState } from 'react';
import { DashboardFilters } from '@/shared/types/dashboard';
import { defaultFilters } from '@/shared/store/dashboardAtoms';
import { useDashboardData } from '@/shared/hooks/useDashboardData';

import KPISection from './sections/KPISection';
import LegalArticleRanking from './ranking/LegalArticleRanking';
import { NetworkGraph } from './charts';
import SimpleNetworkGraph from './charts/SimpleNetworkGraph';
import TrendChart from './charts/TrendChart';
import OpinionDistributionChart from './charts/OpinionDistributionChart';
import OpinionTrendChart from './charts/OpinionTrendChart';
import { useNetworkGraphData } from '@/shared/hooks/useNetworkGraphData';
import { useTrendData } from '@/shared/hooks/useTrendData';
import { useOpinionDistributionSimple as useOpinionDistribution } from '@/shared/hooks/useOpinionDistributionSimple';

export default function DashboardLayout() {
  // 전역 필터 상태 관리
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [useSimpleGraph, setUseSimpleGraph] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('7d');

  // 데이터 로딩 및 필터링
  const {
    rawData: data,
    loading,
    error,
    opinionTrendData
  } = useDashboardData(filters);

  // 네트워크 그래프 데이터
  const { nodes, links } = useNetworkGraphData(data, filters);
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeLinks = Array.isArray(links) ? links : [];

  // 트렌드 데이터
  const { data: trendData, loading: trendLoading, error: trendError } = useTrendData(trendPeriod, filters);

  // 여론 분포 데이터
  const { data: opinionData, loading: opinionLoading, error: opinionError } = useOpinionDistribution(filters);

  // 네트워크 그래프 섹션 컴포넌트
  const NetworkGraphSection = ({ filters, data }: { filters: DashboardFilters, data: any }) => (
    <div className="bg-transparent border border-white/40 rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-base font-semibold">주요 사건-법 연결망</h3>
        <button
          onClick={() => setUseSimpleGraph(!useSimpleGraph)}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="그래프 모드 전환"
        >
          {useSimpleGraph ? '고급 모드' : '단순 모드'}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {useSimpleGraph ? (
          <SimpleNetworkGraph
            nodes={safeNodes}
            links={safeLinks}
            width={800}
            height={180}
          />
        ) : (
          <NetworkGraph
            nodes={safeNodes}
            links={safeLinks}
            width={800}
            height={180}
          />
        )}
      </div>
    </div>
  );

  // 트렌드 차트 섹션 컴포넌트
  const TrendChartSection = ({ filters, data }: { filters: DashboardFilters, data: any }) => (
    trendError ? (
      <div className="bg-transparent rounded-lg p-3 h-full flex flex-col">
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
      <div className="bg-transparent rounded-lg p-3 h-full flex flex-col">
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
        onPeriodChange={setTrendPeriod}
        filters={filters}
      />
    )
  );

  // 여론 분포 섹션 컴포넌트
  const OpinionDistributionSection = ({ filters, data }: { filters: DashboardFilters, data: any }) => (
    <OpinionDistributionChart
      data={opinionData}
      loading={opinionLoading}
      error={opinionError}
    />
  );

  // 디버깅을 위한 로그
  console.log('DashboardLayout render:', {
    dataLoaded: !!data,
    loading,
    error: !!error,
    dataStats: data ? {
      incidents: data.incidents.length,
      legalArticles: data.legalArticles.length,
      comments: data.comments.length,
      news: data.news.length
    } : null
  });

  return (
    <div className="h-screen overflow-hidden bg-transparent">
      {/* 필터 패널 - 전역 필터 상태 연동 */}
      {/* <FilterPanel 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      /> */}



<main className="container mx-auto px-2 py-1 space-y-2 max-w-7xl flex flex-col overflow-auto">
  {/* KPI */}
  <div className="flex-shrink-0">
    <KPISection filters={filters} data={data} />
  </div>

  {/* 그래프 + 랭킹 */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-grow">
    <div className="lg:col-span-1">
      <LegalArticleRanking filters={filters} data={data} />
    </div>
    <div className="lg:col-span-3">
      <NetworkGraphSection filters={filters} data={data} />
    </div>
  </div>

  {/* 인사이트 */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-grow min-h-0">
    <div className="lg:col-span-1">
      <TrendChartSection filters={filters} data={data} />
    </div>
    <div className="lg:col-span-1">
      <OpinionDistributionSection filters={filters} data={data} />
    </div>
    <div className="lg:col-span-1">
      <OpinionTrendChart data={opinionTrendData} />
    </div>
  </div>
</main>

    </div>
  );
}