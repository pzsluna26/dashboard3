'use client';

import { DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import HotNewsComponent from '../news/HotNewsComponent';
import DataCollectionStatusComponent from '../status/DataCollectionStatusComponent';
import RisingIssuesComponent from '../rising/RisingIssuesComponent';

interface DetailInfoSectionProps {
  filters: DashboardFilters;
  data: ProcessedData | null;
}

export default function DetailInfoSection({ filters, data }: DetailInfoSectionProps) {
  return (
    <section className="space-y-6">
      {/* 최근 핫이슈 뉴스 */}
      <HotNewsComponent filters={filters} data={data} />

      {/* 데이터 수집 현황 */}
      <DataCollectionStatusComponent data={data} />

      {/* 급상승 사건 */}
      <RisingIssuesComponent filters={filters} data={data} />
    </section>
  );
}