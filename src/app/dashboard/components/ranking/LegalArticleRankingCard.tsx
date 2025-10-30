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
    <div className="bg-transparent border border-white/40 rounded-lg p-2 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 순위, 법조항명, HOT 뱃지 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 w-5 h-5 bg-[color-mix(in_oklab,var(--color-blue-500)_100%,transparent)] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[color-mix(in_oklab,var(--color-neutral-800)_100%,transparent)] truncate font-[var(--font-jua)]">
              {data.article}
            </h4>
          </div>
          {data.isHot && <HotBadge />}
        </div>

        {/* 오른쪽: 통계 정보 */}
        <div className="flex items-center gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-[color-mix(in_oklab,var(--color-blue-600)_100%,transparent)] text-xs">{data.commentCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[color-mix(in_oklab,var(--color-green-600)_100%,transparent)] text-xs">{data.newsCount}</div>
          </div>
          <button
            onClick={handleDetailClick}
            className="px-2 py-1 bg-[color-mix(in_oklab,var(--color-blue-500)_100%,transparent)] text-white text-xs rounded-md hover:bg-[color-mix(in_oklab,var(--color-blue-600)_100%,transparent)] transition-colors duration-200 shadow-sm font-medium"
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