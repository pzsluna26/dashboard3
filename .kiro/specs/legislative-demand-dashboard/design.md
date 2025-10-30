# 입법수요 분석 대시보드 설계 문서

## 개요

입법수요 분석 대시보드는 뉴스 기사와 소셜 댓글 데이터를 기반으로 입법수요를 시각화하는 React/Next.js 웹 애플리케이션입니다. 4단계 레이아웃으로 구성되어 KPI 지표부터 심층 분석까지 단계적으로 정보를 제공합니다.

## 아키텍처

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Layout                                           │
│  ├─ KPI Cards (1단)                                        │
│  ├─ Main Analytics (2단)                                   │
│  ├─ Detail Information (3단)                               │
│  └─ Deep Analysis (4단)                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├─ Data Processing Service                                 │
│  ├─ Chart Data Adapters                                    │
│  └─ Filter & Aggregation Logic                             │
├─────────────────────────────────────────────────────────────┤
│  Data Sources                                               │
│  ├─ news.json (뉴스 데이터)                                │
│  ├─ social.json (소셜 댓글 데이터)                         │
│  └─ Enhanced data.json (통합 데이터)                       │
└─────────────────────────────────────────────────────────────┘
```

### 기술 스택

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: Tailwind CSS 4 + Headless UI
- **Chart Libraries**: 
  - Recharts (기본 차트)
  - D3.js (네트워크 그래프)
  - ECharts (히트맵)
- **State Management**: Jotai (전역 필터 상태)
- **Data Fetching**: Native fetch API
- **TypeScript**: 완전한 타입 안전성

## 컴포넌트 및 인터페이스

### 1. 레이아웃 구조

```typescript
// src/app/dashboard/layout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// 4단계 레이아웃
const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="container mx-auto px-4 py-6 space-y-8">
      <KPISection />        {/* 1단 */}
      <MainAnalytics />     {/* 2단 */}
      <DetailInfo />        {/* 3단 */}
      <DeepAnalysis />      {/* 4단 */}
    </main>
  </div>
);
```

### 2. 핵심 컴포넌트

#### KPI Cards (1단)
```typescript
interface KPICardProps {
  title: string;
  value: number;
  previousValue: number;
  format?: 'number' | 'percentage';
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, previousValue, format, icon
}) => {
  const changeRate = ((value - previousValue) / previousValue) * 100;
  const isPositive = changeRate > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === 'percentage' ? `${value}%` : value.toLocaleString()}
          </p>
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      <div className="mt-4 flex items-center">
        <span className={`flex items-center text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(changeRate).toFixed(1)}% 전주비
        </span>
      </div>
    </div>
  );
};
```

#### 입법수요 TOP 5 랭킹 (2단 좌측)
```typescript
interface LegalArticleRankingProps {
  data: LegalArticleRank[];
}

interface LegalArticleRank {
  id: string;
  article: string;
  commentCount: number;
  newsCount: number;
  incidentCount: number;
  majorIncidents: Array<{
    name: string;
    commentCount: number;
  }>;
  stanceDistribution: {
    reform: number;
    abolish: number;
    oppose: number;
  };
  representativeComment: {
    content: string;
    likes: number;
  };
  isHot: boolean;
}

const LegalArticleRanking: React.FC<LegalArticleRankingProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">입법수요 TOP 5</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <RankingCard key={item.id} rank={index + 1} data={item} />
        ))}
      </div>
    </div>
  );
};
```

#### 트렌드 차트 (2단 우측 상단)
```typescript
interface TrendChartProps {
  data: TrendData[];
  period: '7d' | '14d' | '30d' | 'all';
  onPeriodChange: (period: string) => void;
}

interface TrendData {
  date: string;
  articles: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, period, onPeriodChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">주간 이슈 트렌드</h3>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* 동적으로 Line 컴포넌트 생성 */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

#### 네트워크 그래프 (4단 중앙)
```typescript
interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface NetworkNode {
  id: string;
  type: 'legal' | 'incident';
  name: string;
  size: number;
  color: string;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // D3.js 네트워크 그래프 구현
    const svg = d3.select(svgRef.current);
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(400, 300));
    
    // 노드와 링크 렌더링 로직
  }, [nodes, links]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">주요 사건-법 연결망</h3>
      <svg ref={svgRef} width="800" height="600" />
    </div>
  );
};
```

### 3. 데이터 모델

#### 기본 데이터 타입
```typescript
// src/shared/types/dashboard.ts

export interface LegalArticle {
  id: string;
  name: string;          // 예: "개인정보보호법"
  article: string;       // 예: "제2조의2"
  category: string;      // 예: "개인정보"
  fullName: string;      // 예: "개인정보보호법 제2조의2"
}

export interface Incident {
  id: string;
  name: string;
  category: string;
  relatedLaw: string;
  commentCount: number;
  newsCount: number;
  createdAt: string;
}

export interface SocialComment {
  id: string;
  content: string;
  source: 'naver' | 'youtube' | 'twitter' | 'blog';
  stance: 'reform' | 'abolish' | 'oppose';
  incidentId: string;
  legalArticleId: string;
  createdAt: string;
  likes?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  publisher: string;
  publishedAt: string;
  incidentId: string;
  legalArticleId: string;
}

export interface DashboardFilters {
  period: '7d' | '14d' | '30d' | 'all';
  category: string[];
  source: string[];
}
```

#### 집계 데이터 타입
```typescript
export interface KPIMetrics {
  totalComments: number;
  totalIncidents: number;
  totalLegalArticles: number;
  mappingSuccessRate: number;
  previousWeek: {
    totalComments: number;
    totalIncidents: number;
    totalLegalArticles: number;
    mappingSuccessRate: number;
  };
}

export interface StanceDistribution {
  reform: number;      // 개정강화
  abolish: number;     // 폐지완화
  oppose: number;      // 반대
}

export interface TrendPoint {
  date: string;
  legalArticle: string;
  commentCount: number;
}

export interface HeatmapData {
  category: string;
  stance: 'reform' | 'abolish' | 'oppose';
  value: number;
  percentage: number;
}
```

## 데이터 처리 로직

### 1. 데이터 통합 및 정규화

```typescript
// src/shared/services/dataProcessor.ts

export class DataProcessor {
  // 기존 JSON 데이터를 통합하여 정규화된 형태로 변환
  static processRawData(newsData: any, socialData: any): ProcessedData {
    const incidents = this.extractIncidents(newsData, socialData);
    const legalArticles = this.extractLegalArticles(newsData, socialData);
    const comments = this.extractComments(socialData);
    const news = this.extractNews(newsData);
    
    return {
      incidents,
      legalArticles,
      comments,
      news,
      mappings: this.createMappings(incidents, legalArticles, comments, news)
    };
  }
  
  // KPI 메트릭 계산
  static calculateKPIMetrics(data: ProcessedData): KPIMetrics {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekComments = data.comments.filter(c => 
      new Date(c.createdAt) >= weekAgo
    );
    
    // 이전 주 데이터와 비교하여 메트릭 계산
    return {
      totalComments: data.comments.length,
      totalIncidents: data.incidents.length,
      totalLegalArticles: data.legalArticles.length,
      mappingSuccessRate: this.calculateMappingRate(data),
      previousWeek: {
        // 이전 주 데이터 계산 로직
      }
    };
  }
  
  // TOP 5 법조항 랭킹 계산
  static calculateTopLegalArticles(data: ProcessedData, limit = 5): LegalArticleRank[] {
    return data.legalArticles
      .map(article => ({
        ...article,
        commentCount: data.comments.filter(c => c.legalArticleId === article.id).length,
        newsCount: data.news.filter(n => n.legalArticleId === article.id).length,
        // 기타 계산 로직
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, limit);
  }
}
```

### 2. 필터링 및 집계

```typescript
// src/shared/hooks/useFilteredData.ts

export const useFilteredData = (filters: DashboardFilters) => {
  const [rawData, setRawData] = useState<ProcessedData | null>(null);
  
  const filteredData = useMemo(() => {
    if (!rawData) return null;
    
    return {
      comments: rawData.comments.filter(comment => {
        const dateFilter = this.applyDateFilter(comment.createdAt, filters.period);
        const categoryFilter = filters.category.length === 0 || 
          filters.category.includes(comment.category);
        const sourceFilter = filters.source.length === 0 || 
          filters.source.includes(comment.source);
        
        return dateFilter && categoryFilter && sourceFilter;
      }),
      // 다른 데이터도 동일하게 필터링
    };
  }, [rawData, filters]);
  
  return {
    data: filteredData,
    kpiMetrics: filteredData ? DataProcessor.calculateKPIMetrics(filteredData) : null,
    topLegalArticles: filteredData ? DataProcessor.calculateTopLegalArticles(filteredData) : [],
    // 기타 집계 데이터
  };
};
```

## 에러 처리

### 1. 데이터 로딩 에러
```typescript
// src/shared/hooks/useDataLoader.ts

export const useDataLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [newsResponse, socialResponse] = await Promise.all([
          fetch('/data/news.json'),
          fetch('/data/social.json')
        ]);
        
        if (!newsResponse.ok || !socialResponse.ok) {
          throw new Error('데이터 로딩에 실패했습니다.');
        }
        
        const newsData = await newsResponse.json();
        const socialData = await socialResponse.json();
        
        const processedData = DataProcessor.processRawData(newsData, socialData);
        setData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  return { data, loading, error };
};
```

### 2. 차트 렌더링 에러
```typescript
// src/shared/components/ErrorBoundary.tsx

export class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500">차트를 불러올 수 없습니다.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 테스트 전략

### 1. 단위 테스트
- **DataProcessor**: 데이터 변환 및 집계 로직 테스트
- **Custom Hooks**: 필터링 및 데이터 처리 훅 테스트
- **Utility Functions**: 날짜 처리, 포맷팅 함수 테스트

### 2. 컴포넌트 테스트
- **KPI Cards**: 다양한 데이터 상태에서의 렌더링 테스트
- **Charts**: 차트 라이브러리 통합 테스트
- **Filters**: 필터 상태 변경 및 데이터 업데이트 테스트

### 3. 통합 테스트
- **Dashboard Flow**: 전체 대시보드 워크플로우 테스트
- **Data Loading**: 실제 JSON 파일 로딩 및 처리 테스트
- **Responsive Design**: 다양한 화면 크기에서의 레이아웃 테스트

## 성능 최적화

### 1. 데이터 처리 최적화
```typescript
// 대용량 데이터 처리를 위한 Web Worker 활용
// src/shared/workers/dataProcessor.worker.ts

self.onmessage = function(e) {
  const { newsData, socialData } = e.data;
  
  // 백그라운드에서 데이터 처리
  const processedData = processLargeDataset(newsData, socialData);
  
  self.postMessage(processedData);
};
```

### 2. 차트 렌더링 최적화
```typescript
// 차트 데이터 메모이제이션
const ChartComponent = memo(({ data }: ChartProps) => {
  const chartData = useMemo(() => 
    transformDataForChart(data), [data]
  );
  
  return <ResponsiveContainer>...</ResponsiveContainer>;
});
```

### 3. 가상 스크롤링
```typescript
// 대량 리스트 렌더링을 위한 가상 스크롤
const VirtualizedList = ({ items }: { items: any[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  return (
    <div className="h-96 overflow-auto" onScroll={handleScroll}>
      {items.slice(visibleRange.start, visibleRange.end).map(item => 
        <ListItem key={item.id} data={item} />
      )}
    </div>
  );
};
```

## 접근성 고려사항

### 1. 키보드 네비게이션
- 모든 인터랙티브 요소에 적절한 tabindex 설정
- 차트 요소에 대한 키보드 접근성 제공

### 2. 스크린 리더 지원
- 차트 데이터에 대한 대체 텍스트 제공
- ARIA 레이블 및 설명 추가

### 3. 색상 접근성
- 색맹 사용자를 위한 패턴 및 텍스트 레이블 병행 사용
- WCAG 2.1 AA 기준 색상 대비 준수

## 배포 및 모니터링

### 1. 빌드 최적화
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    turbo: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};
```

### 2. 성능 모니터링
- Core Web Vitals 측정
- 차트 렌더링 시간 추적
- 데이터 로딩 성능 모니터링

이 설계는 확장 가능하고 유지보수가 용이한 구조로 입법수요 분석 대시보드의 모든 요구사항을 충족하도록 설계되었습니다.