# KPI Card Component

## Overview
The KPICard component displays key performance indicators with change rate visualization and detailed tooltips.

## Features

### 1. Basic Display
- Shows title and formatted value (number or percentage)
- Includes optional icon for visual identification
- Responsive design with hover effects

### 2. Change Rate Visualization
- Calculates percentage change from previous value
- Color-coded indicators:
  - Green (↑): Positive change
  - Red (↓): Negative change  
  - Gray (→): No change
- Displays change percentage with "전주비" label

### 3. Hover Tooltip
- Shows detailed comparison information:
  - Current week value (이번 주)
  - Previous week value (지난 주)
  - Absolute change amount (변화량)
- Positioned above the card with arrow pointer
- Auto-hides when mouse leaves

### 4. Loading State
- Skeleton loading animation
- Maintains layout structure during data loading

## Props Interface
```typescript
interface KPICardProps {
  title: string;           // Card title
  value: number;           // Current value
  previousValue: number;   // Previous period value for comparison
  format?: 'number' | 'percentage'; // Value formatting
  icon?: React.ReactNode;  // Optional icon
  loading?: boolean;       // Loading state
}
```

## Usage Example
```tsx
<KPICard
  title="총 댓글 분석 건수"
  value={15420}
  previousValue={14220}
  format="number"
  icon={<CommentIcon />}
/>
```

## Requirements Compliance
- ✅ 1.1: Displays KPI metrics in card format
- ✅ 1.2: Shows detailed tooltip on hover
- ✅ 1.3: Displays change rate with arrows and colors
- ✅ 1.4: Supports horizontal layout (handled by parent KPISection)