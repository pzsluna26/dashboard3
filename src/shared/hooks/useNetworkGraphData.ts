import { useMemo } from 'react';
import { ProcessedData, DashboardFilters, NetworkNode, NetworkLink } from '@/shared/types/dashboard';

export const useNetworkGraphData = (data: ProcessedData | null, filters: DashboardFilters) => {
  return useMemo(() => {
    // 데이터가 없으면 더미 데이터 생성
    if (!data || !data.comments || !data.legalArticles || !data.incidents) {
      return generateDummyNetworkData();
    }

    // Apply filters to comments first
    const filteredComments = data.comments.filter(comment => {
      // Basic validation
      if (!comment || !comment.createdAt || !comment.incidentId) {
        return false;
      }
      
      // Period filter
      try {
        const withinPeriod = isWithinPeriod(comment.createdAt, filters.period);
        if (!withinPeriod) return false;
      } catch (error) {
        console.warn('Date parsing error for comment:', comment.id, error);
        return false;
      }
      
      // Source filter
      if (filters.source && filters.source.length > 0 && !filters.source.includes(comment.source)) {
        return false;
      }
      
      return true;
    });

    // Apply filters to incidents
    const filteredIncidents = data.incidents.filter(incident => {
      // Basic validation
      if (!incident || !incident.createdAt || !incident.relatedLaw) {
        return false;
      }
      
      // Period filter
      try {
        const withinPeriod = isWithinPeriod(incident.createdAt, filters.period);
        if (!withinPeriod) return false;
      } catch (error) {
        console.warn('Date parsing error for incident:', incident.id, error);
        return false;
      }
      
      // Category filter - check incident category
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(incident.category)) {
          return false;
        }
      }
      
      return true;
    });

    // 1단계: 법조항별 입법수요(댓글 수) 계산
    const legalArticleCommentCounts = new Map<string, number>();
    
    filteredComments.forEach(comment => {
      // 댓글의 사건을 찾고, 그 사건의 관련법을 찾기
      const incident = filteredIncidents.find(inc => inc.id === comment.incidentId);
      if (incident && incident.relatedLaw) {
        const count = legalArticleCommentCounts.get(incident.relatedLaw) || 0;
        legalArticleCommentCounts.set(incident.relatedLaw, count + 1);
      }
    });

    // 2단계: 입법수요 TOP 5 법조항 선정
    const topLegalArticles = Array.from(legalArticleCommentCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([legalId, commentCount]) => {
        const article = data.legalArticles.find(la => la.id === legalId);
        return article ? { article, commentCount } : null;
      })
      .filter(Boolean) as Array<{ article: typeof data.legalArticles[0], commentCount: number }>;

    // 3단계: TOP 5 법조항에 연결된 사건들 찾기
    const topLegalArticleIds = new Set(topLegalArticles.map(item => item.article.id));
    const relatedIncidents = filteredIncidents.filter(incident => 
      incident.relatedLaw && topLegalArticleIds.has(incident.relatedLaw)
    );

    // 4단계: 사건별 댓글 수 계산
    const incidentCommentCounts = new Map<string, number>();
    filteredComments.forEach(comment => {
      if (relatedIncidents.some(inc => inc.id === comment.incidentId)) {
        const count = incidentCommentCounts.get(comment.incidentId) || 0;
        incidentCommentCounts.set(comment.incidentId, count + 1);
      }
    });

    // 5단계: 노드 생성
    const nodes: NetworkNode[] = [];
    
    // 법조항 노드 추가 (사각형, 중심)
    topLegalArticles.forEach(({ article, commentCount }) => {
      nodes.push({
        id: article.id,
        type: 'legal',
        name: article.fullName.length > 20 ? article.fullName.substring(0, 20) + '...' : article.fullName,
        size: Math.max(40, Math.min(80, Math.sqrt(commentCount) * 6)), // 법조항은 더 크게
        color: getLegalArticleColor(article.category)
      });
    });

    // 사건 노드 추가 (원형, 주변)
    relatedIncidents.forEach(incident => {
      const commentCount = incidentCommentCounts.get(incident.id) || 0;
      
      // 댓글이 있는 사건만 포함
      if (commentCount > 0) {
        nodes.push({
          id: incident.id,
          type: 'incident',
          name: incident.name.length > 25 ? incident.name.substring(0, 25) + '...' : incident.name,
          size: Math.max(20, Math.min(50, Math.sqrt(commentCount) * 4)),
          color: getIncidentColor(incident.category)
        });
      }
    });

    // 6단계: 링크 생성 (사건 → 법조항)
    const links: NetworkLink[] = [];
    
    relatedIncidents.forEach(incident => {
      if (incident.relatedLaw && topLegalArticleIds.has(incident.relatedLaw)) {
        // 노드가 둘 다 존재하는지 확인
        const hasIncidentNode = nodes.some(n => n.id === incident.id);
        const hasLegalNode = nodes.some(n => n.id === incident.relatedLaw);
        
        if (hasIncidentNode && hasLegalNode) {
          const commentCount = incidentCommentCounts.get(incident.id) || 0;
          
          links.push({
            source: incident.id,
            target: incident.relatedLaw,
            strength: Math.max(2, Math.min(10, Math.sqrt(commentCount) * 2)) // 링크 강도
          });
        }
      }
    });

    // 필터링 결과 데이터가 없으면 더미 데이터 반환
    if (nodes.length === 0 || links.length === 0) {
      console.log('필터링된 데이터가 없어 더미 데이터를 사용합니다.');
      return generateDummyNetworkData();
    }

    console.log('입법수요 TOP 5 네트워크 데이터:', {
      topLegalArticles: topLegalArticles.map(item => ({
        name: item.article.fullName,
        commentCount: item.commentCount
      })),
      relatedIncidents: relatedIncidents.length,
      totalNodes: nodes.length,
      totalLinks: links.length,
      legalNodes: nodes.filter(n => n.type === 'legal').length,
      incidentNodes: nodes.filter(n => n.type === 'incident').length
    });

    return { nodes, links };
  }, [data, filters]);
};

// 더미 네트워크 데이터 생성 함수
function generateDummyNetworkData(): { nodes: NetworkNode[], links: NetworkLink[] } {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  // TOP 5 입법수요 법조항 (더미 데이터)
  const dummyLegalArticles = [
    { id: 'legal1', name: '개인정보보호법 제2조', category: '개인정보보호', commentCount: 1250 },
    { id: 'legal2', name: '도로교통법 제3조', category: '교통', commentCount: 980 },
    { id: 'legal3', name: '근로기준법 제15조', category: '노동', commentCount: 850 },
    { id: 'legal4', name: '아동복지법 제7조', category: '아동보호', commentCount: 720 },
    { id: 'legal5', name: '환경보전법 제12조', category: '환경', commentCount: 650 }
  ];

  // 관련 사건들 (더미 데이터)
  const dummyIncidents = [
    // 개인정보보호법 관련 사건들
    { id: 'incident1', name: '대형 쇼핑몰 개인정보 유출', category: '개인정보보호', legalId: 'legal1', commentCount: 450 },
    { id: 'incident2', name: '온라인 게임사 해킹 사건', category: '개인정보보호', legalId: 'legal1', commentCount: 380 },
    { id: 'incident3', name: '금융앱 보안 취약점', category: '개인정보보호', legalId: 'legal1', commentCount: 420 },
    
    // 도로교통법 관련 사건들
    { id: 'incident4', name: '스쿨존 교통사고', category: '교통', legalId: 'legal2', commentCount: 520 },
    { id: 'incident5', name: '음주운전 단속 강화', category: '교통', legalId: 'legal2', commentCount: 460 },
    
    // 근로기준법 관련 사건들
    { id: 'incident6', name: '배달업계 근로시간 논란', category: '노동', legalId: 'legal3', commentCount: 390 },
    { id: 'incident7', name: '대기업 임금체불 사건', category: '노동', legalId: 'legal3', commentCount: 460 },
    
    // 아동복지법 관련 사건들
    { id: 'incident8', name: '어린이집 아동학대', category: '아동보호', legalId: 'legal4', commentCount: 380 },
    { id: 'incident9', name: '학교폭력 대응 미흡', category: '아동보호', legalId: 'legal4', commentCount: 340 },
    
    // 환경보전법 관련 사건들
    { id: 'incident10', name: '공장 폐수 무단 방류', category: '환경', legalId: 'legal5', commentCount: 350 },
    { id: 'incident11', name: '미세먼지 저감 정책', category: '환경', legalId: 'legal5', commentCount: 300 }
  ];

  // 법조항 노드 생성
  dummyLegalArticles.forEach(legal => {
    nodes.push({
      id: legal.id,
      type: 'legal',
      name: legal.name,
      size: Math.max(40, Math.min(80, Math.sqrt(legal.commentCount) * 2)),
      color: getLegalArticleColor(legal.category)
    });
  });

  // 사건 노드 생성
  dummyIncidents.forEach(incident => {
    nodes.push({
      id: incident.id,
      type: 'incident',
      name: incident.name,
      size: Math.max(20, Math.min(50, Math.sqrt(incident.commentCount) * 1.5)),
      color: getIncidentColor(incident.category)
    });
  });

  // 링크 생성 (사건 → 법조항)
  dummyIncidents.forEach(incident => {
    links.push({
      source: incident.id,
      target: incident.legalId,
      strength: Math.max(2, Math.min(10, Math.sqrt(incident.commentCount) * 0.5))
    });
  });

  console.log('더미 네트워크 데이터 생성:', {
    legalArticles: dummyLegalArticles.length,
    incidents: dummyIncidents.length,
    totalNodes: nodes.length,
    totalLinks: links.length
  });

  return { nodes, links };
}

// Helper functions
function isWithinPeriod(dateString: string, period: string): boolean {
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

function getLegalArticleColor(category: string): string {
  const colorMap: Record<string, string> = {
    '개인정보보호': '#ef4444', // red
    '개인정보': '#ef4444', // red (alternative)
    '안전': '#f97316', // orange
    '금융': '#eab308', // yellow
    '아동보호': '#22c55e', // green
    '아동': '#22c55e', // green (alternative)
    '노동': '#06b6d4', // cyan
    '환경': '#3b82f6', // blue
    '의료': '#8b5cf6', // violet
    '교육': '#ec4899', // pink
    '교통': '#84cc16', // lime
    '주거': '#6b7280', // gray
    '사회': '#f59e0b', // amber
    '경제': '#10b981', // emerald
    '문화': '#8b5cf6', // violet
    '기술': '#06b6d4', // cyan
    '법무': '#374151', // gray-700
  };
  
  return colorMap[category] || '#6b7280';
}

function getIncidentColor(category: string): string {
  // Incidents use lighter versions of the same colors
  const colorMap: Record<string, string> = {
    '개인정보보호': '#fca5a5', // light red
    '개인정보': '#fca5a5', // light red (alternative)
    '안전': '#fdba74', // light orange
    '금융': '#fde047', // light yellow
    '아동보호': '#86efac', // light green
    '아동': '#86efac', // light green (alternative)
    '노동': '#67e8f9', // light cyan
    '환경': '#93c5fd', // light blue
    '의료': '#c4b5fd', // light violet
    '교육': '#f9a8d4', // light pink
    '교통': '#bef264', // light lime
    '주거': '#d1d5db', // light gray
    '사회': '#fcd34d', // light amber
    '경제': '#6ee7b7', // light emerald
    '문화': '#c4b5fd', // light violet
    '기술': '#67e8f9', // light cyan
    '법무': '#9ca3af', // light gray-400
  };
  
  return colorMap[category] || '#d1d5db';
}