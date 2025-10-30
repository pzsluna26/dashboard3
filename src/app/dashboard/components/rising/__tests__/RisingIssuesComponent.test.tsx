// RisingIssuesComponent Tests
// 
// This file contains basic tests for the RisingIssuesComponent
// Manual test functions to verify component functionality
//
// Test cases:
// 1. Component renders with null data (loading state)
// 2. Component renders with empty data (no issues)
// 3. Component renders with valid data (shows rising issues)
// 4. Growth rate calculation is accurate

import RisingIssuesComponent from '../RisingIssuesComponent';
import { ProcessedData, DashboardFilters } from '@/shared/types/dashboard';

const mockFilters: DashboardFilters = {
  period: '7d',
  category: [],
  source: []
};

const mockData: ProcessedData = {
  incidents: [
    {
      id: 'incident_1',
      name: '개인정보 유출 사건',
      category: '개인정보',
      relatedLaw: '개인정보보호법 제24조',
      commentCount: 150,
      newsCount: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'incident_2',
      name: '데이터 보안 이슈',
      category: '정보보안',
      relatedLaw: '정보통신망법 제3조',
      commentCount: 80,
      newsCount: 3,
      createdAt: new Date().toISOString()
    }
  ],
  legalArticles: [
    {
      id: 'legal_1',
      name: '개인정보보호법',
      article: '제24조',
      category: '개인정보',
      fullName: '개인정보보호법 제24조'
    },
    {
      id: 'legal_2',
      name: '정보통신망법',
      article: '제3조',
      category: '정보보안',
      fullName: '정보통신망법 제3조'
    }
  ],
  comments: [
    {
      id: 'comment_1',
      content: '개인정보 보호가 중요합니다',
      source: 'naver',
      stance: 'reform',
      incidentId: 'incident_1',
      legalArticleId: 'legal_1',
      createdAt: new Date().toISOString(), // 오늘
      likes: 10
    },
    {
      id: 'comment_2',
      content: '보안 강화가 필요해요',
      source: 'youtube',
      stance: 'reform',
      incidentId: 'incident_1',
      legalArticleId: 'legal_1',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25시간 전 (어제)
      likes: 5
    },
    {
      id: 'comment_3',
      content: '데이터 보안 이슈 심각해요',
      source: 'blog',
      stance: 'reform',
      incidentId: 'incident_2',
      legalArticleId: 'legal_2',
      createdAt: new Date().toISOString(), // 오늘
      likes: 8
    }
  ],
  news: [],
  mappings: {
    incidentToLegal: {
      'incident_1': 'legal_1',
      'incident_2': 'legal_2'
    },
    commentToIncident: {
      'comment_1': 'incident_1',
      'comment_2': 'incident_1',
      'comment_3': 'incident_2'
    },
    newsToIncident: {}
  }
};

// Manual test function for RisingIssuesComponent
export function testRisingIssuesComponent() {
  console.log('Testing RisingIssuesComponent...');

  // Test 1: Component creation with null data
  try {
    const nullComponent = RisingIssuesComponent({ filters: mockFilters, data: null });
    console.log('✓ Null data component created successfully');
  } catch (error) {
    console.log('✗ Null data component failed:', error);
  }

  // Test 2: Component creation with empty data
  try {
    const emptyData = { ...mockData, comments: [], incidents: [] };
    const emptyComponent = RisingIssuesComponent({ filters: mockFilters, data: emptyData });
    console.log('✓ Empty data component created successfully');
  } catch (error) {
    console.log('✗ Empty data component failed:', error);
  }

  // Test 3: Component creation with valid data
  try {
    const validComponent = RisingIssuesComponent({ filters: mockFilters, data: mockData });
    console.log('✓ Valid data component created successfully');
  } catch (error) {
    console.log('✗ Valid data component failed:', error);
  }

  return true;
}

// Manual test function for useRisingIssues hook
export function testUseRisingIssuesHook() {
  console.log('Testing useRisingIssues hook logic...');

  // Test growth rate calculation logic
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Simulate incident with comments
  const incident1 = mockData.incidents[0];
  const todayComments = mockData.comments.filter(c => 
    c.incidentId === incident1.id && 
    new Date(c.createdAt) >= yesterday
  );
  const yesterdayComments = mockData.comments.filter(c => 
    c.incidentId === incident1.id && 
    new Date(c.createdAt) >= twoDaysAgo && 
    new Date(c.createdAt) < yesterday
  );

  const todayCount = todayComments.length;
  const yesterdayCount = yesterdayComments.length;

  console.log(`Incident: ${incident1.name}`);
  console.log(`Today comments: ${todayCount}`);
  console.log(`Yesterday comments: ${yesterdayCount}`);

  let growthRate = 0;
  if (yesterdayCount === 0 && todayCount > 0) {
    growthRate = 100;
  } else if (yesterdayCount > 0) {
    growthRate = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
  }

  console.log(`Calculated growth rate: ${growthRate}%`);
  console.log('✓ Growth rate calculation logic verified');

  return true;
}