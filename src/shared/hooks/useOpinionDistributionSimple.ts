'use client';

import { useState, useEffect } from 'react';
import { DashboardFilters, StanceDistribution } from '@/shared/types/dashboard';

interface OpinionDistributionData extends StanceDistribution {
  totalComments: number;
}

interface UseOpinionDistributionReturn {
  data: OpinionDistributionData | null;
  loading: boolean;
  error: string | null;
}

// 간단한 테스트용 훅 - 항상 샘플 데이터 반환
export function useOpinionDistributionSimple(filters: DashboardFilters): UseOpinionDistributionReturn {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 항상 고정된 샘플 데이터 반환
  const data: OpinionDistributionData = {
    reform: 450,      // 개정강화
    abolish: 280,     // 폐지완화  
    oppose: 170,      // 반대
    totalComments: 900
  };

  return {
    data,
    loading,
    error: null
  };
}