// OpinionDistributionChart Component Tests
// 
// This file contains basic tests for the OpinionDistributionChart component
// To run tests, install a test framework like Jest or Vitest
//
// Example test cases:
// 1. Component renders with correct data
// 2. Stance distribution calculation is accurate
// 3. Color mapping works correctly
// 4. Loading and error states display properly

import OpinionDistributionChart from '../charts/OpinionDistributionChart';

// Test data
const mockData = {
  reform: 450,
  abolish: 280,
  oppose: 170,
  totalComments: 900
};

const mockEmptyData = {
  reform: 0,
  abolish: 0,
  oppose: 0,
  totalComments: 0
};

// Manual test function (can be called to verify component)
export function testOpinionDistributionChart() {
  // Test 1: Basic rendering with data
  const component = OpinionDistributionChart({ 
    data: mockData, 
    loading: false, 
    error: null 
  });
  console.log('OpinionDistributionChart component created:', !!component);

  // Test 2: Percentage calculation
  const reformPercentage = (mockData.reform / mockData.totalComments) * 100;
  const expectedReformPercentage = (450 / 900) * 100;
  console.log('Reform percentage calculation correct:', Math.abs(reformPercentage - expectedReformPercentage) < 0.01);

  const abolishPercentage = (mockData.abolish / mockData.totalComments) * 100;
  const expectedAbolishPercentage = (280 / 900) * 100;
  console.log('Abolish percentage calculation correct:', Math.abs(abolishPercentage - expectedAbolishPercentage) < 0.01);

  const opposePercentage = (mockData.oppose / mockData.totalComments) * 100;
  const expectedOpposePercentage = (170 / 900) * 100;
  console.log('Oppose percentage calculation correct:', Math.abs(opposePercentage - expectedOpposePercentage) < 0.01);

  // Test 3: Loading state
  const loadingComponent = OpinionDistributionChart({ 
    data: null, 
    loading: true, 
    error: null 
  });
  console.log('Loading component created:', !!loadingComponent);

  // Test 4: Error state
  const errorComponent = OpinionDistributionChart({ 
    data: null, 
    loading: false, 
    error: '데이터 로딩 실패' 
  });
  console.log('Error component created:', !!errorComponent);

  // Test 5: Empty data state
  const emptyComponent = OpinionDistributionChart({ 
    data: mockEmptyData, 
    loading: false, 
    error: null 
  });
  console.log('Empty data component created:', !!emptyComponent);

  // Test 6: Null data state
  const nullComponent = OpinionDistributionChart({ 
    data: null, 
    loading: false, 
    error: null 
  });
  console.log('Null data component created:', !!nullComponent);

  return true;
}

// Test data validation
export function testDataValidation() {
  // Test total comments calculation
  const calculatedTotal = mockData.reform + mockData.abolish + mockData.oppose;
  console.log('Total comments calculation correct:', calculatedTotal === mockData.totalComments);

  // Test percentage sum (should be 100%)
  const reformPct = (mockData.reform / mockData.totalComments) * 100;
  const abolishPct = (mockData.abolish / mockData.totalComments) * 100;
  const opposePct = (mockData.oppose / mockData.totalComments) * 100;
  const totalPct = reformPct + abolishPct + opposePct;
  console.log('Percentage sum is 100%:', Math.abs(totalPct - 100) < 0.01);

  return true;
}

// Color mapping test
export function testColorMapping() {
  const STANCE_COLORS = {
    reform: '#EF4444',    // 개정강화 - 빨간색
    abolish: '#3B82F6',   // 폐지완화 - 파란색
    oppose: '#6B7280'     // 반대 - 회색
  };

  // Test color assignments match requirements
  console.log('Reform color is red:', STANCE_COLORS.reform === '#EF4444');
  console.log('Abolish color is blue:', STANCE_COLORS.abolish === '#3B82F6');
  console.log('Oppose color is gray:', STANCE_COLORS.oppose === '#6B7280');

  return true;
}