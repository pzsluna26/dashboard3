'use client';

import { useState, useEffect } from 'react';

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('ko-KR'));
    
    // 1분마다 시간 업데이트
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('ko-KR'));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-1 max-w-7xl">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">
            입법수요 분석 대시보드
          </h1>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {mounted ? currentTime : '로딩 중...'}
            </div>
            <button 
              onClick={handleRefresh}
              className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}