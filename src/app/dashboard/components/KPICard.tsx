'use client';

import { useState } from 'react';
import { KPICardProps } from '@/shared/types/components';

export default function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  loading = false
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // Calculate change rate
  const changeRate = previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  const isPositive = changeRate > 0;
  const isNeutral = changeRate === 0;

  // Format display value
  const formatValue = (val: number) => {
    if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  // Get change rate color class
  const getChangeRateColor = () => {
    if (isNeutral) return 'text-gray-500';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  // Get change rate arrow
  const getChangeRateArrow = () => {
    if (isNeutral) return '→';
    return isPositive ? '↑' : '↓';
  };

  return (
    <div 
      className="relative bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main content */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-medium">{title}</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatValue(value)}
          </p>
        </div>
        {icon && (
          <div className="text-blue-500 ml-2">
            <div className="w-4 h-4">{icon}</div>
          </div>
        )}
      </div>

      {/* Change rate indicator */}
      <div className="mt-2 flex items-center">
        <span className={`flex items-center text-xs font-medium ${getChangeRateColor()}`}>
          <span className="mr-1">{getChangeRateArrow()}</span>
          {Math.abs(changeRate).toFixed(1)}%
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">이번 주:</span>
                <span className="font-medium">{formatValue(value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">지난 주:</span>
                <span className="font-medium">{formatValue(previousValue)}</span>
              </div>
              <div className="border-t border-gray-700 pt-1 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">변화량:</span>
                  <span className={`font-medium ${getChangeRateColor().replace('text-', 'text-')}`}>
                    {isPositive ? '+' : ''}{(value - previousValue).toLocaleString()}
                    {format === 'percentage' && 'p'}
                  </span>
                </div>
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}