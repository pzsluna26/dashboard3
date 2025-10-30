import { ProcessedData, DashboardFilters } from '@/shared/types/dashboard';

// 테스트용 히트맵 데이터 생성 함수
export function generateTestHeatmapData(): ProcessedData {
  const categories = ['개인정보', '산업안전', '환경보호', '소비자보호', '노동법'];
  const stances: Array<'reform' | 'abolish' | 'oppose'> = ['reform', 'abolish', 'oppose'];
  
  const legalArticles = categories.map((category, index) => ({
    id: `legal_${index + 1}`,
    name: `${category}법`,
    article: `제${index + 1}조`,
    category,
    fullName: `${category}법 제${index + 1}조`
  }));

  const incidents = categories.map((category, index) => ({
    id: `incident_${index + 1}`,
    name: `${category} 관련 사건`,
    category,
    relatedLaw: `${category}법 제${index + 1}조`,
    commentCount: Math.floor(Math.random() * 200) + 50,
    newsCount: Math.floor(Math.random() * 10) + 1,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const comments = [];
  let commentId = 1;

  // 각 법조항별로 다양한 입장의 댓글 생성
  legalArticles.forEach(article => {
    stances.forEach(stance => {
      const count = Math.floor(Math.random() * 100) + 10;
      
      for (let i = 0; i < count; i++) {
        comments.push({
          id: `comment_${commentId++}`,
          content: `${stance} 관련 댓글 ${i + 1}`,
          source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
          stance,
          incidentId: `incident_${legalArticles.indexOf(article) + 1}`,
          legalArticleId: article.id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 50)
        });
      }
    });
  });

  const news = incidents.map((incident, index) => ({
    id: `news_${index + 1}`,
    title: `${incident.name} 관련 뉴스`,
    content: '뉴스 내용',
    url: `https://example.com/news${index + 1}`,
    publisher: '테스트 뉴스',
    publishedAt: incident.createdAt,
    incidentId: incident.id,
    legalArticleId: `legal_${index + 1}`
  }));

  const mappings = {
    incidentToLegal: Object.fromEntries(
      incidents.map((incident, index) => [incident.id, `legal_${index + 1}`])
    ),
    commentToIncident: Object.fromEntries(
      comments.map(comment => [comment.id, comment.incidentId])
    ),
    newsToIncident: Object.fromEntries(
      news.map(newsItem => [newsItem.id, newsItem.incidentId])
    )
  };

  return {
    incidents,
    legalArticles,
    comments,
    news,
    mappings
  };
}

// 테스트용 필터
export const testFilters: DashboardFilters = {
  period: '7d',
  category: [],
  source: []
};

// 히트맵 데이터 검증 함수
export function validateHeatmapData(data: ProcessedData): boolean {
  console.log('Validating heatmap data:', {
    legalArticles: data.legalArticles.length,
    comments: data.comments.length,
    categories: [...new Set(data.legalArticles.map(la => la.category))],
    stances: [...new Set(data.comments.map(c => c.stance))]
  });

  // 기본 검증
  if (data.legalArticles.length === 0) {
    console.error('No legal articles found');
    return false;
  }

  if (data.comments.length === 0) {
    console.error('No comments found');
    return false;
  }

  // 카테고리 검증
  const categories = [...new Set(data.legalArticles.map(la => la.category))];
  if (categories.length === 0) {
    console.error('No categories found');
    return false;
  }

  // 입장 검증
  const stances = [...new Set(data.comments.map(c => c.stance))];
  const expectedStances = ['reform', 'abolish', 'oppose'];
  const hasAllStances = expectedStances.every(stance => stances.includes(stance));
  
  if (!hasAllStances) {
    console.warn('Not all expected stances found:', { found: stances, expected: expectedStances });
  }

  console.log('Heatmap data validation passed');
  return true;
}