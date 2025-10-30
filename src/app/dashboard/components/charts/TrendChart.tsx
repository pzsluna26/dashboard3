'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendData, DashboardFilters } from '@/shared/types/dashboard';

interface TrendChartProps {
  data: TrendData[];
  period: '7d' | '14d' | '30d' | 'all';
  onPeriodChange: (period: '7d' | '14d' | '30d' | 'all') => void;
  filters?: DashboardFilters;
}

interface PeriodOption {
  value: '7d' | '14d' | '30d' | 'all';
  label: string;
}

const periodOptions: PeriodOption[] = [
  { value: '7d', label: '최근 7일' },
  { value: '14d', label: '최근 14일' },
  { value: '30d', label: '최근 30일' },
  { value: 'all', label: '전체 기간' }
];

export default function TrendChart({ 
  data, 
  period, 
  onPeriodChange, 
  filters 
}: TrendChartProps) {
  // 범례 클릭으로 라인 표시/숨김 상태 관리
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  // 차트 데이터 변환 - 동적 라인 생성을 위한 데이터 구조 변환
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 날짜별로 모든 법조항의 데이터를 하나의 객체로 변환
    return data.map(item => {
      const chartPoint: any = {
        date: formatDateForDisplay(item.date),
        fullDate: item.date // 정렬용 원본 날짜
      };

      // 각 법조항의 댓글 수를 chartPoint에 추가
      item.articles.forEach(article => {
        chartPoint[article.name] = article.count;
      });

      return chartPoint;
    }).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [data]);

  // 동적 라인 생성 - 데이터에서 고유한 법조항 추출
  const legalArticles = useMemo(() => {
    if (!data || data.length === 0) return [];

    const articlesMap = new Map<string, { name: string; color: string }>();
    
    data.forEach(item => {
      item.articles.forEach(article => {
        if (!articlesMap.has(article.name)) {
          articlesMap.set(article.name, {
            name: article.name,
            color: article.color
          });
        }
      });
    });

    return Array.from(articlesMap.values());
  }, [data]);

  // 범례 클릭 핸들러
  const handleLegendClick = useCallback((dataKey: string) => {
    setHiddenLines(prev => {
      const newHiddenLines = new Set(prev);
      if (newHiddenLines.has(dataKey)) {
        newHiddenLines.delete(dataKey);
      } else {
        newHiddenLines.add(dataKey);
      }
      return newHiddenLines;
    });
  }, []);

  // 기간 선택 핸들러
  const handlePeriodChange = useCallback((newPeriod: '7d' | '14d' | '30d' | 'all') => {
    onPeriodChange(newPeriod);
  }, [onPeriodChange]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload
            .filter((entry: any) => !hiddenLines.has(entry.dataKey))
            .map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}></span>
                {entry.dataKey}: {entry.value?.toLocaleString()}건
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  // 커스텀 범례
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenLines.has(entry.dataKey);
          return (
            <button
              key={index}
              onClick={() => handleLegendClick(entry.dataKey)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                isHidden 
                  ? 'opacity-50 bg-gray-100' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span 
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: isHidden ? '#d1d5db' : entry.color }}
              ></span>
              <span className={`text-xs ${isHidden ? 'text-gray-400' : 'text-gray-700'}`}>
                {entry.dataKey}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      {/* 헤더 - 제목과 기간 선택 필터 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">주간 이슈 트렌드</h3>
        
        {/* 기간 선택 필터 UI */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                period === option.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex-1 min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* 동적 라인 생성 */}
              {legalArticles.map((article) => (
                <Line
                  key={article.name}
                  type="monotone"
                  dataKey={article.name}
                  stroke={article.color}
                  strokeWidth={3}
                  dot={{ fill: article.color, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: article.color, strokeWidth: 3, fill: '#fff' }}
                  hide={hiddenLines.has(article.name)}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">트렌드 데이터가 없습니다</p>
              <p className="text-gray-400 text-xs mt-1">다른 기간을 선택해보세요</p>
            </div>
          </div>
        )}
      </div>



      {/* 하단 범례 */}
      <div className="mt-2 flex-shrink-0">
        {legalArticles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {legalArticles.map((article, index) => {
              const isHidden = hiddenLines.has(article.name);
              return (
                <button
                  key={index}
                  onClick={() => handleLegendClick(article.name)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                    isHidden 
                      ? 'opacity-50 bg-gray-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span 
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: isHidden ? '#d1d5db' : article.color }}
                  ></span>
                  <span className={`text-xs ${isHidden ? 'text-gray-400' : 'text-gray-700'}`}>
                    {article.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 접근성을 위한 스크린 리더 전용 정보 */}
      <div className="sr-only">
        <h4>트렌드 차트 데이터 요약</h4>
        <p>선택된 기간: {periodOptions.find(opt => opt.value === period)?.label}</p>
        <ul>
          {legalArticles.map((article) => (
            <li key={article.name}>
              {article.name}: {hiddenLines.has(article.name) ? '숨김' : '표시'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 날짜 포맷팅 유틸리티
function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}