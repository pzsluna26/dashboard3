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
    <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
      {/* 개정강화 (빨간색) */}
      {reformPercentage > 0 && (
        <div 
          className="bg-red-500"
          style={{ width: `${reformPercentage}%` }}
          title={`개정강화: ${distribution.reform}개 (${reformPercentage.toFixed(1)}%)`}
        />
      )}
      
      {/* 폐지완화 (파란색) */}
      {abolishPercentage > 0 && (
        <div 
          className="bg-blue-500"
          style={{ width: `${abolishPercentage}%` }}
          title={`폐지완화: ${distribution.abolish}개 (${abolishPercentage.toFixed(1)}%)`}
        />
      )}
      
      {/* 반대 (회색) */}
      {opposePercentage > 0 && (
        <div 
          className="bg-gray-500"
          style={{ width: `${opposePercentage}%` }}
          title={`반대: ${distribution.oppose}개 (${opposePercentage.toFixed(1)}%)`}
        />
      )}
    </div>
  );
}