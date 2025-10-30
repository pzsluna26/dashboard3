'use client';

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { OpinionTrendData } from '@/shared/types/dashboard';

interface OpinionTrendChartProps {
  data: OpinionTrendData[];
  loading?: boolean;
  error?: string | null;
}

// 입장별 색상 정의 (요구사항 10.4에 따라)
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

export default function OpinionTrendChart({ 
  data, 
  loading = false, 
  error = null 
}: OpinionTrendChartProps) {
  // 차트 데이터 변환 (적층 영역 차트용)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      week: item.week,
      reform: item.stanceDistribution.reform / 100, // 0-1 범위로 변환
      abolish: item.stanceDistribution.abolish / 100,
      oppose: item.stanceDistribution.oppose / 100,
      totalComments: item.totalComments,
      // 원본 퍼센트 값도 보관 (툴팁용)
      reformPercent: item.stanceDistribution.reform,
      abolishPercent: item.stanceDistribution.abolish,
      opposePercent: item.stanceDistribution.oppose
    }));
  }, [data]);

  // 변화량 계산 (첫 주 대비 마지막 주)
  const changeAnalysis = useMemo(() => {
    if (!data || data.length < 2) return null;

    const firstWeek = data[0];
    const lastWeek = data[data.length - 1];

    const reformChange = lastWeek.stanceDistribution.reform - firstWeek.stanceDistribution.reform;
    const abolishChange = lastWeek.stanceDistribution.abolish - firstWeek.stanceDistribution.abolish;
    const opposeChange = lastWeek.stanceDistribution.oppose - firstWeek.stanceDistribution.oppose;

    return {
      reform: reformChange,
      abolish: abolishChange,
      oppose: opposeChange
    };
  }, [data]);

  // 커스텀 툴팁 컴포넌트 (요구사항 10.2)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const weekData = data.find(d => d.week === label);
      if (!weekData) return null;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: STANCE_COLORS.reform }}
                />
                <span className="text-sm text-gray-600">{STANCE_LABELS.reform}</span>
              </div>
              <span className="text-sm font-medium">{weekData.stanceDistribution.reform}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: STANCE_COLORS.abolish }}
                />
                <span className="text-sm text-gray-600">{STANCE_LABELS.abolish}</span>
              </div>
              <span className="text-sm font-medium">{weekData.stanceDistribution.abolish}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: STANCE_COLORS.oppose }}
                />
                <span className="text-sm text-gray-600">{STANCE_LABELS.oppose}</span>
              </div>
              <span className="text-sm font-medium">{weekData.stanceDistribution.oppose}%</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                총 댓글 수: {weekData.totalComments.toLocaleString()}개
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 변화량 표시 컴포넌트 (요구사항 10.3)
  const ChangeIndicator = ({ stance, change }: { stance: keyof typeof STANCE_COLORS, change: number }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <div className="flex items-center space-x-1">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: STANCE_COLORS[stance] }}
        />
        <span className="text-xs font-medium">{STANCE_LABELS[stance]}</span>
        {isPositive && (
          <span className="text-green-600 text-xs flex items-center">
            ↑ +{change}%
          </span>
        )}
        {isNegative && (
          <span className="text-red-600 text-xs flex items-center">
            ↓ {change}%
          </span>
        )}
        {change === 0 && (
          <span className="text-gray-500 text-xs">
            → 0%
          </span>
        )}
      </div>
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">여론 변화 추이 (4주간)</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs">추이 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">여론 변화 추이 (4주간)</h3>
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
  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">여론 변화 추이 (4주간)</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-xs">표시할 추이 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-base font-semibold text-black">여론 변화 추이 (4주간)</h3>
        <div className="text-xs text-gray-500">
          적층 영역 차트 (비율 기준)
        </div>
      </div>
      
      {/* 반응형 차트 컨테이너 */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 20,
            }}
            stackOffset="expand" // 100% 적층 차트
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              iconType="rect"
            />
            
            {/* 적층 영역들 (요구사항 10.1) */}
            <Area
              type="monotone"
              dataKey="reform"
              stackId="1"
              stroke={STANCE_COLORS.reform}
              fill={STANCE_COLORS.reform}
              fillOpacity={0.8}
              name={STANCE_LABELS.reform}
            />
            <Area
              type="monotone"
              dataKey="abolish"
              stackId="1"
              stroke={STANCE_COLORS.abolish}
              fill={STANCE_COLORS.abolish}
              fillOpacity={0.8}
              name={STANCE_LABELS.abolish}
            />
            <Area
              type="monotone"
              dataKey="oppose"
              stackId="1"
              stroke={STANCE_COLORS.oppose}
              fill={STANCE_COLORS.oppose}
              fillOpacity={0.8}
              name={STANCE_LABELS.oppose}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 변화량 요약 (요구사항 10.3) */}
      {changeAnalysis && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
          <div className="text-xs text-gray-600 mb-1">4주간 변화량:</div>
          <div className="grid grid-cols-3 gap-2">
            <ChangeIndicator stance="reform" change={changeAnalysis.reform} />
            <ChangeIndicator stance="abolish" change={changeAnalysis.abolish} />
            <ChangeIndicator stance="oppose" change={changeAnalysis.oppose} />
          </div>
        </div>
      )}
    </div>
  );
}