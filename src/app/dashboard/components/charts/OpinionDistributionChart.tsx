'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StanceDistribution } from '@/shared/types/dashboard';

interface OpinionDistributionChartProps {
  data: (StanceDistribution & { totalComments: number }) | null;
  loading?: boolean;
  error?: string | null;
}

// 입장별 색상 정의 (요구사항 4.3에 따라)
const STANCE_COLORS = {
  reform: '#EF4444',    // 개정강화 - 빨간색
  abolish: '#3B82F6',   // 폐지완화 - 파란색
  oppose: '#6B7280'     // 반대 - 회색
} as const;

// 입장별 라벨 정의
const STANCE_LABELS = {
  reform: '개정강화',
  abolish: '폐지완화',
  oppose: '반대'
} as const;

export default function OpinionDistributionChart({ 
  data, 
  loading = false, 
  error = null 
}: OpinionDistributionChartProps) {
  // 디버깅용 로그
  console.log('OpinionDistributionChart render:', { data, loading, error });

  // 차트 데이터 변환
  const chartData = useMemo(() => {
    console.log('Chart data processing:', data); // 디버깅용
    
    if (!data || data.totalComments === 0) {
      console.log('No data or zero comments'); // 디버깅용
      return [];
    }

    const result = [
      {
        name: STANCE_LABELS.reform,
        value: data.reform,
        percentage: ((data.reform / data.totalComments) * 100).toFixed(1),
        color: STANCE_COLORS.reform
      },
      {
        name: STANCE_LABELS.abolish,
        value: data.abolish,
        percentage: ((data.abolish / data.totalComments) * 100).toFixed(1),
        color: STANCE_COLORS.abolish
      },
      {
        name: STANCE_LABELS.oppose,
        value: data.oppose,
        percentage: ((data.oppose / data.totalComments) * 100).toFixed(1),
        color: STANCE_COLORS.oppose
      }
    ];
    
    console.log('Generated chart data:', result); // 디버깅용
    return result;
  }, [data]);

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            댓글 수: <span className="font-medium">{data.value.toLocaleString()}개</span>
          </p>
          <p className="text-sm text-gray-600">
            비율: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">전체 여론 성향 분포</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs">분포 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">전체 여론 성향 분포</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!data || data.totalComments === 0 || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">전체 여론 성향 분포</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-xs">표시할 데이터가 없습니다</p>
          {/* 디버깅 정보 */}
          <div className="mt-2 text-xs text-gray-400">
            <div>Data: {data ? 'exists' : 'null'}</div>
            {data && (
              <div>
                Total: {data.totalComments}, 
                Reform: {data.reform}, 
                Abolish: {data.abolish}, 
                Oppose: {data.oppose}
              </div>
            )}
            <div>Chart Data Length: {chartData.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-base font-semibold text-black">전체 여론 성향 분포</h3>
        <div className="text-xs text-black">
          총 {data.totalComments.toLocaleString()}개 댓글
        </div>
      </div>
      
      {/* 반응형 차트 컨테이너 */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 통계 요약 */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-xs">
          {chartData.map((item) => (
            <div key={item.name} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="font-medium text-black">{item.name}</div>
              <div className="text-black">{item.percentage}%</div>
              <div className="text-black">{item.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}