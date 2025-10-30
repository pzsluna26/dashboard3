'use client';

import { useState, useEffect, useMemo } from 'react';
import { HotNews, DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { isWithinPeriod } from '@/shared/utils/dateFilters';

interface UseHotNewsResult {
  hotNews: HotNews[];
  loading: boolean;
  error: string | null;
}

export function useHotNews(data: ProcessedData | null, filters: DashboardFilters): UseHotNewsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hotNews = useMemo(() => {
    // 항상 mock 데이터 반환 (임시)
    const mockNews: HotNews[] = [
      {
        id: 'demo_news_1',
        title: '대형 IT기업 개인정보 유출 사건 발생',
        commentCount: 1250,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relatedLegalArticle: '개인정보보호법 제24조',
        url: 'https://news.example.com/privacy-breach-1',
        publisher: '네이버뉴스'
      },
      {
        id: 'demo_news_2',
        title: '태안화력발전소 노동자 사망사고 발생',
        commentCount: 980,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        relatedLegalArticle: '중대재해처벌법 제5조',
        url: 'https://news.example.com/taean-accident-1',
        publisher: '조선일보'
      },
      {
        id: 'demo_news_3',
        title: '2025년 최저임금 인상률 결정',
        commentCount: 850,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        relatedLegalArticle: '최저임금법 제8조',
        url: 'https://news.example.com/minimum-wage-1',
        publisher: '중앙일보'
      },
      {
        id: 'demo_news_4',
        title: '가상자산 규제 강화 방안 발표',
        commentCount: 720,
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        relatedLegalArticle: '자본시장법 제5조',
        url: 'https://news.example.com/crypto-regulation-1',
        publisher: '동아일보'
      },
      {
        id: 'demo_news_5',
        title: '미세먼지 저감 대책 강화',
        commentCount: 650,
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        relatedLegalArticle: '미세먼지법 제7조',
        url: 'https://news.example.com/fine-dust-1',
        publisher: '다음뉴스'
      }
    ];
    
    return mockNews;

    // 임시로 실제 데이터 처리 로직 제거
  }, [data, filters]);

  return {
    hotNews,
    loading,
    error
  };
}

// 뉴스 데이터 정렬 유틸리티
export function sortNewsByCommentCount(news: HotNews[]): HotNews[] {
  return [...news].sort((a, b) => b.commentCount - a.commentCount);
}

// 뉴스 데이터 필터링 유틸리티
export function filterNewsByPeriod(news: HotNews[], period: '7d' | '14d' | '30d' | 'all'): HotNews[] {
  return news.filter(item => isWithinPeriod(item.publishedAt, period));
}

// 뉴스 데이터 검색 유틸리티
export function searchNews(news: HotNews[], searchTerm: string): HotNews[] {
  if (!searchTerm.trim()) return news;
  
  const term = searchTerm.toLowerCase();
  return news.filter(item => 
    item.title.toLowerCase().includes(term) ||
    item.relatedLegalArticle.toLowerCase().includes(term) ||
    item.publisher.toLowerCase().includes(term)
  );
}

// 뉴스 통계 계산 유틸리티
export function calculateNewsStats(news: HotNews[]) {
  const totalNews = news.length;
  const totalComments = news.reduce((sum, item) => sum + item.commentCount, 0);
  const averageComments = totalNews > 0 ? Math.round(totalComments / totalNews) : 0;
  
  // 발행사별 분포
  const publisherDistribution = news.reduce((acc, item) => {
    acc[item.publisher] = (acc[item.publisher] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 법조항별 분포
  const legalArticleDistribution = news.reduce((acc, item) => {
    acc[item.relatedLegalArticle] = (acc[item.relatedLegalArticle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalNews,
    totalComments,
    averageComments,
    publisherDistribution,
    legalArticleDistribution
  };
}