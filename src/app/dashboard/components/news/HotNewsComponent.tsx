'use client';

import { DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { getRelativeTime } from '@/shared/utils/dateFilters';
import { useHotNews } from '@/shared/hooks/useHotNews';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface HotNewsComponentProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function HotNewsComponent({ filters, data }: HotNewsComponentProps) {
  const { hotNews, loading, error } = useHotNews(data, filters);

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMoreClick = () => {
    // TODO: 전체 뉴스 리스트 페이지로 이동
    console.log('Navigate to full news list');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 핫이슈 뉴스</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 핫이슈 뉴스</h3>
        <div className="text-center py-8">
          <p className="text-red-500 text-sm mb-2">데이터를 불러올 수 없습니다</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!hotNews.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 핫이슈 뉴스</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">표시할 뉴스가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">최근 핫이슈 뉴스</h3>
        <button
          onClick={handleMoreClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          더보기
        </button>
      </div>
      
      <div className="space-y-4">
        {hotNews.map((news, index) => (
          <div
            key={news.id}
            className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">{news.publisher}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(news.publishedAt)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-5">
                  {news.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      💬 {news.commentCount.toLocaleString()}개
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {news.relatedLegalArticle}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleNewsClick(news.url)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    title="원문보기"
                  >
                    원문보기
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}