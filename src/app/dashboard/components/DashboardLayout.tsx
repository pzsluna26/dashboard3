'use client';

import { useState, useCallback } from 'react';
import { DashboardFilters } from '@/shared/types/dashboard';
import { defaultFilters } from '@/shared/store/dashboardAtoms';
import { useDataLoader } from '@/shared/hooks/useDataLoader';
import DashboardHeader from './DashboardHeader';
import KPISection from './sections/KPISection';
import MainAnalyticsSection from './sections/MainAnalyticsSection';
import DetailInfoSection from './sections/DetailInfoSection';
import DeepAnalysisSection from './sections/DeepAnalysisSection';
import FilterPanel from './FilterPanel';

export default function DashboardLayout() {
  // 전역 필터 상태 관리
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  
  // 데이터 로딩
  const { data, loading, error } = useDataLoader();

  // 필터 변경 핸들러
  const handleFiltersChange = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* 필터 패널 - 전역 필터 상태 연동 */}
      <FilterPanel 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      
      {/* 데이터 로딩 상태 표시 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs">
          <p>데이터 상태: {loading ? '로딩 중...' : data ? `로드됨 (법조항: ${data.legalArticles.length}, 댓글: ${data.comments.length})` : '데이터 없음'}</p>
          {error && <p className="text-red-600">에러: {error.message}</p>}
        </div>
      )}
      
      <main className="container mx-auto px-2 py-0 space-y-1 max-w-7xl">
        {/* 1단: KPI 카드 섹션 */}
        <KPISection 
          filters={filters}
          data={data}
        />
        
        {/* 2단: 메인 분석 섹션 */}
        <MainAnalyticsSection 
          filters={filters}
          data={data}
        />
        
        {/* 3단, 4단: 상세 정보 및 심층 분석 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          <DetailInfoSection 
            filters={filters}
            data={data}
          />
          
          <DeepAnalysisSection 
            filters={filters}
            data={data}
          />
        </div>
      </main>
    </div>
  );
}