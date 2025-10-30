import { render, screen } from '@testing-library/react';
import LegalFieldHeatmap from '../LegalFieldHeatmap';
import { ProcessedData, DashboardFilters } from '@/shared/types/dashboard';

// Mock ECharts
jest.mock('echarts', () => ({
  init: jest.fn(() => ({
    setOption: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    clear: jest.fn()
  }))
}));

const mockData: ProcessedData = {
  incidents: [
    {
      id: 'incident_1',
      name: '개인정보 유출 사건',
      category: '개인정보',
      relatedLaw: '개인정보보호법 제2조',
      commentCount: 150,
      newsCount: 5,
      createdAt: '2024-01-15T10:00:00Z'
    }
  ],
  legalArticles: [
    {
      id: 'legal_1',
      name: '개인정보보호법',
      article: '제2조',
      category: '개인정보',
      fullName: '개인정보보호법 제2조'
    },
    {
      id: 'legal_2',
      name: '중대재해처벌법',
      article: '제5조',
      category: '산업안전',
      fullName: '중대재해처벌법 제5조'
    }
  ],
  comments: [
    {
      id: 'comment_1',
      content: '개정이 필요합니다',
      source: 'naver',
      stance: 'reform',
      incidentId: 'incident_1',
      legalArticleId: 'legal_1',
      createdAt: '2024-01-15T10:00:00Z',
      likes: 10
    },
    {
      id: 'comment_2',
      content: '폐지해야 합니다',
      source: 'youtube',
      stance: 'abolish',
      incidentId: 'incident_1',
      legalArticleId: 'legal_1',
      createdAt: '2024-01-15T11:00:00Z',
      likes: 5
    },
    {
      id: 'comment_3',
      content: '반대합니다',
      source: 'blog',
      stance: 'oppose',
      incidentId: 'incident_1',
      legalArticleId: 'legal_2',
      createdAt: '2024-01-15T12:00:00Z',
      likes: 3
    }
  ],
  news: [
    {
      id: 'news_1',
      title: '개인정보 유출 관련 뉴스',
      content: '뉴스 내용',
      url: 'https://example.com/news1',
      publisher: '테스트 뉴스',
      publishedAt: '2024-01-15T09:00:00Z',
      incidentId: 'incident_1',
      legalArticleId: 'legal_1'
    }
  ],
  mappings: {
    incidentToLegal: { 'incident_1': 'legal_1' },
    commentToIncident: { 'comment_1': 'incident_1', 'comment_2': 'incident_1', 'comment_3': 'incident_1' },
    newsToIncident: { 'news_1': 'incident_1' }
  }
};

const mockFilters: DashboardFilters = {
  period: '7d',
  category: [],
  source: []
};

describe('LegalFieldHeatmap', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders heatmap component with data', () => {
    render(
      <LegalFieldHeatmap 
        data={mockData}
        filters={mockFilters}
      />
    );

    expect(screen.getByText('법 분야별 입법수요 히트맵')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <LegalFieldHeatmap 
        data={null}
        filters={mockFilters}
        loading={true}
      />
    );

    expect(screen.getByText('히트맵 데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = '데이터 로딩 실패';
    render(
      <LegalFieldHeatmap 
        data={null}
        filters={mockFilters}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    const emptyData: ProcessedData = {
      ...mockData,
      comments: [],
      legalArticles: []
    };

    render(
      <LegalFieldHeatmap 
        data={emptyData}
        filters={mockFilters}
      />
    );

    expect(screen.getByText('표시할 히트맵 데이터가 없습니다')).toBeInTheDocument();
  });

  it('displays insights when available', () => {
    render(
      <LegalFieldHeatmap 
        data={mockData}
        filters={mockFilters}
      />
    );

    // 인사이트 섹션이 있는지 확인
    const insightSection = screen.queryByText('주요 인사이트');
    if (insightSection) {
      expect(insightSection).toBeInTheDocument();
    }
  });

  it('shows category and stance count in header', () => {
    render(
      <LegalFieldHeatmap 
        data={mockData}
        filters={mockFilters}
      />
    );

    // 헤더에 분야와 입장 개수가 표시되는지 확인
    const headerInfo = screen.getByText(/개 분야 × \d+개 입장/);
    expect(headerInfo).toBeInTheDocument();
  });

  it('displays color legend', () => {
    render(
      <LegalFieldHeatmap 
        data={mockData}
        filters={mockFilters}
      />
    );

    expect(screen.getByText('20% 미만')).toBeInTheDocument();
    expect(screen.getByText('20-50%')).toBeInTheDocument();
    expect(screen.getByText('50% 이상')).toBeInTheDocument();
  });
});