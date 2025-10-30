'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendData, DashboardFilters } from '@/shared/types/dashboard';
import { DataProcessor } from '@/shared/services/dataProcessor';

interface UseTrendDataReturn {
  data: TrendData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrendData(
  period: '7d' | '14d' | '30d' | 'all' = '7d',
  filters?: DashboardFilters
): UseTrendDataReturn {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩 함수
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 간단한 더미 데이터로 시작
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setRawData({ dummy: true }); // 더미 데이터
    } catch (err) {
      console.error('Trend data loading failed:', err);
      setError(err instanceof Error ? err.message : '트렌드 데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadData();
  }, []);

  // 트렌드 데이터 처리
  const trendData = useMemo(() => {
    if (!rawData) return [];

    try {
      return processTrendData(rawData, period, filters);
    } catch (err) {
      console.error('Error processing trend data:', err);
      return [];
    }
  }, [rawData, period, filters]);

  return {
    data: trendData,
    loading,
    error,
    refetch: loadData
  };
}

// 트렌드 데이터 처리 함수
function processTrendData(
  data: any, 
  period: '7d' | '14d' | '30d' | 'all',
  filters?: DashboardFilters
): TrendData[] {
  // 더 구분하기 쉬운 색상 팔레트
  const colors = [
    '#dc2626', // 진한 빨강
    '#2563eb', // 진한 파랑  
    '#059669', // 진한 초록
    '#d97706', // 진한 주황
    '#7c3aed'  // 진한 보라
  ];

  // 하드코딩된 TOP 5 법조항 (더 현실적인 범위)
  const topLegalArticles = [
    ['중대재해처벌법 제5조', 120],
    ['개인정보보호법 제24조', 85],
    ['근로기준법 제50조', 95],
    ['탄소중립법 제8조', 75],
    ['자본시장법 제5조', 110]
  ];

  // 일별 데이터 생성 (더 의미있는 변화)
  const result: TrendData[] = [];
  const days = period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 30;
  
  // 각 법조항별로 트렌드 패턴 생성
  const trendPatterns = topLegalArticles.map((_, index) => {
    const pattern = [];
    let currentValue = 0.7 + Math.random() * 0.6; // 0.7 ~ 1.3 시작값
    
    for (let i = 0; i < days; i++) {
      // 자연스러운 변화 패턴 생성
      const change = (Math.random() - 0.5) * 0.3; // -0.15 ~ +0.15 변화
      currentValue = Math.max(0.3, Math.min(1.5, currentValue + change)); // 0.3 ~ 1.5 범위 제한
      pattern.push(currentValue);
    }
    return pattern;
  });
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateString = date.toISOString().split('T')[0];
    
    const articles = topLegalArticles.map(([lawName, baseCount], index) => ({
      name: lawName as string,
      count: Math.round((baseCount as number) * trendPatterns[index][i]),
      color: colors[index] || '#6b7280'
    }));

    result.push({
      date: dateString,
      articles
    });
  }

  return result;
}



// 유틸리티 함수들
function getStartDateForPeriod(period: '7d' | '14d' | '30d' | 'all'): Date {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '14d':
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0); // 1970년부터
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function parseDate(dateString: string): Date | null {
  try {
    // "20250131144255" -> Date 객체로 변환
    if (dateString.length === 14) {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // 월은 0부터 시작
      const day = parseInt(dateString.substring(6, 8));
      const hour = parseInt(dateString.substring(8, 10));
      const minute = parseInt(dateString.substring(10, 12));
      const second = parseInt(dateString.substring(12, 14));
      
      return new Date(year, month, day, hour, minute, second);
    }
    return null;
  } catch {
    return null;
  }
}

function mapChannelToSource(channel: string): string {
  const channelMap: Record<string, string> = {
    'blog': 'blog',
    'naver': 'naver',
    'youtube': 'youtube',
    'twitter': 'twitter'
  };
  return channelMap[channel] || 'blog';
}