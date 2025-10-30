// Manual test utility for rising issues functionality
import { ProcessedData, DashboardFilters } from '@/shared/types/dashboard';

export function testRisingIssuesLogic() {
  console.log('=== Testing Rising Issues Logic ===');

  // Create test data with realistic timestamps
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const testData: ProcessedData = {
    incidents: [
      {
        id: 'incident_1',
        name: '개인정보 유출 사건',
        category: '개인정보',
        relatedLaw: '개인정보보호법 제24조',
        commentCount: 150,
        newsCount: 5,
        createdAt: now.toISOString()
      },
      {
        id: 'incident_2',
        name: '데이터 보안 이슈',
        category: '정보보안',
        relatedLaw: '정보통신망법 제3조',
        commentCount: 80,
        newsCount: 3,
        createdAt: yesterday.toISOString()
      }
    ],
    legalArticles: [
      {
        id: 'legal_1',
        name: '개인정보보호법',
        article: '제24조',
        category: '개인정보',
        fullName: '개인정보보호법 제24조'
      },
      {
        id: 'legal_2',
        name: '정보통신망법',
        article: '제3조',
        category: '정보보안',
        fullName: '정보통신망법 제3조'
      }
    ],
    comments: [
      // 오늘 댓글들 (incident_1)
      {
        id: 'comment_1',
        content: '개인정보 보호가 중요합니다',
        source: 'naver' as const,
        stance: 'reform' as const,
        incidentId: 'incident_1',
        legalArticleId: 'legal_1',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
        likes: 10
      },
      {
        id: 'comment_2',
        content: '법 강화 필요해요',
        source: 'youtube' as const,
        stance: 'reform' as const,
        incidentId: 'incident_1',
        legalArticleId: 'legal_1',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전
        likes: 5
      },
      // 어제 댓글 (incident_1)
      {
        id: 'comment_3',
        content: '어제 댓글입니다',
        source: 'blog' as const,
        stance: 'reform' as const,
        incidentId: 'incident_1',
        legalArticleId: 'legal_1',
        createdAt: new Date(yesterday.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 어제
        likes: 3
      },
      // 오늘 댓글들 (incident_2)
      {
        id: 'comment_4',
        content: '데이터 보안 이슈 심각해요',
        source: 'twitter' as const,
        stance: 'reform' as const,
        incidentId: 'incident_2',
        legalArticleId: 'legal_2',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
        likes: 8
      }
    ],
    news: [],
    mappings: {
      incidentToLegal: {
        'incident_1': 'legal_1',
        'incident_2': 'legal_2'
      },
      commentToIncident: {
        'comment_1': 'incident_1',
        'comment_2': 'incident_1',
        'comment_3': 'incident_1',
        'comment_4': 'incident_2'
      },
      newsToIncident: {}
    }
  };

  // Test growth rate calculation for each incident
  testData.incidents.forEach(incident => {
    console.log(`\n--- Testing incident: ${incident.name} ---`);

    // 오늘 댓글 수 (최근 24시간)
    const todayComments = testData.comments.filter(comment => 
      comment.incidentId === incident.id && 
      new Date(comment.createdAt) >= yesterday
    );

    // 어제 댓글 수 (24-48시간 전)
    const yesterdayComments = testData.comments.filter(comment => 
      comment.incidentId === incident.id && 
      new Date(comment.createdAt) >= twoDaysAgo && 
      new Date(comment.createdAt) < yesterday
    );

    const todayCount = todayComments.length;
    const yesterdayCount = yesterdayComments.length;

    console.log(`Today comments: ${todayCount}`);
    console.log(`Yesterday comments: ${yesterdayCount}`);

    // 증가율 계산
    let growthRate = 0;
    if (yesterdayCount === 0 && todayCount > 0) {
      growthRate = 100;
    } else if (yesterdayCount > 0) {
      growthRate = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    }

    console.log(`Growth rate: ${growthRate.toFixed(1)}%`);

    // 관련 법조항 찾기
    const relatedLegalArticle = testData.legalArticles.find(
      legal => legal.id === testData.mappings.incidentToLegal[incident.id]
    );

    console.log(`Related legal article: ${relatedLegalArticle?.fullName || '관련법 없음'}`);

    // 키워드 추출 테스트
    const keywords = extractKeywords(incident.name, todayComments);
    console.log(`Keywords: ${keywords.join(', ')}`);
  });

  console.log('\n=== Test completed ===');
  return testData;
}

// 키워드 추출 함수 (useRisingIssues에서 복사)
function extractKeywords(incidentName: string, comments: any[]): string[] {
  const keywords: string[] = [];
  
  // 사건명에서 키워드 추출
  const nameKeywords = incidentName
    .split(/[\s,()]+/)
    .filter(word => word.length > 1)
    .slice(0, 2); // 최대 2개
  
  keywords.push(...nameKeywords);

  // 댓글에서 자주 언급되는 단어 추출 (간단한 구현)
  const wordFrequency = new Map<string, number>();
  
  comments.forEach(comment => {
    const words = comment.content
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word: string) => word.length > 1 && word.length < 10);
    
    words.forEach((word: string) => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
  });

  // 빈도 상위 키워드 추가
  const topWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word);
  
  keywords.push(...topWords);

  // 중복 제거 및 최대 4개로 제한
  return Array.from(new Set(keywords)).slice(0, 4);
}