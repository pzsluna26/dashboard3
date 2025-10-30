'use client';

import { DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import LegalFieldHeatmap from '@/app/dashboard/components/charts/LegalFieldHeatmap';

interface DeepAnalysisSectionProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function DeepAnalysisSection({ filters, data }: DeepAnalysisSectionProps) {
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
        <h3 className="text-sm font-semibold mb-1">주요 사건-법 연결망</h3>
        <div className="text-center py-2 text-gray-500 text-xs">
          네트워크 그래프가 여기에 구현됩니다.
        </div>
      </div>

      {/* 여론 변화 추이 차트 */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <h3 className="text-sm font-semibold mb-1">여론 변화 추이 (4주간)</h3>
        <div className="text-center py-2 text-gray-500 text-xs">
          여론 변화 추이 차트가 여기에 구현됩니다.
        </div>
      </div>
    </section>
  );
}