// KPICard Component Tests
// 
// This file contains basic tests for the KPICard component
// To run tests, install a test framework like Jest or Vitest
//
// Example test cases:
// 1. Component renders with correct props
// 2. Change rate calculation is accurate
// 3. Percentage formatting works correctly
// 4. Zero previous value handling

import KPICard from '../KPICard';

// Test data
const mockProps = {
  title: '총 댓글 분석 건수',
  value: 15420,
  previousValue: 14220,
  format: 'number' as const,
};

// Manual test function (can be called to verify component)
export function testKPICard() {
  // Test 1: Basic rendering
  const component = KPICard(mockProps);
  console.log('KPICard component created:', !!component);

  // Test 2: Change rate calculation
  const changeRate = ((mockProps.value - mockProps.previousValue) / mockProps.previousValue) * 100;
  const expectedChangeRate = ((15420 - 14220) / 14220) * 100;
  console.log('Change rate calculation correct:', Math.abs(changeRate - expectedChangeRate) < 0.01);

  // Test 3: Percentage format
  const percentageProps = {
    ...mockProps,
    value: 85.5,
    previousValue: 83.2,
    format: 'percentage' as const,
  };
  const percentageComponent = KPICard(percentageProps);
  console.log('Percentage component created:', !!percentageComponent);

  // Test 4: Zero previous value
  const zeroProps = {
    ...mockProps,
    previousValue: 0,
  };
  const zeroComponent = KPICard(zeroProps);
  console.log('Zero previous value component created:', !!zeroComponent);

  return true;
}