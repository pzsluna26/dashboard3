import React from 'react';

// 기본 데이터 타입
export interface LegalArticle {
  id: string;
  name: string;          // 예: "개인정보보호법"
  article: string;       // 예: "제2조의2"
  category: string;      // 예: "개인정보"
  fullName: string;      // 예: "개인정보보호법 제2조의2"
}

export interface Incident {
  id: string;
  name: string;
  category: string;
  relatedLaw: string;
  commentCount: number;
  newsCount: number;
  createdAt: string;
}

export interface SocialComment {
  id: string;
  content: string;
  source: 'naver' | 'youtube' | 'twitter' | 'blog';
  stance: 'reform' | 'abolish' | 'oppose';
  incidentId: string;
  legalArticleId: string;
  createdAt: string;
  likes?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  publisher: string;
  publishedAt: string;
  incidentId: string;
  legalArticleId: string;
}

// 필터 관련 타입
export interface DashboardFilters {
  period: '7d' | '14d' | '30d' | 'all';
  category: string[];
  source: string[];
}

// 집계 데이터 타입
export interface KPIMetrics {
  totalComments: number;
  totalIncidents: number;
  totalLegalArticles: number;
  mappingSuccessRate: number;
  previousWeek: {
    totalComments: number;
    totalIncidents: number;
    totalLegalArticles: number;
    mappingSuccessRate: number;
  };
}

export interface StanceDistribution {
  reform: number;      // 개정강화
  abolish: number;     // 폐지완화
  oppose: number;      // 반대
}

export interface TrendPoint {
  date: string;
  legalArticle: string;
  commentCount: number;
}

export interface HeatmapData {
  category: string;
  stance: 'reform' | 'abolish' | 'oppose';
  value: number;
  percentage: number;
}

// 히트맵 셀 데이터 타입
export interface HeatmapCellData {
  category: string;
  stance: 'reform' | 'abolish' | 'oppose';
  value: number;
  percentage: number;
  color: string;
  intensity: number; // 0-1 사이의 색상 강도
}

// 히트맵 인사이트 타입
export interface HeatmapInsight {
  type: 'highest' | 'lowest' | 'trend';
  category: string;
  stance?: 'reform' | 'abolish' | 'oppose';
  value: number;
  percentage: number;
  description: string;
}

// 랭킹 관련 타입
export interface LegalArticleRank {
  id: string;
  article: string;
  commentCount: number;
  newsCount: number;
  incidentCount: number;
  majorIncidents: Array<{
    name: string;
    commentCount: number;
  }>;
  stanceDistribution: StanceDistribution;
  representativeComment: {
    content: string;
    likes: number;
  };
  isHot: boolean;
}

// 트렌드 차트 관련 타입
export interface TrendData {
  date: string;
  articles: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

export interface TrendChartProps {
  data: TrendData[];
  period: '7d' | '14d' | '30d' | 'all';
  onPeriodChange: (period: string) => void;
}

// 네트워크 그래프 타입
export interface NetworkNode {
  id: string;
  type: 'legal' | 'incident';
  name: string;
  size: number;
  color: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  strength: number;
}

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// 컴포넌트 Props 타입
export interface KPICardProps {
  title: string;
  value: number;
  previousValue: number;
  format?: 'number' | 'percentage';
  icon?: React.ReactNode;
}

export interface LegalArticleRankingProps {
  data: LegalArticleRank[];
}

// 통합 데이터 타입
export interface ProcessedData {
  incidents: Incident[];
  legalArticles: LegalArticle[];
  comments: SocialComment[];
  news: NewsArticle[];
  mappings: {
    incidentToLegal: Record<string, string>;
    commentToIncident: Record<string, string>;
    newsToIncident: Record<string, string>;
  };
}

// 에러 처리 타입
export interface DataLoadingError {
  message: string;
  code?: string;
  timestamp: Date;
}

export interface DataLoadingState {
  loading: boolean;
  error: DataLoadingError | null;
  data: ProcessedData | null;
}

// Rising issue types
export interface RisingIssue {
  id: string;
  name: string;
  growthRate: number;
  todayCommentCount: number;
  relatedLegalArticle: string;
}

// Hot news types
export interface HotNews {
  id: string;
  title: string;
  commentCount: number;
  publishedAt: string;
  relatedLegalArticle: string;
  url: string;
  publisher: string;
}

// Data collection status types
export interface DataCollectionStatus {
  totalNews: number;
  totalComments: number;
  todayNews: number;
  todayComments: number;
  mappingSuccessRate: number;
  lastUpdateTime: string;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

// Opinion trend types
export interface OpinionTrendData {
  week: string;
  stanceDistribution: StanceDistribution;
  totalComments: number;
}

// Filter option types
export interface FilterOptions {
  periods: Array<{
    value: '7d' | '14d' | '30d' | 'all';
    label: string;
  }>;
  categories: Array<{
    value: string;
    label: string;
    count: number;
  }>;
  sources: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

// Chart common types
export interface ChartTooltipData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface ChartLegendItem {
  name: string;
  color: string;
  visible: boolean;
}

// Responsive types
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Performance optimization types
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

// Accessibility types
export interface AccessibilityConfig {
  announceChanges: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}