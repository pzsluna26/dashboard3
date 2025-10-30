'use client';

import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { HeatmapCellData, HeatmapInsight, DashboardFilters, ProcessedData } from '@/shared/types/dashboard';
import { useHeatmapData } from '@/shared/hooks/useHeatmapData';

interface LegalFieldHeatmapProps {
  data: ProcessedData | null;
  filters: DashboardFilters;
  loading?: boolean;
  error?: string | null;
}

export default function LegalFieldHeatmap({ 
  data, 
  filters, 
  loading = false, 
  error = null 
}: LegalFieldHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);

  // 히트맵 데이터 처리
  const { 
    heatmapData, 
    insights, 
    categories, 
    stances,
    loading: dataLoading,
    error: dataError
  } = useHeatmapData(data, filters);

  // ECharts 초기화 및 업데이트
  useEffect(() => {
    if (!chartRef.current || loading || dataLoading || error || dataError) return;

    // 차트 인스턴스 생성
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // 히트맵 데이터가 없는 경우
    if (heatmapData.length === 0 || categories.length === 0) {
      chart.clear();
      return;
    }

    // ECharts 데이터 형식으로 변환
    const chartData = heatmapData.map((cell, index) => {
      const categoryIndex = categories.indexOf(cell.category);
      const stanceIndex = stances.findIndex(s => s.key === cell.stance);
      
      return [
        stanceIndex,     // x축 (입장)
        categoryIndex,   // y축 (법 분야)
        cell.value,      // 값 (댓글 수)
        cell.percentage, // 비율
        cell.color,      // 색상
        index           // 인덱스 (클릭 이벤트용)
      ];
    });

    // 최대값 계산 (색상 스케일용)
    const maxValue = Math.max(...heatmapData.map(cell => cell.value));
    const maxPercentage = Math.max(...heatmapData.map(cell => cell.percentage));

    // ECharts 옵션 설정
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          const categoryName = categories[data[1]];
          const stanceName = stances[data[0]].label;
          const value = data[2];
          const percentage = data[3];
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${categoryName}</div>
              <div style="margin-bottom: 2px;">입장: ${stanceName}</div>
              <div style="margin-bottom: 2px;">댓글 수: ${value.toLocaleString()}개</div>
              <div>비율: ${percentage.toFixed(1)}%</div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 12
        }
      },
      grid: {
        left: 80,
        right: 20,
        top: 40,
        bottom: 60,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: stances.map(s => s.label),
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.1)', 'rgba(200, 200, 200, 0.1)']
          }
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.1)', 'rgba(200, 200, 200, 0.1)']
          }
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          width: 70,
          overflow: 'truncate'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      visualMap: {
        min: 0,
        max: maxPercentage,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: {
          color: ['#10B981', '#F59E0B', '#DC2626'] // 초록 -> 노랑 -> 빨강
        },
        text: ['높음', '낮음'],
        textStyle: {
          fontSize: 10,
          color: '#6b7280'
        },
        formatter: '{value}%' as any
      },
      series: [{
        name: '입법수요 분포',
        type: 'heatmap',
        data: chartData,
        label: {
          show: true,
          formatter: (params: any) => {
            const percentage = params.data[3];
            return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
          },
          fontSize: 10,
          color: '#ffffff',
          fontWeight: 'bold'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 2,
          borderWidth: 1,
          borderColor: '#ffffff'
        }
      }]
    };

    // 차트 옵션 적용
    chart.setOption(option, true);

    // 클릭 이벤트 핸들러
    const handleClick = (params: any) => {
      if (params.componentType === 'series') {
        const cellIndex = params.data[5];
        const cell = heatmapData[cellIndex];
        setSelectedCell(cell);
      }
    };

    chart.on('click', handleClick);

    // 리사이즈 핸들러
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      chart.off('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [heatmapData, categories, stances, loading, dataLoading, error, dataError]);

  // 컴포넌트 언마운트 시 차트 정리
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 로딩 상태
  if (loading || dataLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">법 분야별 입법수요 히트맵</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs">히트맵 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || dataError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">법 분야별 입법수요 히트맵</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-xs">{error || dataError}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (heatmapData.length === 0 || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-base font-semibold mb-2">법 분야별 입법수요 히트맵</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-xs">표시할 히트맵 데이터가 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">다른 필터 조건을 시도해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">법 분야별 입법수요 히트맵</h3>
        <div className="text-xs text-gray-600">
          {categories.length}개 분야 × {stances.length}개 입장
        </div>
      </div>

      {/* 히트맵 차트 */}
      <div className="flex-1 min-h-0">
        <div 
          ref={chartRef} 
          className="w-full h-full min-h-[300px]"
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* 하단 인사이트 섹션 */}
      {insights.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
          <h4 className="text-sm font-medium text-gray-900 mb-2">주요 인사이트</h4>
          <div className="space-y-1">
            {insights.map((insight, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {insight.type === 'highest' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {insight.type === 'lowest' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {insight.type === 'trend' && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                </div>
                <span>{insight.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 셀 정보 (선택적) */}
      {selectedCell && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
          <div className="font-medium text-gray-900">
            {selectedCell.category} - {stances.find(s => s.key === selectedCell.stance)?.label}
          </div>
          <div className="text-gray-600 mt-1">
            댓글 수: {selectedCell.value.toLocaleString()}개 ({selectedCell.percentage.toFixed(1)}%)
          </div>
        </div>
      )}

      {/* 범례 설명 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>20% 미만</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>20-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>50% 이상</span>
          </div>
        </div>
      </div>

      {/* 접근성을 위한 스크린 리더 전용 정보 */}
      <div className="sr-only">
        <h4>히트맵 데이터 요약</h4>
        <p>법 분야 {categories.length}개, 입장 {stances.length}개의 매트릭스</p>
        <ul>
          {insights.map((insight, index) => (
            <li key={index}>{insight.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}