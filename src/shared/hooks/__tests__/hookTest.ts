/**
 * 데이터 로딩 및 필터링 훅 테스트 함수
 * JSX 없이 순수 함수로 훅 기능을 테스트
 */

import { DataProcessor } from '@/shared/services/dataProcessor';
import { DashboardFilters } from '@/shared/types/dashboard';
import { isWithinPeriod, getStartDateForPeriod, formatDateToYMD } from '@/shared/utils/dateFilters';

/**
 * 날짜 필터링 유틸리티 함수 테스트
 */
export function testDateFilters(): string[] {
  const results: string[] = [];
  
  try {
    // 기간 계산 테스트
    const sevenDaysAgo = getStartDateForPeriod('7d');
    const now = new Date();
    const daysDiff = Math.ceil((now.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 7) {
      results.push('✓ 7일 기간 계산 성공');
    } else {
      results.push(`✗ 7일 기간 계산 실패: ${daysDiff}일`);
    }
    
    // 날짜 범위 확인 테스트
    const todayStr = new Date().toISOString();
    const weekAgoStr = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    
    if (isWithinPeriod(todayStr, '7d')) {
      results.push('✓ 오늘 날짜 7일 범위 내 확인 성공');
    } else {
      results.push('✗ 오늘 날짜 7일 범위 내 확인 실패');
    }
    
    if (!isWithinPeriod(weekAgoStr, '7d')) {
      results.push('✓ 8일 전 날짜 7일 범위 외 확인 성공');
    } else {
      results.push('✗ 8일 전 날짜 7일 범위 외 확인 실패');
    }
    
    // 날짜 포맷 테스트
    const formattedDate = formatDateToYMD(todayStr);
    const expectedFormat = /^\d{4}-\d{2}-\d{2}$/.test(formattedDate);
    
    if (expectedFormat) {
      results.push('✓ 날짜 포맷 변환 성공');
    } else {
      results.push(`✗ 날짜 포맷 변환 실패: ${formattedDate}`);
    }
    
  } catch (error) {
    results.push(`✗ 날짜 필터 테스트 중 오류: ${error}`);
  }
  
  return results;
}

/**
 * 데이터 로딩 테스트 (모의 데이터 사용)
 */
export async function testDataLoading(): Promise<string[]> {
  const results: string[] = [];
  
  try {
    // 모의 뉴스 데이터
    const mockNewsData = {
      privacy: {
        news: {
          monthly_timeline: {
            "2025-01": {
              중분류목록: {
                "개인정보보호": {
                  count: 2,
                  소분류목록: {
                    "개인정보 유출 사건": {
                      count: 1,
                      관련법: "개인정보보호법 제2조",
                      articles: [{
                        title: "테스트 뉴스",
                        content: "테스트 내용",
                        url: "https://test.com"
                      }]
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    // 모의 소셜 데이터
    const mockSocialData = {
      privacy: {
        social: {
          monthly_timeline: {
            "2025-01": {
              중분류목록: {
                "개인정보보호": {
                  count: 3,
                  소분류목록: {
                    "개인정보 유출 사건": {
                      count: 3,
                      관련법: "개인정보보호법 제2조",
                      찬성: {
                        개정강화: {
                          소셜목록: [{
                            content: "개정이 필요합니다",
                            channel: "naver",
                            date: "20250130120000"
                          }]
                        }
                      },
                      반대: {
                        소셜목록: [{
                          content: "반대합니다",
                          channel: "youtube", 
                          date: "20250130130000"
                        }]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    // DataProcessor 테스트
    const processedData = DataProcessor.processRawData(mockNewsData, mockSocialData);
    
    if (processedData.incidents.length > 0) {
      results.push('✓ 사건 데이터 추출 성공');
      results.push(`  - 사건 수: ${processedData.incidents.length}`);
    } else {
      results.push('✗ 사건 데이터 추출 실패');
    }
    
    if (processedData.legalArticles.length > 0) {
      results.push('✓ 법조항 데이터 추출 성공');
      results.push(`  - 법조항 수: ${processedData.legalArticles.length}`);
    } else {
      results.push('✗ 법조항 데이터 추출 실패');
    }
    
    if (processedData.comments.length > 0) {
      results.push('✓ 댓글 데이터 추출 성공');
      results.push(`  - 댓글 수: ${processedData.comments.length}`);
    } else {
      results.push('✗ 댓글 데이터 추출 실패');
    }
    
    // KPI 메트릭 계산 테스트
    const kpiMetrics = DataProcessor.calculateKPIMetrics(processedData);
    
    if (kpiMetrics.totalComments === processedData.comments.length) {
      results.push('✓ KPI 메트릭 계산 성공');
    } else {
      results.push('✗ KPI 메트릭 계산 실패');
    }
    
    // TOP 법조항 계산 테스트
    const topLegalArticles = DataProcessor.calculateTopLegalArticles(processedData);
    
    if (topLegalArticles.length > 0) {
      results.push('✓ TOP 법조항 계산 성공');
      results.push(`  - TOP 1: ${topLegalArticles[0].article}`);
    } else {
      results.push('✗ TOP 법조항 계산 실패');
    }
    
  } catch (error) {
    results.push(`✗ 데이터 처리 테스트 중 오류: ${error}`);
  }
  
  return results;
}

/**
 * 필터링 기능 테스트
 */
export function testFiltering(): string[] {
  const results: string[] = [];
  
  try {
    // 모의 데이터 생성
    const mockData = {
      incidents: [
        {
          id: 'incident_1',
          name: '테스트 사건 1',
          category: '개인정보보호',
          relatedLaw: '개인정보보호법 제2조',
          commentCount: 10,
          newsCount: 2,
          createdAt: new Date().toISOString() // 오늘
        },
        {
          id: 'incident_2', 
          name: '테스트 사건 2',
          category: '개인정보보호',
          relatedLaw: '개인정보보호법 제3조',
          commentCount: 5,
          newsCount: 1,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10일 전
        }
      ],
      legalArticles: [
        {
          id: 'legal_1',
          name: '개인정보보호법',
          article: '제2조',
          category: '개인정보보호',
          fullName: '개인정보보호법 제2조'
        }
      ],
      comments: [
        {
          id: 'comment_1',
          content: '테스트 댓글 1',
          source: 'naver' as const,
          stance: 'reform' as const,
          incidentId: 'incident_1',
          legalArticleId: 'legal_1',
          createdAt: new Date().toISOString(), // 오늘
          likes: 5
        },
        {
          id: 'comment_2',
          content: '테스트 댓글 2',
          source: 'youtube' as const,
          stance: 'oppose' as const,
          incidentId: 'incident_2',
          legalArticleId: 'legal_1',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 전
          likes: 3
        }
      ],
      news: [],
      mappings: {
        incidentToLegal: { 'incident_1': 'legal_1' },
        commentToIncident: { 'comment_1': 'incident_1' },
        newsToIncident: {}
      }
    };
    
    // 7일 필터 테스트
    const sevenDayFilter: DashboardFilters = {
      period: '7d',
      category: [],
      source: []
    };
    
    const filteredData = DataProcessor.applyFilters(mockData, sevenDayFilter);
    
    // 7일 내 데이터만 남아있어야 함
    if (filteredData.comments.length === 1) {
      results.push('✓ 7일 기간 필터링 성공');
    } else {
      results.push(`✗ 7일 기간 필터링 실패: ${filteredData.comments.length}개 댓글`);
    }
    
    // 카테고리 필터 테스트
    const categoryFilter: DashboardFilters = {
      period: 'all',
      category: ['개인정보보호'],
      source: []
    };
    
    const categoryFilteredData = DataProcessor.applyFilters(mockData, categoryFilter);
    
    if (categoryFilteredData.comments.length === 2) {
      results.push('✓ 카테고리 필터링 성공');
    } else {
      results.push(`✗ 카테고리 필터링 실패: ${categoryFilteredData.comments.length}개 댓글`);
    }
    
    // 출처 필터 테스트
    const sourceFilter: DashboardFilters = {
      period: 'all',
      category: [],
      source: ['naver']
    };
    
    const sourceFilteredData = DataProcessor.applyFilters(mockData, sourceFilter);
    
    if (sourceFilteredData.comments.length === 1) {
      results.push('✓ 출처 필터링 성공');
    } else {
      results.push(`✗ 출처 필터링 실패: ${sourceFilteredData.comments.length}개 댓글`);
    }
    
  } catch (error) {
    results.push(`✗ 필터링 테스트 중 오류: ${error}`);
  }
  
  return results;
}

/**
 * 전체 테스트 실행
 */
export async function runAllTests(): Promise<string[]> {
  const allResults: string[] = [];
  
  allResults.push('=== 날짜 필터링 유틸리티 테스트 ===');
  allResults.push(...testDateFilters());
  
  allResults.push('');
  allResults.push('=== 데이터 로딩 테스트 ===');
  allResults.push(...await testDataLoading());
  
  allResults.push('');
  allResults.push('=== 필터링 기능 테스트 ===');
  allResults.push(...testFiltering());
  
  return allResults;
}

/**
 * 콘솔에 테스트 결과 출력
 */
export async function logTestResults(): Promise<void> {
  const results = await runAllTests();
  
  console.log('\n=== 데이터 로딩 및 필터링 훅 테스트 결과 ===');
  results.forEach(result => console.log(result));
  
  const successCount = results.filter(r => r.startsWith('✓')).length;
  const failCount = results.filter(r => r.startsWith('✗')).length;
  
  console.log(`\n총 ${successCount + failCount}개 테스트 중 ${successCount}개 성공, ${failCount}개 실패`);
}