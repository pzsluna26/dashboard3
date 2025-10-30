'use client';

import { StanceDistribution } from '@/shared/types/dashboard';

interface StanceDistributionBarProps {
  distribution: StanceDistribution;
}

export default function StanceDistributionBar({ distribution }: StanceDistributionBarProps) {
  const total = distribution.reform + distribution.abolish + distribution.oppose;
  
  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        데이터가 없습니다
      </div>
    );
  }

  const reformPercentage = (distribution.reform / total) * 100;
  const abolishPercentage = (distribution.abolish / total) * 100;
  const opposePercentage = (distribution.oppose / total) * 100;

  return (
    <div className="flex h-3 bg-[color-mix(in_oklab,var(--color-neutral-200)_100%,transparent)] rounded-full overflow-hidden border border-white/30">
      {/* 개정강화 (부드러운 코랄 핑크) */}
      {reformPercentage > 0 && (
        <div 
          className="bg-[color-mix(in_oklab,var(--color-rose-600)_70%,var(--color-orange-400)_30%)] transition-all duration-300"
          style={{ width: `${reformPercentage}%` }}
          title={`개정강화: ${distribution.reform}개 (${reformPercentage.toFixed(1)}%)`}
        />
      )}
      
      {/* 폐지완화 (부드러운 스카이 블루) */}
      {abolishPercentage > 0 && (
        <div 
          className="bg-[color-mix(in_oklab,var(--color-sky-500)_80%,var(--color-blue-400)_20%)] transition-all duration-300"
          style={{ width: `${abolishPercentage}%` }}
          title={`폐지완화: ${distribution.abolish}개 (${abolishPercentage.toFixed(1)}%)`}
        />
      )}
      
      {/* 반대 (부드러운 슬레이트 그레이) */}
      {opposePercentage > 0 && (
        <div 
          className="bg-[color-mix(in_oklab,var(--color-neutral-400)_100%,transparent)] transition-all duration-300"
          style={{ width: `${opposePercentage}%` }}
          title={`반대: ${distribution.oppose}개 (${opposePercentage.toFixed(1)}%)`}
        />
      )}
    </div>
  );
}