/**
 * 필터링된 데이터 훅
 * 필터 적용 및 실시간 집계를 담당
 * 요구사항 11.1, 11.2, 11.3, 11.4 지원
 */

import { useMemo, useCallback } from 'react';
import { 
  ProcessedData, 
  DashboardFilters, 
  KPIMetrics, 
  LegalArticleRank,
  TrendData,
  StanceDistribution,
  HeatmapData,
  RisingIssue,
  HotNews,
  DataCollectionStatus,
  OpinionTrendData,
  FilterOptions
} from '@/shared/types/dashboard';
import { DataProcessor } from '@/shared/services/dataProcessor';
import { isWithinPeriod, getStartDateForPeriod, formatDateToYMD } from '@/shared/utils/dateFilters';

interface UseFilteredDataOptions {
  enableRealTimeUpdate?: boolean;
  debounceMs?: number;
}

interface UseFilteredDataReturn {
  // 필터링된 기본 데이터
  filteredData: ProcessedData | null;
  
  // 집계된 데이터
  kpiMetrics: KPIMetrics | null;
  topLegalArticles: LegalArticleRank[];
  trendData: TrendData[];
  stanceDistribution: StanceDistribution | null;
  heatmapData: HeatmapData[];
  risingIssues: RisingIssue[];
  hotNews: HotNews[];
  dataCollectionStatus: DataCollectionStatus | null;
  opinionTrendData: OpinionTrendData[];
  
  // 필터 옵션
  filterOptions: FilterOptions;
  
  // 유틸리티 함수들
  applyCustomFilter: (customFilter: (data: ProcessedData) => ProcessedData) => ProcessedData | null;
  getFilteredCount: (type: 'comments' | 'incidents' | 'news' | 'legalArticles') => number;
  isDataEmpty: boolean;
}

/**
 * 필터링된 데이터를 제공하는 훅
 */
export function useFilteredData(
  rawData: ProcessedData | null,
  filters: DashboardFilters,
  options: UseFilteredDataOptions = {}
): UseFilteredDataReturn {
  
  const { enableRealTimeUpdate = true } = options;

  /**
   * 기본 필터 적용
   */
  const filteredData = useMemo(() => {
    if (!rawData) return null;

    return applyFiltersToData(rawData, filters);
  }, [rawData, filters]);

  /**
   * KPI 메트릭 계산
   */
  const kpiMetrics = useMemo(() => {
    if (!filteredData) return null;
    
    return DataProcessor.calculateKPIMetrics(filteredData);
  }, [filteredData]);

  /**
   * TOP 법조항 랭킹 계산
   */
  const topLegalArticles = useMemo(() => {
    if (!filteredData) return [];
    
    return DataProcessor.calculateTopLegalArticles(filteredData, 5);
  }, [filteredData]);

  /**
   * 트렌드 데이터 계산
   */
  const trendData = useMemo(() => {
    if (!filteredData) return [];
    
    return DataProcessor.aggregateTrendData(filteredData, filters.period);
  }, [filteredData, filters.period]);

  /**
   * 입장 분포 계산
   */
  const stanceDistribution = useMemo(() => {
    if (!filteredData) return null;
    
    const total = filteredData.comments.length;
    if (total === 0) return { reform: 0, abolish: 0, oppose: 0 };
    
    const reform = filteredData.comments.filter(c => c.stance === 'reform').length;
    const abolish = filteredData.comments.filter(c => c.stance === 'abolish').length;
    const oppose = filteredData.comments.filter(c => c.stance === 'oppose').length;
    
    return {
      reform: Math.round((reform / total) * 100),
      abolish: Math.round((abolish / total) * 100),
      oppose: Math.round((oppose / total) * 100)
    };
  }, [filteredData]);

  /**
   * 히트맵 데이터 계산
   */
  const heatmapData = useMemo(() => {
    if (!filteredData) return [];
    
    return calculateHeatmapData(filteredData);
  }, [filteredData]);

  /**
   * 급상승 이슈 계산
   */
  const risingIssues = useMemo(() => {
    if (!filteredData) return [];
    
    return calculateRisingIssues(filteredData);
  }, [filteredData]);

  /**
   * 핫 뉴스 계산
   */
  const hotNews = useMemo(() => {
    if (!filteredData) return [];
    
    return calculateHotNews(filteredData);
  }, [filteredData]);

  /**
   * 데이터 수집 현황 계산
   */
  const dataCollectionStatus = useMemo(() => {
    if (!rawData) return null; // 원본 데이터 기준으로 계산
    
    return calculateDataCollectionStatus(rawData);
  }, [rawData]);

  /**
   * 여론 변화 추이 계산
   */
  const opinionTrendData = useMemo(() => {
    if (!filteredData) return [];
    
    return calculateOpinionTrendData(filteredData);
  }, [filteredData]);

  /**
   * 필터 옵션 생성
   */
  const filterOptions = useMemo(() => {
    if (!rawData) {
      return {
        periods: [
          { value: '7d' as const, label: '최근 7일' },
          { value: '14d' as const, label: '최근 14일' },
          { value: '30d' as const, label: '최근 30일' },
          { value: 'all' as const, label: '전체' }
        ],
        categories: [],
        sources: []
      };
    }
    
    return generateFilterOptions(rawData);
  }, [rawData]);

  /**
   * 커스텀 필터 적용
   */
  const applyCustomFilter = useCallback((customFilter: (data: ProcessedData) => ProcessedData) => {
    if (!filteredData) return null;
    
    try {
      return customFilter(filteredData);
    } catch (error) {
      console.error('Custom filter application failed:', error);
      return filteredData;
    }
  }, [filteredData]);

  /**
   * 필터링된 데이터 개수 조회
   */
  const getFilteredCount = useCallback((type: 'comments' | 'incidents' | 'news' | 'legalArticles') => {
    if (!filteredData) return 0;
    
    return filteredData[type].length;
  }, [filteredData]);

  /**
   * 데이터가 비어있는지 확인
   */
  const isDataEmpty = useMemo(() => {
    if (!filteredData) return true;
    
    return filteredData.comments.length === 0 && 
           filteredData.incidents.length === 0 && 
           filteredData.news.length === 0;
  }, [filteredData]);

  return {
    filteredData,
    kpiMetrics,
    topLegalArticles,
    trendData,
    stanceDistribution,
    heatmapData,
    risingIssues,
    hotNews,
    dataCollectionStatus,
    opinionTrendData,
    filterOptions,
    applyCustomFilter,
    getFilteredCount,
    isDataEmpty
  };
}

/**
 * 데이터에 필터 적용
 */
function applyFiltersToData(data: ProcessedData, filters: DashboardFilters): ProcessedData {
  // 댓글 필터링
  const filteredComments = data.comments.filter(comment => {
    // 기간 필터
    if (!isWithinPeriod(comment.createdAt, filters.period)) {
      return false;
    }
    
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

  // 필터링된 댓글과 연관된 데이터들 추출
  const filteredIncidentIds = new Set(filteredComments.map(c => c.incidentId));
  const filteredLegalArticleIds = new Set(filteredComments.map(c => c.legalArticleId));

  const filteredIncidents = data.incidents.filter(incident => {
    // 기간 필터 적용
    if (!isWithinPeriod(incident.createdAt, filters.period)) {
      return false;
    }
    
    // 연관된 댓글이 있는 사건만 포함
    return filteredIncidentIds.has(incident.id);
  });

  const filteredLegalArticles = data.legalArticles.filter(article => 
    filteredLegalArticleIds.has(article.id)
  );

  const filteredNews = data.news.filter(news => {
    // 기간 필터 적용
    if (!isWithinPeriod(news.publishedAt, filters.period)) {
      return false;
    }
    
    // 연관된 사건이 있는 뉴스만 포함
    return filteredIncidentIds.has(news.incidentId);
  });

  return {
    incidents: filteredIncidents,
    legalArticles: filteredLegalArticles,
    comments: filteredComments,
    news: filteredNews,
    mappings: data.mappings // 매핑은 그대로 유지
  };
}

/**
 * 히트맵 데이터 계산
 */
function calculateHeatmapData(data: ProcessedData): HeatmapData[] {
  const heatmapData: HeatmapData[] = [];
  
  // 카테고리별 입장 분포 계산
  const categoryStanceMap = new Map<string, { reform: number; abolish: number; oppose: number }>();
  
  data.comments.forEach(comment => {
    const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
    if (!legalArticle) return;
    
    const category = legalArticle.category;
    if (!categoryStanceMap.has(category)) {
      categoryStanceMap.set(category, { reform: 0, abolish: 0, oppose: 0 });
    }
    
    const stanceCount = categoryStanceMap.get(category)!;
    stanceCount[comment.stance]++;
  });
  
  // 히트맵 데이터 생성
  categoryStanceMap.forEach((stanceCounts, category) => {
    const total = stanceCounts.reform + stanceCounts.abolish + stanceCounts.oppose;
    
    if (total > 0) {
      (['reform', 'abolish', 'oppose'] as const).forEach(stance => {
        const value = stanceCounts[stance];
        const percentage = Math.round((value / total) * 100);
        
        heatmapData.push({
          category,
          stance,
          value,
          percentage
        });
      });
    }
  });
  
  return heatmapData;
}

/**
 * 급상승 이슈 계산
 */
function calculateRisingIssues(data: ProcessedData): RisingIssue[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dayBeforeYesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  const incidentGrowthMap = new Map<string, { today: number; yesterday: number; incident: any }>();
  
  data.incidents.forEach(incident => {
    const todayComments = data.comments.filter(c => 
      c.incidentId === incident.id && new Date(c.createdAt) >= yesterday
    ).length;
    
    const yesterdayComments = data.comments.filter(c => {
      const commentDate = new Date(c.createdAt);
      return c.incidentId === incident.id && 
             commentDate >= dayBeforeYesterday && 
             commentDate < yesterday;
    }).length;
    
    incidentGrowthMap.set(incident.id, {
      today: todayComments,
      yesterday: yesterdayComments,
      incident
    });
  });
  
  return Array.from(incidentGrowthMap.values())
    .map(({ today, yesterday, incident }) => {
      const growthRate = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;
      const relatedLegal = data.legalArticles.find(la => 
        data.mappings.incidentToLegal[incident.id] === la.id
      );
      
      return {
        id: incident.id,
        name: incident.name,
        growthRate,
        todayCommentCount: today,
        relatedLegalArticle: relatedLegal?.fullName || '관련법 없음',
        keywords: extractKeywords(incident.name)
      };
    })
    .filter(issue => issue.growthRate > 0)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 3);
}

/**
 * 핫 뉴스 계산
 */
function calculateHotNews(data: ProcessedData): HotNews[] {
  const sevenDaysAgo = getStartDateForPeriod('7d');
  
  return data.news
    .filter(news => new Date(news.publishedAt) >= sevenDaysAgo)
    .map(news => {
      const commentCount = data.comments.filter(c => c.incidentId === news.incidentId).length;
      const relatedLegal = data.legalArticles.find(la => la.id === news.legalArticleId);
      
      return {
        id: news.id,
        title: news.title,
        commentCount,
        publishedAt: news.publishedAt,
        relatedLegalArticle: relatedLegal?.fullName || '관련법 없음',
        url: news.url,
        publisher: news.publisher
      };
    })
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 5);
}

/**
 * 데이터 수집 현황 계산
 */
function calculateDataCollectionStatus(data: ProcessedData): DataCollectionStatus {
  const today = formatDateToYMD(new Date().toISOString());
  
  const todayNews = data.news.filter(n => 
    formatDateToYMD(n.publishedAt) === today
  ).length;
  
  const todayComments = data.comments.filter(c => 
    formatDateToYMD(c.createdAt) === today
  ).length;
  
  // 출처별 분포 계산
  const sourceMap = new Map<string, number>();
  data.comments.forEach(comment => {
    sourceMap.set(comment.source, (sourceMap.get(comment.source) || 0) + 1);
  });
  
  const totalComments = data.comments.length;
  const sourceDistribution = Array.from(sourceMap.entries()).map(([source, count]) => ({
    source,
    count,
    percentage: Math.round((count / totalComments) * 100)
  }));
  
  // 매핑 성공률 계산
  const mappedComments = data.comments.filter(c => c.legalArticleId && c.incidentId).length;
  const mappedNews = data.news.filter(n => n.legalArticleId && n.incidentId).length;
  const totalItems = data.comments.length + data.news.length;
  const mappingSuccessRate = totalItems > 0 ? 
    Math.round(((mappedComments + mappedNews) / totalItems) * 100) : 0;
  
  return {
    totalNews: data.news.length,
    totalComments: data.comments.length,
    todayNews,
    todayComments,
    mappingSuccessRate,
    lastUpdateTime: new Date().toISOString(),
    sourceDistribution
  };
}

/**
 * 여론 변화 추이 계산
 */
function calculateOpinionTrendData(data: ProcessedData): OpinionTrendData[] {
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const weeklyData: OpinionTrendData[] = [];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(fourWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weekComments = data.comments.filter(c => {
      const commentDate = new Date(c.createdAt);
      return commentDate >= weekStart && commentDate < weekEnd;
    });
    
    const total = weekComments.length;
    if (total === 0) {
      weeklyData.push({
        week: `${i + 1}주차`,
        stanceDistribution: { reform: 0, abolish: 0, oppose: 0 },
        totalComments: 0
      });
      continue;
    }
    
    const reform = weekComments.filter(c => c.stance === 'reform').length;
    const abolish = weekComments.filter(c => c.stance === 'abolish').length;
    const oppose = weekComments.filter(c => c.stance === 'oppose').length;
    
    weeklyData.push({
      week: `${i + 1}주차`,
      stanceDistribution: {
        reform: Math.round((reform / total) * 100),
        abolish: Math.round((abolish / total) * 100),
        oppose: Math.round((oppose / total) * 100)
      },
      totalComments: total
    });
  }
  
  return weeklyData;
}

/**
 * 필터 옵션 생성
 */
function generateFilterOptions(data: ProcessedData): FilterOptions {
  // 카테고리 옵션 생성
  const categoryMap = new Map<string, number>();
  data.legalArticles.forEach(article => {
    categoryMap.set(article.category, (categoryMap.get(article.category) || 0) + 1);
  });
  
  const categories = Array.from(categoryMap.entries()).map(([value, count]) => ({
    value,
    label: value,
    count
  }));
  
  // 출처 옵션 생성
  const sourceMap = new Map<string, number>();
  data.comments.forEach(comment => {
    sourceMap.set(comment.source, (sourceMap.get(comment.source) || 0) + 1);
  });
  
  const sources = Array.from(sourceMap.entries()).map(([value, count]) => ({
    value,
    label: getSourceLabel(value),
    count
  }));
  
  return {
    periods: [
      { value: '7d', label: '최근 7일' },
      { value: '14d', label: '최근 14일' },
      { value: '30d', label: '최근 30일' },
      { value: 'all', label: '전체' }
    ],
    categories: categories.sort((a, b) => b.count - a.count),
    sources: sources.sort((a, b) => b.count - a.count)
  };
}

/**
 * 키워드 추출 (간단한 구현)
 */
function extractKeywords(text: string): string[] {
  // 간단한 키워드 추출 로직
  const keywords = text
    .split(/[\s,\.]+/)
    .filter(word => word.length > 1)
    .slice(0, 3);
  
  return keywords;
}

/**
 * 출처 라벨 매핑
 */
function getSourceLabel(source: string): string {
  const labelMap: Record<string, string> = {
    'naver': '네이버',
    'youtube': '유튜브',
    'twitter': '트위터',
    'blog': '블로그'
  };
  
  return labelMap[source] || source;
}