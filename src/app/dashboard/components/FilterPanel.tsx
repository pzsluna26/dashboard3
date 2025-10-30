'use client';

import { useCallback } from 'react';
import { DashboardFilters } from '@/shared/types/dashboard';
import { FilterPanelProps } from '@/shared/types/components';
import { defaultFilters } from '@/shared/store/dashboardAtoms';

export default function FilterPanel({ 
  filters, 
  onFiltersChange 
}: FilterPanelProps) {
  
  const updateFilters = useCallback((update: Partial<DashboardFilters>) => {
    const newFilters = { ...filters, ...update };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);
  
  const resetFilters = useCallback(() => {
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const periodOptions = [
    { value: '7d', label: '7일' },
    { value: '14d', label: '14일' },
    { value: '30d', label: '30일' },
    { value: 'all', label: '전체' },
  ] as const;

  const categoryOptions = [
    { value: '개인정보', label: '개인정보' },
    { value: '노동', label: '노동' },
    { value: '환경', label: '환경' },
    { value: '교육', label: '교육' },
    { value: '안전', label: '안전' },
    { value: '경제', label: '경제' },
  ];

  const sourceOptions = [
    { value: 'naver', label: '네이버' },
    { value: 'youtube', label: '유튜브' },
    { value: 'twitter', label: '트위터' },
    { value: 'blog', label: '블로그' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-1 sticky top-0 z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-2 text-xs">
          {/* 기간 필터 */}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 font-medium">기간:</span>
            <select
              value={filters.period}
              onChange={(e) => updateFilters({ period: e.target.value as DashboardFilters['period'] })}
              className="px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 법 분야 필터 */}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 font-medium">분야:</span>
            <div className="flex gap-1">
              {categoryOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(option.value)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.category, option.value]
                        : filters.category.filter(c => c !== option.value);
                      updateFilters({ category: newCategories });
                    }}
                    className="sr-only"
                  />
                  <span className={`px-1 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                    filters.category.includes(option.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 출처 필터 */}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 font-medium">출처:</span>
            <div className="flex gap-1">
              {sourceOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.source.includes(option.value)}
                    onChange={(e) => {
                      const newSources = e.target.checked
                        ? [...filters.source, option.value]
                        : filters.source.filter(s => s !== option.value);
                      updateFilters({ source: newSources });
                    }}
                    className="sr-only"
                  />
                  <span className={`px-1 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                    filters.source.includes(option.value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={resetFilters}
            className="ml-auto px-1 py-0.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}