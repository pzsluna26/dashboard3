/**
 * 날짜 필터링 유틸리티 함수들
 * 요구사항 11.1, 11.2, 11.3, 11.4 지원
 */

/**
 * 주어진 날짜가 특정 기간 내에 있는지 확인
 */
export function isWithinPeriod(dateString: string, period: '7d' | '14d' | '30d' | 'all'): boolean {
  if (period === 'all') return true;
  
  const date = new Date(dateString);
  const now = new Date();
  const startDate = getStartDateForPeriod(period);
  
  return date >= startDate && date <= now;
}

/**
 * 기간에 따른 시작 날짜 계산
 */
export function getStartDateForPeriod(period: '7d' | '14d' | '30d' | 'all'): Date {
  const now = new Date();
  
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '14d':
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0); // 1970년 1월 1일
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDateToYMD(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * 날짜를 한국어 형식으로 포맷
 */
export function formatDateToKorean(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 상대적 시간 표시 (예: "2시간 전", "3일 전")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMinutes < 1) {
    return '방금 전';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}주 전`;
  } else if (diffMonths < 12) {
    return `${diffMonths}개월 전`;
  } else {
    return formatDateToKorean(dateString);
  }
}

/**
 * 날짜 범위 검증
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
}

/**
 * 주간 날짜 범위 생성
 */
export function getWeeklyDateRanges(weeksCount: number = 4): Array<{ start: Date; end: Date; label: string }> {
  const ranges: Array<{ start: Date; end: Date; label: string }> = [];
  const now = new Date();
  
  for (let i = 0; i < weeksCount; i++) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    ranges.push({
      start: weekStart,
      end: weekEnd,
      label: `${weeksCount - i}주차`
    });
  }
  
  return ranges.reverse();
}

/**
 * 일별 날짜 배열 생성
 */
export function getDailyDateRange(period: '7d' | '14d' | '30d' | 'all'): string[] {
  const dates: string[] = [];
  const startDate = getStartDateForPeriod(period);
  const endDate = new Date();
  
  if (period === 'all') {
    // 'all'인 경우 최근 30일로 제한
    const limitedStartDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const currentDate = new Date(limitedStartDate);
    
    while (currentDate <= endDate) {
      dates.push(formatDateToYMD(currentDate.toISOString()));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(formatDateToYMD(currentDate.toISOString()));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return dates;
}

/**
 * 월별 날짜 범위 생성
 */
export function getMonthlyDateRanges(monthsCount: number = 6): Array<{ start: Date; end: Date; label: string }> {
  const ranges: Array<{ start: Date; end: Date; label: string }> = [];
  const now = new Date();
  
  for (let i = 0; i < monthsCount; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    ranges.push({
      start: monthStart,
      end: monthEnd,
      label: `${monthStart.getFullYear()}년 ${monthStart.getMonth() + 1}월`
    });
  }
  
  return ranges.reverse();
}

/**
 * 시간대별 그룹핑을 위한 시간 키 생성
 */
export function getTimeKey(dateString: string, groupBy: 'hour' | 'day' | 'week' | 'month'): string {
  const date = new Date(dateString);
  
  switch (groupBy) {
    case 'hour':
      return `${formatDateToYMD(dateString)} ${date.getHours().toString().padStart(2, '0')}:00`;
    case 'day':
      return formatDateToYMD(dateString);
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return formatDateToYMD(weekStart.toISOString());
    case 'month':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    default:
      return formatDateToYMD(dateString);
  }
}

/**
 * 날짜 문자열 파싱 및 검증
 */
export function parseAndValidateDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // 미래 날짜는 현재 시간으로 제한
    const now = new Date();
    if (date > now) {
      return now;
    }
    
    return date;
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return null;
  }
}

/**
 * 기간별 라벨 생성
 */
export function getPeriodLabel(period: '7d' | '14d' | '30d' | 'all'): string {
  const labels = {
    '7d': '최근 7일',
    '14d': '최근 14일',
    '30d': '최근 30일',
    'all': '전체 기간'
  };
  
  return labels[period];
}

/**
 * 날짜 범위 요약 텍스트 생성
 */
export function getDateRangeSummary(period: '7d' | '14d' | '30d' | 'all'): string {
  if (period === 'all') {
    return '전체 기간';
  }
  
  const startDate = getStartDateForPeriod(period);
  const endDate = new Date();
  
  return `${formatDateToKorean(startDate.toISOString())} ~ ${formatDateToKorean(endDate.toISOString())}`;
}