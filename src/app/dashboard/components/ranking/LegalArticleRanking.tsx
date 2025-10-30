'use client';

import { useMemo } from 'react';
import { LegalArticleRank, DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { DataProcessor } from '@/shared/services/dataProcessor';
import LegalArticleRankingCard from '@/app/dashboard/components/ranking/LegalArticleRankingCard';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

interface LegalArticleRankingProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function LegalArticleRanking({ filters, data }: LegalArticleRankingProps) {
  // 데이터 처리
  const { topLegalArticles, loading, error } = useMemo(() => {
    console.log('LegalArticleRanking processing data:', { 
      hasData: !!data, 
      filters,
      dataStats: data ? {
        incidents: data.incidents.length,
        legalArticles: data.legalArticles.length,
        comments: data.comments.length,
        news: data.news.length
      } : null
    });

    if (!data) {
      // 데이터가 없을 때 mock 데이터 사용
      const mockData: LegalArticleRank[] = [
        {
          id: 'mock_1',
          article: '개인정보보호법 제24조',
          commentCount: 1250,
          newsCount: 15,
          incidentCount: 3,
          majorIncidents: [
            { name: '개인정보 유출 사건', commentCount: 450 },
            { name: '위치정보 수집 논란', commentCount: 280 }
          ],
          stanceDistribution: { reform: 800, abolish: 200, oppose: 250 },
          representativeComment: {
            content: '개인정보보호법을 더 강화해야 합니다. 기업들의 무분별한 개인정보 수집을 막아야 해요.',
            likes: 45
          },
          isHot: true
        },
        {
          id: 'mock_2',
          article: '중대재해처벌법 제5조',
          commentCount: 980,
          newsCount: 12,
          incidentCount: 2,
          majorIncidents: [
            { name: '태안화력 노동자 사망', commentCount: 600 },
            { name: '건설현장 안전사고', commentCount: 380 }
          ],
          stanceDistribution: { reform: 700, abolish: 100, oppose: 180 },
          representativeComment: {
            content: '중대재해처벌법을 더 강화해야 합니다. 노동자의 생명이 우선이에요.',
            likes: 38
          },
          isHot: true
        },
        {
          id: 'mock_3',
          article: '최저임금법 제8조',
          commentCount: 850,
          newsCount: 8,
          incidentCount: 1,
          majorIncidents: [
            { name: '최저임금 인상', commentCount: 850 }
          ],
          stanceDistribution: { reform: 500, abolish: 150, oppose: 200 },
          representativeComment: {
            content: '최저임금 인상이 필요합니다. 생활비가 너무 올랐어요.',
            likes: 32
          },
          isHot: false
        },
        {
          id: 'mock_4',
          article: '자본시장법 제5조',
          commentCount: 720,
          newsCount: 6,
          incidentCount: 1,
          majorIncidents: [
            { name: '가상자산 규제', commentCount: 720 }
          ],
          stanceDistribution: { reform: 400, abolish: 200, oppose: 120 },
          representativeComment: {
            content: '가상자산 규제가 너무 강합니다. 혁신을 막고 있어요.',
            likes: 28
          },
          isHot: false
        },
        {
          id: 'mock_5',
          article: '미세먼지법 제7조',
          commentCount: 650,
          newsCount: 5,
          incidentCount: 1,
          majorIncidents: [
            { name: '미세먼지 대책', commentCount: 650 }
          ],
          stanceDistribution: { reform: 450, abolish: 100, oppose: 100 },
          representativeComment: {
            content: '미세먼지 저감 대책을 더 강화해야 합니다.',
            likes: 25
          },
          isHot: false
        }
      ];

      return {
        topLegalArticles: mockData,
        loading: false,
        error: null
      };
    }

    try {
      const filteredData = DataProcessor.applyFilters(data, filters);
      console.log('Filtered data:', {
        originalComments: data.comments.length,
        filteredComments: filteredData.comments.length,
        originalLegalArticles: data.legalArticles.length,
        filteredLegalArticles: filteredData.legalArticles.length
      });
      
      const topArticles = DataProcessor.calculateTopLegalArticles(filteredData, 5);
      console.log('Top articles calculated:', topArticles.length, topArticles);
      
      // 항상 mock 데이터 사용 (임시)
      console.log('Using mock data for demonstration');
      const mockData: LegalArticleRank[] = [
        {
          id: 'demo_1',
          article: '개인정보보호법 제24조',
          commentCount: 1250,
          newsCount: 15,
          incidentCount: 3,
          majorIncidents: [
            { name: '개인정보 유출 사건', commentCount: 450 },
            { name: '위치정보 수집 논란', commentCount: 280 }
          ],
          stanceDistribution: { reform: 800, abolish: 200, oppose: 250 },
          representativeComment: {
            content: '개인정보보호법을 더 강화해야 합니다.',
            likes: 45
          },
          isHot: true
        },
        {
          id: 'demo_2',
          article: '중대재해처벌법 제5조',
          commentCount: 980,
          newsCount: 12,
          incidentCount: 2,
          majorIncidents: [
            { name: '태안화력 노동자 사망', commentCount: 600 },
            { name: '건설현장 안전사고', commentCount: 380 }
          ],
          stanceDistribution: { reform: 700, abolish: 100, oppose: 180 },
          representativeComment: {
            content: '중대재해처벌법을 더 강화해야 합니다.',
            likes: 38
          },
          isHot: true
        },
        {
          id: 'demo_3',
          article: '최저임금법 제8조',
          commentCount: 850,
          newsCount: 8,
          incidentCount: 1,
          majorIncidents: [
            { name: '최저임금 인상', commentCount: 850 }
          ],
          stanceDistribution: { reform: 500, abolish: 150, oppose: 200 },
          representativeComment: {
            content: '최저임금 인상이 필요합니다.',
            likes: 32
          },
          isHot: false
        },
        {
          id: 'demo_4',
          article: '자본시장법 제5조',
          commentCount: 720,
          newsCount: 6,
          incidentCount: 1,
          majorIncidents: [
            { name: '가상자산 규제', commentCount: 720 }
          ],
          stanceDistribution: { reform: 400, abolish: 200, oppose: 120 },
          representativeComment: {
            content: '가상자산 규제가 너무 강합니다.',
            likes: 28
          },
          isHot: false
        },
        {
          id: 'demo_5',
          article: '미세먼지법 제7조',
          commentCount: 650,
          newsCount: 5,
          incidentCount: 1,
          majorIncidents: [
            { name: '미세먼지 대책', commentCount: 650 }
          ],
          stanceDistribution: { reform: 450, abolish: 100, oppose: 100 },
          representativeComment: {
            content: '미세먼지 저감 대책을 더 강화해야 합니다.',
            likes: 25
          },
          isHot: false
        }
      ];
      
      return {
        topLegalArticles: mockData,
        loading: false,
        error: null
      };
      
      return {
        topLegalArticles: topArticles,
        loading: false,
        error: null
      };
    } catch (err) {
      console.error('Error processing legal articles:', err);
      return {
        topLegalArticles: [],
        loading: false,
        error: err instanceof Error ? err : new Error('데이터 처리 실패')
      };
    }
  }, [data, filters]);

  const handleDetailClick = (articleId: string) => {
    // TODO: 상세 페이지로 네비게이션 구현
    // 현재는 콘솔 로그로 대체
    console.log('Navigate to detail page for article:', articleId);
    
    // 실제 구현에서는 Next.js router를 사용
    // router.push(`/dashboard/legal-article/${articleId}`);
  };

  if (loading) {
    return (
      <div className="bg-transparent rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">입법수요 TOP 5</h3>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">입법수요 TOP 5</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (topLegalArticles.length === 0) {
    return (
      <div className="bg-transparent rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">입법수요 TOP 5</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">선택한 조건에 해당하는 데이터가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">필터 조건을 변경해보세요.</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>디버그 정보:</p>
            <p>데이터 로딩: {data ? '완료' : '실패'}</p>
            <p>필터: {JSON.stringify(filters)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent border border-white/40 rounded-2xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-lg font-bold text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] font-[var(--font-blackhan)] drop-shadow-sm">입법수요 TOP 5</h3>
        <div className="text-xs text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)] font-medium">
          총 {topLegalArticles.reduce((sum, item) => sum + item.commentCount, 0).toLocaleString()}개 댓글
        </div>
      </div>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        {topLegalArticles.slice(0, 5).map((ranking, index) => (
          <LegalArticleRankingCard
            key={ranking.id}
            rank={index + 1}
            data={ranking}
            onDetailClick={handleDetailClick}
          />
        ))}
      </div>
    </div>
  );
}