/**
 * 대시보드 데이터 통합 훅
 * 데이터 로딩과 필터링을 통합하여 제공
 */

import { useMemo } from 'react';
import { DashboardFilters } from '@/shared/types/dashboard';
import { useDataLoader } from './useDataLoader';
import { useFilteredData } from './useFilteredData';

interface UseDashboardDataOptions {
  autoLoad?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * 대시보드에서 사용할 통합 데이터 훅
 * 데이터 로딩과 필터링을 한 번에 처리
 */
export function useDashboardData(
  filters: DashboardFilters,
  options: UseDashboardDataOptions = {}
) {
  // 원본 데이터 로딩
  const { 
    data: rawData, 
    loading: dataLoading, 
    error: dataError, 
    reload,
    clearError 
  } = useDataLoader(options);

  // 필터링된 데이터 계산
  const filteredDataResult = useFilteredData(rawData, filters);

  // 전체 로딩 상태 계산
  const loading = dataLoading;
  
  // 에러 상태
  const error = dataError;

  // 데이터 존재 여부
  const hasData = rawData !== null && !filteredDataResult.isDataEmpty;

  return {
    // 원본 데이터
    rawData,
    
    // 필터링된 데이터와 집계 결과
    ...filteredDataResult,
    
    // 상태
    loading,
    error,
    hasData,
    
    // 유틸리티 함수
    reload,
    clearError
  };
}