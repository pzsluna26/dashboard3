import React, { ReactNode } from 'react';
import { 
  KPIMetrics, 
  LegalArticleRank, 
  TrendPoint, 
  StanceDistribution, 
  HeatmapData, 
  NetworkNode, 
  NetworkLink,
  DashboardFilters 
} from './dashboard';

// 컴포넌트 Props 타입 정의

// KPI 카드 관련
export interface KPICardProps {
  title: string;
  value: number;
  previousValue: number;
  format?: 'number' | 'percentage';
  icon?: React.ReactNode;
  loading?: boolean;
  key?: string | number;
}

// 랭킹 관련
export interface LegalArticleRankingProps {
  data: LegalArticleRank[];
  loading?: boolean;
}

export interface RankingCardProps {
  rank: number;
  data: LegalArticleRank;
  onDetailClick?: (id: string) => void;
}

// 차트 관련
export interface TrendChartProps {
  data: TrendPoint[];
  period: '7d' | '14d' | '30d' | 'all';
  onPeriodChange: (period: string) => void;
  loading?: boolean;
}

export interface StanceDistributionChartProps {
  data: StanceDistribution;
  loading?: boolean;
}

export interface HeatmapProps {
  data: HeatmapData[];
  loading?: boolean;
}

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  loading?: boolean;
}

// 필터 관련
export interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export interface PeriodSelectorProps {
  value: '7d' | '14d' | '30d' | 'all';
  onChange: (period: '7d' | '14d' | '30d' | 'all') => void;
}

// 레이아웃 관련
export interface DashboardSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 뉴스 관련
export interface NewsListProps {
  articles: Array<{
    id: string;
    title: string;
    commentCount: number;
    publishedAt: string;
    legalArticle: string;
    url: string;
  }>;
  loading?: boolean;
}

// 데이터 현황 관련
export interface DataStatusProps {
  totalNews: number;
  totalComments: number;
  mappingRate: number;
  lastUpdated: string;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  loading?: boolean;
}

// 급상승 이슈 관련
export interface TrendingIssuesProps {
  issues: Array<{
    id: string;
    name: string;
    growthRate: number;
    todayComments: number;
    legalArticle: string;
    keywords: string[];
  }>;
  loading?: boolean;
}