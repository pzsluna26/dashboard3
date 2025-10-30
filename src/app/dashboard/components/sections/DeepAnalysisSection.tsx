'use client';

import { DashboardFilters, ProcessedData, OpinionTrendData } from '@/shared/types/dashboard';
import LegalFieldHeatmap from '@/app/dashboard/components/charts/LegalFieldHeatmap';
import { NetworkGraph } from '@/app/dashboard/components/charts';
import SimpleNetworkGraph from '@/app/dashboard/components/charts/SimpleNetworkGraph';
import OpinionTrendChart from '@/app/dashboard/components/charts/OpinionTrendChart';
import { useNetworkGraphData } from '@/shared/hooks/useNetworkGraphData';
import { useState } from 'react';

interface DeepAnalysisSectionProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
  opinionTrendData?: OpinionTrendData[];
}

export default function DeepAnalysisSection({ filters, data, opinionTrendData = [] }: DeepAnalysisSectionProps) {
  const { nodes, links } = useNetworkGraphData(data, filters);
  const [useSimpleGraph, setUseSimpleGraph] = useState(false);

  // Add safety check for the network graph data
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeLinks = Array.isArray(links) ? links : [];

  return (
    <section className="space-y-1">
      {/* 법 분야별 히트맵 */}
      <div className="h-96">
        <LegalFieldHeatmap
          data={data}
          filters={filters}
        />
      </div>

      {/* 사건-법 네트워크 그래프 */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold">주요 사건-법 연결망</h3>
          <button
            onClick={() => setUseSimpleGraph(!useSimpleGraph)}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="그래프 모드 전환"
          >
            {useSimpleGraph ? '고급 모드' : '단순 모드'}
          </button>
        </div>
        <div className="h-96">
          {useSimpleGraph ? (
            <SimpleNetworkGraph
              nodes={safeNodes}
              links={safeLinks}
              width={800}
              height={380}
            />
          ) : (
            <NetworkGraph
              nodes={safeNodes}
              links={safeLinks}
              width={800}
              height={380}
            />
          )}
        </div>
      </div>

      {/* 여론 변화 추이 차트 */}
      <div className="h-96">
        <OpinionTrendChart
          data={opinionTrendData}
        />
      </div>
    </section>
  );
}