'use client';

import OpinionTrendChart from '@/app/dashboard/components/charts/OpinionTrendChart';
import { OpinionTrendData } from '@/shared/types/dashboard';

// Mock data for testing
const mockData: OpinionTrendData[] = [
  {
    week: '1주차',
    stanceDistribution: { reform: 40, abolish: 35, oppose: 25 },
    totalComments: 1000
  },
  {
    week: '2주차',
    stanceDistribution: { reform: 45, abolish: 30, oppose: 25 },
    totalComments: 1200
  },
  {
    week: '3주차',
    stanceDistribution: { reform: 50, abolish: 28, oppose: 22 },
    totalComments: 1100
  },
  {
    week: '4주차',
    stanceDistribution: { reform: 48, abolish: 32, oppose: 20 },
    totalComments: 1300
  }
];

export default function TestOpinionChartPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Opinion Trend Chart Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Normal state */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-4">Normal State</h2>
            <OpinionTrendChart data={mockData} />
          </div>
          
          {/* Loading state */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-4">Loading State</h2>
            <OpinionTrendChart data={[]} loading={true} />
          </div>
          
          {/* Error state */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-4">Error State</h2>
            <OpinionTrendChart data={[]} error="Failed to load data" />
          </div>
          
          {/* Empty state */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-4">Empty State</h2>
            <OpinionTrendChart data={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}