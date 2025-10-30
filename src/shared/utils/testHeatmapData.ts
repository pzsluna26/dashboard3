import { ProcessedData, LegalArticle, SocialComment, Incident, NewsArticle } from '@/shared/types/dashboard';

/**
 * 히트맵 테스트를 위한 더미 데이터 생성
 */
export function generateTestHeatmapData(): ProcessedData {
  // 법 분야 정의
  const categories = [
    '개인정보보호',
    '산업안전',
    '금융규제',
    '아동보호',
    '환경보호',
    '노동권익'
  ];

  // 법조항 생성
  const legalArticles: LegalArticle[] = [
    {
      id: 'legal_1',
      name: '개인정보보호법',
      article: '제24조',
      category: '개인정보보호',
      fullName: '개인정보보호법 제24조'
    },
    {
      id: 'legal_2',
      name: '개인정보보호법',
      article: '제22조',
      category: '개인정보보호',
      fullName: '개인정보보호법 제22조'
    },
    {
      id: 'legal_3',
      name: '중대재해처벌법',
      article: '제5조',
      category: '산업안전',
      fullName: '중대재해처벌법 제5조'
    },
    {
      id: 'legal_4',
      name: '산업안전보건법',
      article: '제38조',
      category: '산업안전',
      fullName: '산업안전보건법 제38조'
    },
    {
      id: 'legal_5',
      name: '자본시장법',
      article: '제178조',
      category: '금융규제',
      fullName: '자본시장법 제178조'
    },
    {
      id: 'legal_6',
      name: '아동복지법',
      article: '제17조',
      category: '아동보호',
      fullName: '아동복지법 제17조'
    },
    {
      id: 'legal_7',
      name: '환경정책기본법',
      article: '제12조',
      category: '환경보호',
      fullName: '환경정책기본법 제12조'
    },
    {
      id: 'legal_8',
      name: '근로기준법',
      article: '제56조',
      category: '노동권익',
      fullName: '근로기준법 제56조'
    }
  ];

  // 사건 생성
  const incidents: Incident[] = [
    {
      id: 'incident_1',
      name: '대형 IT기업 개인정보 유출',
      category: '개인정보보호',
      relatedLaw: '개인정보보호법 제24조',
      commentCount: 450,
      newsCount: 15,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_2',
      name: '웹사이트 쿠키 동의 의무화',
      category: '개인정보보호',
      relatedLaw: '개인정보보호법 제22조',
      commentCount: 280,
      newsCount: 8,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_3',
      name: '태안화력 노동자 사망사고',
      category: '산업안전',
      relatedLaw: '중대재해처벌법 제5조',
      commentCount: 850,
      newsCount: 25,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_4',
      name: '건설현장 안전사고',
      category: '산업안전',
      relatedLaw: '산업안전보건법 제38조',
      commentCount: 320,
      newsCount: 12,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_5',
      name: '가상화폐 거래소 사기',
      category: '금융규제',
      relatedLaw: '자본시장법 제178조',
      commentCount: 650,
      newsCount: 18,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'incident_6',
      name: '아동학대 사건',
      category: '아동보호',
      relatedLaw: '아동복지법 제17조',
      commentCount: 920,
      newsCount: 22,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // 댓글 생성 (각 법 분야별로 다양한 입장 분포)
  const comments: SocialComment[] = [];
  let commentId = 1;

  // 개인정보보호 분야 댓글 (개정강화 70%, 폐지완화 20%, 반대 10%)
  const privacyComments = [
    { stance: 'reform', count: 350 },
    { stance: 'abolish', count: 100 },
    { stance: 'oppose', count: 50 }
  ];

  privacyComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `개인정보보호 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: Math.random() > 0.5 ? 'incident_1' : 'incident_2',
        legalArticleId: Math.random() > 0.5 ? 'legal_1' : 'legal_2',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 100)
      });
    }
  });

  // 산업안전 분야 댓글 (개정강화 80%, 폐지완화 15%, 반대 5%)
  const safetyComments = [
    { stance: 'reform', count: 600 },
    { stance: 'abolish', count: 112 },
    { stance: 'oppose', count: 38 }
  ];

  safetyComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `산업안전 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: Math.random() > 0.5 ? 'incident_3' : 'incident_4',
        legalArticleId: Math.random() > 0.5 ? 'legal_3' : 'legal_4',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 150)
      });
    }
  });

  // 금융규제 분야 댓글 (개정강화 45%, 폐지완화 35%, 반대 20%)
  const financeComments = [
    { stance: 'reform', count: 292 },
    { stance: 'abolish', count: 228 },
    { stance: 'oppose', count: 130 }
  ];

  financeComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `금융규제 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: 'incident_5',
        legalArticleId: 'legal_5',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 80)
      });
    }
  });

  // 아동보호 분야 댓글 (개정강화 85%, 폐지완화 10%, 반대 5%)
  const childComments = [
    { stance: 'reform', count: 782 },
    { stance: 'abolish', count: 92 },
    { stance: 'oppose', count: 46 }
  ];

  childComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `아동보호 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: 'incident_6',
        legalArticleId: 'legal_6',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 200)
      });
    }
  });

  // 환경보호 분야 댓글 (개정강화 60%, 폐지완화 25%, 반대 15%)
  const envComments = [
    { stance: 'reform', count: 180 },
    { stance: 'abolish', count: 75 },
    { stance: 'oppose', count: 45 }
  ];

  envComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `환경보호 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: 'incident_env',
        legalArticleId: 'legal_7',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 60)
      });
    }
  });

  // 노동권익 분야 댓글 (개정강화 75%, 폐지완화 20%, 반대 5%)
  const laborComments = [
    { stance: 'reform', count: 225 },
    { stance: 'abolish', count: 60 },
    { stance: 'oppose', count: 15 }
  ];

  laborComments.forEach(({ stance, count }) => {
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${commentId++}`,
        content: `노동권익 관련 ${stance} 의견`,
        source: ['naver', 'youtube', 'twitter', 'blog'][Math.floor(Math.random() * 4)] as any,
        stance: stance as any,
        incidentId: 'incident_labor',
        legalArticleId: 'legal_8',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 90)
      });
    }
  });

  // 뉴스 기사 생성
  const news: NewsArticle[] = incidents.map((incident, index) => ({
    id: `news_${index + 1}`,
    title: `${incident.name} 관련 뉴스`,
    content: `${incident.name}에 대한 상세 내용입니다.`,
    url: `https://news.example.com/article_${index + 1}`,
    publisher: ['네이버뉴스', '다음뉴스', '조선일보', '중앙일보'][index % 4],
    publishedAt: incident.createdAt,
    incidentId: incident.id,
    legalArticleId: legalArticles.find(la => la.fullName === incident.relatedLaw)?.id || ''
  }));

  // 매핑 정보 생성
  const mappings = {
    incidentToLegal: {} as Record<string, string>,
    commentToIncident: {} as Record<string, string>,
    newsToIncident: {} as Record<string, string>
  };

  incidents.forEach(incident => {
    const legalArticle = legalArticles.find(la => la.fullName === incident.relatedLaw);
    if (legalArticle) {
      mappings.incidentToLegal[incident.id] = legalArticle.id;
    }
  });

  comments.forEach(comment => {
    mappings.commentToIncident[comment.id] = comment.incidentId;
  });

  news.forEach(newsItem => {
    mappings.newsToIncident[newsItem.id] = newsItem.incidentId;
  });

  return {
    incidents,
    legalArticles,
    comments,
    news,
    mappings
  };
}