'use client';

import { ProcessedData } from '@/shared/types/dashboard';
import { useDataCollectionStatus } from '@/shared/hooks/useDataCollectionStatus';
import { 
  ArrowPathIcon, 
  CircleStackIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface DataCollectionStatusComponentProps {
  data: ProcessedData | null;
}

export default function DataCollectionStatusComponent({ data }: DataCollectionStatusComponentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const status = useDataCollectionStatus(data);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    // In a real app, this would trigger data reload
    window.location.reload();
  };

  const formatLastUpdate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceLabel = (source: string) => {
    const sourceLabels: Record<string, string> = {
      'naver': '네이버 뉴스',
      'youtube': '유튜브',
      'twitter': '트위터',
      'blog': '블로그'
    };
    return sourceLabels[source] || source;
  };

  if (!status) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CircleStackIcon className="w-5 h-5 text-blue-500" />
          데이터 수집 현황
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 데이터 현황 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">총 뉴스</p>
              <p className="text-2xl font-bold text-blue-900">{status.totalNews.toLocaleString()}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            오늘 +{status.todayNews.toLocaleString()}건
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">총 댓글</p>
              <p className="text-2xl font-bold text-green-900">{status.totalComments.toLocaleString()}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">
            오늘 +{status.todayComments.toLocaleString()}건
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">매핑 성공률</p>
              <p className="text-2xl font-bold text-purple-900">{status.mappingSuccessRate}%</p>
            </div>
            <CircleStackIcon className="w-8 h-8 text-purple-500" />
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.mappingSuccessRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">마지막 업데이트</p>
              <p className="text-lg font-bold text-orange-900">
                {formatLastUpdate(status.lastUpdateTime)}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">실시간 동기화</p>
        </div>
      </div>

      {/* 출처별 분포 바 차트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">출처별 댓글 분포</h4>
          <span className="text-xs text-gray-500">
            {status.sourceDistribution.filter(item => item.count > 0).length}개 소스에서 수집
          </span>
        </div>
        <div className="space-y-3">
          {status.sourceDistribution.map((item, index) => (
            <div key={item.source} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">
                {getSourceLabel(item.source)}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.count > 0 ? (
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      'bg-orange-500'
                    ) : 'bg-gray-300'
                  }`}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }} // Minimum 2% width for visibility
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-medium ${
                    item.count > 0 ? 'text-white mix-blend-difference' : 'text-gray-500'
                  }`}>
                    {item.count.toLocaleString()}건 ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>데이터 품질: {status.mappingSuccessRate >= 90 ? '우수' : status.mappingSuccessRate >= 70 ? '양호' : '개선 필요'}</span>
          <span>총 {(status.totalNews + status.totalComments).toLocaleString()}건 수집</span>
        </div>
      </div>
    </div>
  );
}