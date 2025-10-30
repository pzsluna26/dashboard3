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
    <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(31,38,135,0.2)] border border-white/40 p-6">
      <h3 className="text-xl font-bold mb-4 text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] font-[var(--font-blackhan)] drop-shadow-sm">급상승 사건</h3>
      <div className="space-y-4">
        {risingIssues.map((issue, index) => (
          <RisingIssueCard key={`${issue.id}-${index}`} issue={issue} rank={index + 1} />
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
    if (rate >= 100) return 'text-[color-mix(in_oklab,var(--color-red-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-red-50)_100%,transparent)] border-[color-mix(in_oklab,var(--color-red-200)_50%,transparent)]';
    if (rate >= 50) return 'text-[color-mix(in_oklab,var(--color-orange-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-orange-50)_100%,transparent)] border-[color-mix(in_oklab,var(--color-orange-200)_50%,transparent)]';
    if (rate >= 20) return 'text-[color-mix(in_oklab,var(--color-yellow-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-yellow-50)_100%,transparent)] border-[color-mix(in_oklab,var(--color-yellow-200)_50%,transparent)]';
    return 'text-[color-mix(in_oklab,var(--color-green-600)_100%,transparent)] bg-[color-mix(in_oklab,var(--color-green-50)_100%,transparent)] border-[color-mix(in_oklab,var(--color-green-200)_50%,transparent)]';
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-[color-mix(in_oklab,var(--color-red-500)_100%,transparent)] text-white shadow-sm';
      case 2: return 'bg-[color-mix(in_oklab,var(--color-orange-500)_100%,transparent)] text-white shadow-sm';
      case 3: return 'bg-[color-mix(in_oklab,var(--color-yellow-500)_100%,transparent)] text-white shadow-sm';
      default: return 'bg-[color-mix(in_oklab,var(--color-gray-500)_100%,transparent)] text-white shadow-sm';
    }
  };

  return (
    <div className="border border-white/40 bg-white/30 backdrop-blur-md rounded-xl p-4 hover:shadow-[0_12px_32px_rgba(31,38,135,0.2)] transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${getRankBadgeColor(rank)}`}>
            {rank}
          </span>
          <h4 className="font-medium text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] flex-1 font-[var(--font-jua)]">{issue.name}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${getGrowthRateColor(issue.growthRate)}`}>
          ↗ {issue.growthRate}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <span className="text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)]">오늘 댓글:</span>
          <span className="ml-1 font-bold text-[color-mix(in_oklab,var(--color-blue-600)_100%,transparent)]">{issue.todayCommentCount.toLocaleString()}개</span>
        </div>
        <div className="flex items-center">
          <span className="text-[color-mix(in_oklab,var(--color-neutral-600)_100%,transparent)]">관련법:</span>
          <span className="ml-1 font-medium text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] text-xs">{issue.relatedLegalArticle}</span>
        </div>
      </div>
    </div>
  );
}