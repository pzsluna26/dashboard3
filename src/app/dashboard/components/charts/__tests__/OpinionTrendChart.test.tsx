import { render, screen } from '@testing-library/react';
import OpinionTrendChart from '../OpinionTrendChart';
import { OpinionTrendData } from '@/shared/types/dashboard';

// Mock Recharts components
jest.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />
}));

const mockData: OpinionTrendData[] = [
  {
    week: '1주차',
    stanceDistribution: { reform: 40, abolish: 35, oppose: 25 },
    totalComments: 1000
  },
  {
    week: '2주차',
    stanceDistribution: { reform: 45, abolish: 30, oppose: 25 },
    totalComments: 1200
  },
  {
    week: '3주차',
    stanceDistribution: { reform: 50, abolish: 28, oppose: 22 },
    totalComments: 1100
  },
  {
    week: '4주차',
    stanceDistribution: { reform: 48, abolish: 32, oppose: 20 },
    totalComments: 1300
  }
];

describe('OpinionTrendChart', () => {
  it('renders chart title', () => {
    render(<OpinionTrendChart data={mockData} />);
    expect(screen.getByText('여론 변화 추이 (4주간)')).toBeInTheDocument();
  });

  it('renders chart components when data is provided', () => {
    render(<OpinionTrendChart data={mockData} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('shows change analysis when data has multiple weeks', () => {
    render(<OpinionTrendChart data={mockData} />);
    expect(screen.getByText('4주간 변화량:')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<OpinionTrendChart data={[]} loading={true} />);
    expect(screen.getByText('추이 데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<OpinionTrendChart data={[]} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<OpinionTrendChart data={[]} />);
    expect(screen.getByText('표시할 추이 데이터가 없습니다')).toBeInTheDocument();
  });
});