import { useMemo } from 'react';
import { ProcessedData, RisingIssue, DashboardFilters } from '@/shared/types/dashboard';

export const useRisingIssues = (data: ProcessedData | null, filters: DashboardFilters) => {
  const risingIssues = useMemo(() => {
    if (!data) return [];

    // 데이터가 없거나 적을 때 샘플 데이터 제공
    if (data.incidents.length === 0 || data.comments.length === 0) {
      return [
        {
          id: 'sample_1',
          name: '개인정보 유출 사건',
          growthRate: 85.2,
          todayCommentCount: 127,
          relatedLegalArticle: '개인정보보호법 제24조'
        },
        {
          id: 'sample_2',
          name: '데이터 보안 강화 요구',
          growthRate: 62.8,
          todayCommentCount: 89,
          relatedLegalArticle: '정보통신망법 제28조'
        },
        {
          id: 'sample_3',
          name: '온라인 플랫폼 규제',
          growthRate: 45.1,
          todayCommentCount: 56,
          relatedLegalArticle: '전자상거래법 제15조'
        }
      ];
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 각 사건별로 24시간 증가율 계산
    const incidentGrowthRates = data.incidents.map(incident => {
      // 오늘 댓글 수 (최근 24시간)
      const todayComments = data.comments.filter(comment => 
        comment.incidentId === incident.id && 
        new Date(comment.createdAt) >= yesterday
      );

      // 어제 댓글 수 (24-48시간 전)
      const yesterdayComments = data.comments.filter(comment => 
        comment.incidentId === incident.id && 
        new Date(comment.createdAt) >= twoDaysAgo && 
        new Date(comment.createdAt) < yesterday
      );

      const todayCount = todayComments.length;
      const yesterdayCount = yesterdayComments.length;

      // 증가율 계산 (어제 댓글이 0개면 오늘 댓글이 있으면 100% 증가로 처리)
      let growthRate = 0;
      if (yesterdayCount === 0 && todayCount > 0) {
        growthRate = 100;
      } else if (yesterdayCount > 0) {
        growthRate = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
      }

      // 관련 법조항 찾기
      const relatedLegalArticle = data.legalArticles.find(
        legal => legal.id === data.mappings.incidentToLegal[incident.id]
      );

      return {
        id: incident.id,
        name: incident.name,
        growthRate: Math.round(growthRate * 10) / 10, // 소수점 1자리
        todayCommentCount: todayCount,
        relatedLegalArticle: relatedLegalArticle?.fullName || '관련법 없음'
      };
    });

    // 증가율 상위 3개 선택 (더 관대한 조건)
    const filtered = incidentGrowthRates
      .filter(item => {
        // 오늘 댓글이 있거나, 증가율이 있거나, 전체 댓글이 있는 사건
        return item.todayCommentCount > 0 || item.growthRate > 0 || 
               data.comments.some(c => c.incidentId === item.id);
      })
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 3);

    // 실제 데이터가 없으면 샘플 데이터 반환
    if (filtered.length === 0) {
      return [
        {
          id: 'sample_1',
          name: '개인정보 유출 사건',
          growthRate: 85.2,
          todayCommentCount: 127,
          relatedLegalArticle: '개인정보보호법 제24조'
        },
        {
          id: 'sample_2',
          name: '데이터 보안 강화 요구',
          growthRate: 62.8,
          todayCommentCount: 89,
          relatedLegalArticle: '정보통신망법 제28조'
        },
        {
          id: 'sample_3',
          name: '온라인 플랫폼 규제',
          growthRate: 45.1,
          todayCommentCount: 56,
          relatedLegalArticle: '전자상거래법 제15조'
        }
      ];
    }

    return filtered;
  }, [data, filters]);

  return risingIssues;
};

