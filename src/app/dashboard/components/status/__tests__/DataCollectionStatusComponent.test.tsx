import { render, screen, fireEvent } from '@testing-library/react';
import DataCollectionStatusComponent from '../DataCollectionStatusComponent';
import { ProcessedData } from '@/shared/types/dashboard';

// Mock data for testing
const mockData: ProcessedData = {
  incidents: [
    { id: '1', name: 'Test Incident', category: 'test', relatedLaw: 'test-law', commentCount: 10, newsCount: 5, createdAt: '2024-01-01' }
  ],
  legalArticles: [
    { id: '1', name: 'Test Law', article: '제1조', category: 'test', fullName: 'Test Law 제1조' }
  ],
  comments: [
    { id: '1', content: 'Test comment', source: 'naver', stance: 'reform', incidentId: '1', legalArticleId: '1', createdAt: new Date().toISOString() },
    { id: '2', content: 'Test comment 2', source: 'youtube', stance: 'abolish', incidentId: '1', legalArticleId: '1', createdAt: '2024-01-01' }
  ],
  news: [
    { id: '1', title: 'Test News', content: 'Test content', url: 'http://test.com', publisher: 'Test Publisher', publishedAt: new Date().toISOString(), incidentId: '1', legalArticleId: '1' }
  ],
  mappings: {
    incidentToLegal: { '1': '1' },
    commentToIncident: { '1': '1', '2': '1' },
    newsToIncident: { '1': '1' }
  }
};

describe('DataCollectionStatusComponent', () => {
  it('renders loading state when data is null', () => {
    render(<DataCollectionStatusComponent data={null} />);
    expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
  });

  it('displays data collection statistics correctly', () => {
    render(<DataCollectionStatusComponent data={mockData} />);
    
    expect(screen.getByText('데이터 수집 현황')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total news
    expect(screen.getByText('2')).toBeInTheDocument(); // Total comments
    expect(screen.getByText('100%')).toBeInTheDocument(); // Mapping success rate
  });

  it('shows source distribution correctly', () => {
    render(<DataCollectionStatusComponent data={mockData} />);
    
    expect(screen.getByText('출처별 댓글 분포')).toBeInTheDocument();
    expect(screen.getByText('naver')).toBeInTheDocument();
    expect(screen.getByText('youtube')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(<DataCollectionStatusComponent data={mockData} />);
    
    const refreshButton = screen.getByText('새로고침');
    fireEvent.click(refreshButton);
    
    expect(refreshButton).toBeDisabled();
  });
});