'use client';

import { LegalArticleRank } from '@/shared/types/dashboard';
import StanceDistributionBar from '@/app/dashboard/components/ranking/StanceDistributionBar';
import HotBadge from '@/app/dashboard/components/ranking/HotBadge';
import MajorIncidents from '@/app/dashboard/components/ranking/MajorIncidents';
import RepresentativeComment from '@/app/dashboard/components/ranking/RepresentativeComment';

interface LegalArticleRankingCardProps {
  rank: number;
  data: LegalArticleRank;
  onDetailClick: (articleId: string) => void;
}

export default function LegalArticleRankingCard({ 
  rank, 
  data, 
  onDetailClick 
}: LegalArticleRankingCardProps) {
  const handleDetailClick = () => {
    onDetailClick(data.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-1 hover:shadow-sm">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 순위, 법조항명, HOT 뱃지 */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex-shrink-0 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 truncate">
              {data.article}
            </h4>
          </div>
          {data.isHot && <HotBadge />}
        </div>

        {/* 오른쪽: 통계 정보 */}
        <div className="flex items-center gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-blue-600 text-xs">{data.commentCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600 text-xs">{data.newsCount}</div>
          </div>
          <button
            onClick={handleDetailClick}
            className="px-1 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            상세
          </button>
        </div>
      </div>

      {/* 입장 분포 진행바 (간소화) */}
      <div className="mt-1">
        <StanceDistributionBar distribution={data.stanceDistribution} />
      </div>
    </div>
  );
}