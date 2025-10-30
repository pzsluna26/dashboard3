'use client';

import { DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { useRisingIssues } from '@/shared/hooks/useRisingIssues';

interface RisingIssuesComponentProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function RisingIssuesComponent({ filters, data }: RisingIssuesComponentProps) {
  const risingIssues = useRisingIssues(data, filters);



  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">급상승 사건</h3>
        <div className="text-center py-8 text-gray-500">
          데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (risingIssues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">급상승 사건</h3>
        <div className="text-center py-8 text-gray-500">
          급상승 이슈가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">급상승 사건</h3>
      <div className="space-y-4">
        {risingIssues.map((issue, index) => (
          <RisingIssueCard key={issue.id} issue={issue} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface RisingIssueCardProps {
  issue: {
    id: string;
    name: string;
    growthRate: number;
    todayCommentCount: number;
    relatedLegalArticle: string;
  };
  rank: number;
}

function RisingIssueCard({ issue, rank }: RisingIssueCardProps) {
  const getGrowthRateColor = (rate: number) => {
    if (rate >= 100) return 'text-red-600 bg-red-50';
    if (rate >= 50) return 'text-orange-600 bg-orange-50';
    if (rate >= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getRankBadgeColor(rank)}`}>
            {rank}
          </span>
          <h4 className="font-medium text-gray-900 flex-1">{issue.name}</h4>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getGrowthRateColor(issue.growthRate)}`}>
          ↑ {issue.growthRate}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">오늘 댓글:</span>
          <span className="ml-1 font-medium text-blue-600">{issue.todayCommentCount.toLocaleString()}개</span>
        </div>
        <div>
          <span className="text-gray-500">관련법:</span>
          <span className="ml-1 font-medium text-gray-900 text-xs">{issue.relatedLegalArticle}</span>
        </div>
      </div>
    </div>
  );
}