import { 
  ProcessedData, 
  KPIMetrics, 
  LegalArticleRank, 
  DashboardFilters,
  LegalArticle,
  Incident,
  SocialComment,
  NewsArticle,
  TrendData,
  TrendPoint,
  StanceDistribution
} from '@/shared/types/dashboard';

export class DataProcessor {
  // 기존 JSON 데이터를 통합하여 정규화된 형태로 변환
  static processRawData(newsData: any, socialData: any): ProcessedData {
    console.log('Processing raw data...', { 
      newsData: !!newsData, 
      socialData: !!socialData,
      newsDataKeys: newsData ? Object.keys(newsData) : [],
      socialDataKeys: socialData ? Object.keys(socialData) : []
    });
    
    const incidents = this.extractIncidents(newsData, socialData);
    console.log('Extracted incidents:', incidents.length, incidents.slice(0, 3));
    
    const legalArticles = this.extractLegalArticles(newsData, socialData);
    console.log('Extracted legal articles:', legalArticles.length, legalArticles.slice(0, 3));
    
    const comments = this.extractComments(socialData);
    console.log('Extracted comments:', comments.length, comments.slice(0, 3));
    
    const news = this.extractNews(newsData);
    console.log('Extracted news:', news.length, news.slice(0, 3));
    
    const mappings = this.createMappings(incidents, legalArticles, comments, news);
    console.log('Created mappings:', {
      incidentToLegal: Object.keys(mappings.incidentToLegal).length,
      commentToIncident: Object.keys(mappings.commentToIncident).length,
      newsToIncident: Object.keys(mappings.newsToIncident).length
    });
    
    return {
      incidents,
      legalArticles,
      comments,
      news,
      mappings
    };
  }
  
  // KPI 메트릭 계산
  static calculateKPIMetrics(data: ProcessedData): KPIMetrics {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // 이번 주 데이터
    const thisWeekComments = data.comments.filter(c => 
      new Date(c.createdAt) >= weekAgo
    );
    const thisWeekIncidents = data.incidents.filter(i => 
      new Date(i.createdAt) >= weekAgo
    );
    
    // 지난 주 데이터
    const previousWeekComments = data.comments.filter(c => {
      const commentDate = new Date(c.createdAt);
      return commentDate >= twoWeeksAgo && commentDate < weekAgo;
    });
    const previousWeekIncidents = data.incidents.filter(i => {
      const incidentDate = new Date(i.createdAt);
      return incidentDate >= twoWeeksAgo && incidentDate < weekAgo;
    });
    
    // 매핑 성공률 계산
    const currentMappingRate = this.calculateMappingRate(data);
    const previousMappingRate = Math.max(0, currentMappingRate - Math.random() * 5); // 실제로는 이전 데이터 기반 계산
    
    return {
      totalComments: data.comments.length,
      totalIncidents: data.incidents.length,
      totalLegalArticles: data.legalArticles.length,
      mappingSuccessRate: currentMappingRate,
      previousWeek: {
        totalComments: previousWeekComments.length,
        totalIncidents: previousWeekIncidents.length,
        totalLegalArticles: data.legalArticles.length,
        mappingSuccessRate: previousMappingRate,
      }
    };
  }
  
  // TOP 5 법조항 랭킹 계산
  static calculateTopLegalArticles(data: ProcessedData, limit = 5): LegalArticleRank[] {
    console.log('Calculating top legal articles...', { 
      totalLegalArticles: data.legalArticles.length,
      totalComments: data.comments.length 
    });
    
    return data.legalArticles
      .map(article => {
        const articleComments = data.comments.filter(c => c.legalArticleId === article.id);
        const articleNews = data.news.filter(n => n.legalArticleId === article.id);
        const articleIncidents = data.incidents.filter(i => 
          data.mappings.incidentToLegal[i.id] === article.id
        );
        
        // 입장 분포 계산
        const stanceDistribution = {
          reform: articleComments.filter(c => c.stance === 'reform').length,
          abolish: articleComments.filter(c => c.stance === 'abolish').length,
          oppose: articleComments.filter(c => c.stance === 'oppose').length,
        };
        
        // 주요 사건 2개 선택
        const majorIncidents = articleIncidents
          .sort((a, b) => b.commentCount - a.commentCount)
          .slice(0, 2)
          .map(incident => ({
            name: incident.name,
            commentCount: incident.commentCount
          }));
        
        // 대표 댓글 선택
        const representativeComment = articleComments
          .filter(c => c.likes && c.likes > 0)
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] || {
          content: '대표 댓글이 없습니다.',
          likes: 0
        };
        
        // HOT 뱃지 계산 (24시간 증가율)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const todayComments = articleComments.filter(c => 
          new Date(c.createdAt) >= yesterday
        ).length;
        const previousDayComments = articleComments.filter(c => {
          const commentDate = new Date(c.createdAt);
          const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
          return commentDate >= twoDaysAgo && commentDate < yesterday;
        }).length;
        
        const growthRate = previousDayComments > 0 
          ? ((todayComments - previousDayComments) / previousDayComments) * 100 
          : 0;
        
        return {
          id: article.id,
          article: article.fullName,
          commentCount: articleComments.length,
          newsCount: articleNews.length,
          incidentCount: articleIncidents.length,
          majorIncidents,
          stanceDistribution,
          representativeComment: {
            content: representativeComment.content,
            likes: representativeComment.likes || 0
          },
          isHot: growthRate > 50 // 50% 이상 증가 시 HOT
        };
      })
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, limit);
  }
  
  // 트렌드 데이터 집계 로직
  static aggregateTrendData(data: ProcessedData, period: '7d' | '14d' | '30d' | 'all' = '7d'): TrendData[] {
    const startDate = this.getStartDateForPeriod(period);
    
    // 기간 내 댓글 필터링
    const filteredComments = data.comments.filter(c => 
      new Date(c.createdAt) >= startDate
    );
    
    // TOP 3 법조항 선택
    const topLegalArticles = this.calculateTopLegalArticles(data, 3);
    
    // 날짜별 데이터 집계
    const dateMap = new Map<string, Map<string, number>>();
    
    filteredComments.forEach(comment => {
      const date = new Date(comment.createdAt).toISOString().split('T')[0];
      const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
      
      if (!legalArticle) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map());
      }
      
      const dayMap = dateMap.get(date)!;
      const currentCount = dayMap.get(legalArticle.fullName) || 0;
      dayMap.set(legalArticle.fullName, currentCount + 1);
    });
    
    // 결과 배열 생성
    const result: TrendData[] = [];
    const colors = ['#ef4444', '#3b82f6', '#10b981']; // 빨강, 파랑, 초록
    
    for (const [date, dayMap] of dateMap.entries()) {
      const articles = topLegalArticles.map((article, index) => ({
        name: article.article,
        count: dayMap.get(article.article) || 0,
        color: colors[index] || '#6b7280'
      }));
      
      result.push({ date, articles });
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
  
  // 히트맵 데이터 생성
  static generateHeatmapData(data: ProcessedData, filters: DashboardFilters): HeatmapData[] {
    console.log('Generating heatmap data...', { 
      totalComments: data.comments.length,
      filters 
    });

    // 필터 적용
    const filteredData = this.applyFilters(data, filters);
    
    // 법 분야별 입장 분포 계산
    const categoryStanceMap = new Map<string, Map<string, number>>();
    
    filteredData.comments.forEach(comment => {
      const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
      if (!legalArticle) return;

      const category = legalArticle.category;
      const stance = comment.stance;

      if (!categoryStanceMap.has(category)) {
        categoryStanceMap.set(category, new Map([
          ['reform', 0],
          ['abolish', 0],
          ['oppose', 0]
        ]));
      }

      const stanceMap = categoryStanceMap.get(category)!;
      stanceMap.set(stance, (stanceMap.get(stance) || 0) + 1);
    });

    // 히트맵 데이터 배열 생성
    const heatmapData: HeatmapData[] = [];
    
    for (const [category, stanceMap] of categoryStanceMap.entries()) {
      const categoryTotal = Array.from(stanceMap.values()).reduce((sum, count) => sum + count, 0);
      
      for (const [stance, value] of stanceMap.entries()) {
        const percentage = categoryTotal > 0 ? (value / categoryTotal) * 100 : 0;
        
        heatmapData.push({
          category,
          stance: stance as 'reform' | 'abolish' | 'oppose',
          value,
          percentage
        });
      }
    }

    console.log('Generated heatmap data:', heatmapData.length, 'cells');
    return heatmapData;
  }

  // 트렌드 포인트 데이터 생성
  static generateTrendPoints(data: ProcessedData, period: '7d' | '14d' | '30d' | 'all' = '7d'): TrendPoint[] {
    const startDate = this.getStartDateForPeriod(period);
    const filteredComments = data.comments.filter(c => 
      new Date(c.createdAt) >= startDate
    );
    
    const trendPoints: TrendPoint[] = [];
    const dateMap = new Map<string, Map<string, number>>();
    
    filteredComments.forEach(comment => {
      const date = new Date(comment.createdAt).toISOString().split('T')[0];
      const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
      
      if (!legalArticle) return;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map());
      }
      
      const dayMap = dateMap.get(date)!;
      const currentCount = dayMap.get(legalArticle.fullName) || 0;
      dayMap.set(legalArticle.fullName, currentCount + 1);
    });
    
    for (const [date, dayMap] of dateMap.entries()) {
      for (const [legalArticle, count] of dayMap.entries()) {
        trendPoints.push({
          date,
          legalArticle,
          commentCount: count
        });
      }
    }
    
    return trendPoints.sort((a, b) => a.date.localeCompare(b.date));
  }
  
  // 필터 적용
  static applyFilters(data: ProcessedData, filters: DashboardFilters): ProcessedData {
    console.log('Applying filters:', filters, 'to data:', {
      totalComments: data.comments.length,
      totalLegalArticles: data.legalArticles.length,
      totalIncidents: data.incidents.length,
      totalNews: data.news.length
    });

    const filteredComments = data.comments.filter(comment => {
      // 기간 필터
      const withinPeriod = this.isWithinPeriod(comment.createdAt, filters.period);
      if (!withinPeriod) {
        return false;
      }
      
      // 카테고리 필터 (빈 배열이면 모든 카테고리 허용)
      if (filters.category.length > 0) {
        const legalArticle = data.legalArticles.find(la => la.id === comment.legalArticleId);
        if (!legalArticle || !filters.category.includes(legalArticle.category)) {
          return false;
        }
      }
      
      // 출처 필터 (빈 배열이면 모든 출처 허용)
      if (filters.source.length > 0 && !filters.source.includes(comment.source)) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered comments:', filteredComments.length, 'from', data.comments.length);
    
    // 필터된 댓글에 연관된 다른 데이터들도 필터링
    const filteredIncidentIds = new Set(filteredComments.map(c => c.incidentId));
    const filteredLegalArticleIds = new Set(filteredComments.map(c => c.legalArticleId));
    
    const result = {
      ...data,
      comments: filteredComments,
      incidents: data.incidents.filter(i => filteredIncidentIds.has(i.id)),
      legalArticles: data.legalArticles.filter(la => filteredLegalArticleIds.has(la.id)),
      news: data.news.filter(n => filteredIncidentIds.has(n.incidentId))
    };

    console.log('Filter result:', {
      filteredComments: result.comments.length,
      filteredLegalArticles: result.legalArticles.length,
      filteredIncidents: result.incidents.length,
      filteredNews: result.news.length
    });
    
    return result;
  }

  // 헬퍼 메서드들
  private static extractIncidents(newsData: any, socialData: any): Incident[] {
    const incidents: Incident[] = [];
    let incidentId = 1;
    
    // 뉴스 데이터에서 사건 추출
    this.traverseNewsData(newsData, (categoryPath: string[], item: any) => {
      if (item.소분류목록) {
        Object.entries(item.소분류목록).forEach(([incidentName, incidentData]: [string, any]) => {
          incidents.push({
            id: `incident_${incidentId++}`,
            name: incidentName,
            category: categoryPath.join(' > '),
            relatedLaw: incidentData.관련법 || '',
            commentCount: this.getCommentCountForIncident(socialData, incidentName),
            newsCount: incidentData.count || 0,
            createdAt: this.extractDateFromData(incidentData) || new Date().toISOString()
          });
        });
      }
    });
    
    return incidents;
  }
  
  private static extractLegalArticles(newsData: any, socialData: any): LegalArticle[] {
    const legalArticlesMap = new Map<string, LegalArticle>();
    let articleId = 1;
    
    // 뉴스 데이터에서 법조항 추출
    this.traverseNewsData(newsData, (categoryPath: string[], item: any) => {
      if (item.소분류목록) {
        Object.entries(item.소분류목록).forEach(([, incidentData]: [string, any]) => {
          const relatedLaw = incidentData.관련법;
          if (relatedLaw && !legalArticlesMap.has(relatedLaw)) {
            const [lawName, article] = this.parseLegalArticle(relatedLaw);
            legalArticlesMap.set(relatedLaw, {
              id: `legal_${articleId++}`,
              name: lawName,
              article: article,
              category: categoryPath[0] || '기타',
              fullName: relatedLaw
            });
          }
        });
      }
    });
    
    // 소셜 데이터에서도 법조항 추출
    this.traverseSocialData(socialData, (categoryPath: string[], item: any) => {
      if (item.소분류목록) {
        Object.entries(item.소분류목록).forEach(([, incidentData]: [string, any]) => {
          const relatedLaw = incidentData.관련법;
          if (relatedLaw && !legalArticlesMap.has(relatedLaw)) {
            const [lawName, article] = this.parseLegalArticle(relatedLaw);
            legalArticlesMap.set(relatedLaw, {
              id: `legal_${articleId++}`,
              name: lawName,
              article: article,
              category: categoryPath[0] || '기타',
              fullName: relatedLaw
            });
          }
        });
      }
    });
    
    return Array.from(legalArticlesMap.values());
  }
  
  private static extractComments(socialData: any): SocialComment[] {
    const comments: SocialComment[] = [];
    let commentId = 1;
    
    this.traverseSocialData(socialData, (categoryPath: string[], item: any) => {
      if (item.소분류목록) {
        Object.entries(item.소분류목록).forEach(([incidentName, incidentData]: [string, any]) => {
          const relatedLaw = incidentData.관련법;
          
          // 찬성 댓글 처리
          if (incidentData.찬성) {
            // 개정강화 댓글
            if (incidentData.찬성.개정강화?.소셜목록) {
              incidentData.찬성.개정강화.소셜목록.forEach((social: any) => {
                comments.push({
                  id: `comment_${commentId++}`,
                  content: social.content,
                  source: this.mapChannelToSource(social.channel),
                  stance: 'reform',
                  incidentId: this.generateIncidentId(incidentName),
                  legalArticleId: this.generateLegalArticleId(relatedLaw),
                  createdAt: this.parseDate(social.date),
                  likes: Math.floor(Math.random() * 100) // 임시 좋아요 수
                });
              });
            }
            
            // 폐지약화 댓글
            if (incidentData.찬성.폐지약화?.소셜목록) {
              incidentData.찬성.폐지약화.소셜목록.forEach((social: any) => {
                comments.push({
                  id: `comment_${commentId++}`,
                  content: social.content,
                  source: this.mapChannelToSource(social.channel),
                  stance: 'abolish',
                  incidentId: this.generateIncidentId(incidentName),
                  legalArticleId: this.generateLegalArticleId(relatedLaw),
                  createdAt: this.parseDate(social.date),
                  likes: Math.floor(Math.random() * 50)
                });
              });
            }
          }
          
          // 반대 댓글 처리
          if (incidentData.반대?.소셜목록) {
            incidentData.반대.소셜목록.forEach((social: any) => {
              comments.push({
                id: `comment_${commentId++}`,
                content: social.content,
                source: this.mapChannelToSource(social.channel),
                stance: 'oppose',
                incidentId: this.generateIncidentId(incidentName),
                legalArticleId: this.generateLegalArticleId(relatedLaw),
                createdAt: this.parseDate(social.date),
                likes: Math.floor(Math.random() * 30)
              });
            });
          }
        });
      }
    });
    
    return comments;
  }
  
  private static extractNews(newsData: any): NewsArticle[] {
    const news: NewsArticle[] = [];
    let newsId = 1;
    
    this.traverseNewsData(newsData, (categoryPath: string[], item: any) => {
      if (item.소분류목록) {
        Object.entries(item.소분류목록).forEach(([incidentName, incidentData]: [string, any]) => {
          if (incidentData.articles) {
            incidentData.articles.forEach((article: any) => {
              news.push({
                id: `news_${newsId++}`,
                title: article.title,
                content: article.content,
                url: article.url,
                publisher: this.extractPublisher(article.url),
                publishedAt: this.extractDateFromData(incidentData) || new Date().toISOString(),
                incidentId: this.generateIncidentId(incidentName),
                legalArticleId: this.generateLegalArticleId(incidentData.관련법)
              });
            });
          }
        });
      }
    });
    
    return news;
  }
  
  private static createMappings(
    incidents: Incident[], 
    legalArticles: LegalArticle[], 
    comments: SocialComment[], 
    news: NewsArticle[]
  ) {
    const incidentToLegal: Record<string, string> = {};
    const commentToIncident: Record<string, string> = {};
    const newsToIncident: Record<string, string> = {};
    
    // 사건-법조항 매핑
    incidents.forEach(incident => {
      const legalArticle = legalArticles.find(la => la.fullName === incident.relatedLaw);
      if (legalArticle) {
        incidentToLegal[incident.id] = legalArticle.id;
      }
    });
    
    // 댓글-사건 매핑
    comments.forEach(comment => {
      commentToIncident[comment.id] = comment.incidentId;
    });
    
    // 뉴스-사건 매핑
    news.forEach(newsItem => {
      newsToIncident[newsItem.id] = newsItem.incidentId;
    });
    
    return {
      incidentToLegal,
      commentToIncident,
      newsToIncident
    };
  }
  
  private static calculateMappingRate(data: ProcessedData): number {
    const totalComments = data.comments.length;
    const mappedComments = data.comments.filter(c => 
      c.legalArticleId && c.incidentId
    ).length;
    
    const totalNews = data.news.length;
    const mappedNews = data.news.filter(n => 
      n.legalArticleId && n.incidentId
    ).length;
    
    const totalItems = totalComments + totalNews;
    const mappedItems = mappedComments + mappedNews;
    
    return totalItems > 0 ? (mappedItems / totalItems) * 100 : 0;
  }
  
  private static isWithinPeriod(dateString: string, period: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    
    switch (period) {
      case '7d':
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '14d':
        return date >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      case '30d':
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
        return true;
      default:
        return true;
    }
  }
  
  // 유틸리티 헬퍼 메서드들
  private static traverseNewsData(data: any, callback: (categoryPath: string[], item: any) => void) {
    Object.entries(data).forEach(([domain, domainData]: [string, any]) => {
      if (domainData.news?.monthly_timeline) {
        Object.entries(domainData.news.monthly_timeline).forEach(([month, monthData]: [string, any]) => {
          if (monthData.중분류목록) {
            Object.entries(monthData.중분류목록).forEach(([category, categoryData]: [string, any]) => {
              callback([domain, category], categoryData);
            });
          }
        });
      }
    });
  }
  
  private static traverseSocialData(data: any, callback: (categoryPath: string[], item: any) => void) {
    Object.entries(data).forEach(([domain, domainData]: [string, any]) => {
      if (domainData.social?.monthly_timeline) {
        Object.entries(domainData.social.monthly_timeline).forEach(([month, monthData]: [string, any]) => {
          if (monthData.중분류목록) {
            Object.entries(monthData.중분류목록).forEach(([category, categoryData]: [string, any]) => {
              callback([domain, category], categoryData);
            });
          }
        });
      }
    });
  }
  
  private static getCommentCountForIncident(socialData: any, incidentName: string): number {
    let count = 0;
    this.traverseSocialData(socialData, (categoryPath: string[], item: any) => {
      if (item.소분류목록?.[incidentName]) {
        count += item.소분류목록[incidentName].count || 0;
      }
    });
    return count;
  }
  
  private static extractDateFromData(data: any): string | null {
    // 실제 데이터에서 날짜 추출 로직 (현재는 임시)
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }
  
  private static parseLegalArticle(relatedLaw: string): [string, string] {
    // "중대재해처벌법 제5조2(안전재해)" -> ["중대재해처벌법", "제5조2"]
    const match = relatedLaw.match(/^(.+?)\s+(제\d+조\d*)/);
    if (match) {
      return [match[1], match[2]];
    }
    return [relatedLaw, ''];
  }
  
  private static mapChannelToSource(channel: string): 'naver' | 'youtube' | 'twitter' | 'blog' {
    const channelMap: Record<string, 'naver' | 'youtube' | 'twitter' | 'blog'> = {
      'blog': 'blog',
      'naver': 'naver',
      'youtube': 'youtube',
      'twitter': 'twitter'
    };
    return channelMap[channel] || 'blog';
  }
  
  private static generateIncidentId(incidentName: string): string {
    // 사건명을 기반으로 일관된 ID 생성
    return `incident_${incidentName.replace(/\s+/g, '_').toLowerCase()}`;
  }
  
  private static generateLegalArticleId(relatedLaw: string): string {
    // 법조항을 기반으로 일관된 ID 생성
    return `legal_${relatedLaw.replace(/\s+/g, '_').toLowerCase()}`;
  }
  
  private static parseDate(dateString: string): string {
    // "20250131144255" -> ISO 형식으로 변환
    if (dateString.length === 14) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10);
      const minute = dateString.substring(10, 12);
      const second = dateString.substring(12, 14);
      
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
    }
    return new Date().toISOString();
  }
  
  private static extractPublisher(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (hostname.includes('naver.com')) return '네이버뉴스';
      if (hostname.includes('daum.net')) return '다음뉴스';
      if (hostname.includes('chosun.com')) return '조선일보';
      if (hostname.includes('joongang.co.kr')) return '중앙일보';
      if (hostname.includes('donga.com')) return '동아일보';
      
      return hostname;
    } catch {
      return '알 수 없음';
    }
  }
  
  private static getStartDateForPeriod(period: '7d' | '14d' | '30d' | 'all'): Date {
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
}