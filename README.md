# 입법수요 분석 대시보드

Next.js 기반의 입법수요 분석 대시보드입니다. 뉴스와 소셜 댓글 데이터를 분석하여 법조항별 여론 동향을 시각화합니다.

## 🚀 주요 기능

### ✅ 구현 완료
- **KPI 카드 섹션**: 전체 통계 및 증감율 표시
- **입법수요 TOP 5 랭킹**: 댓글 수 기준 법조항 순위
- **시간대별 트렌드 차트**: Recharts 기반 라인 차트
- **전체 여론 성향 분포**: 입장별 바 차트
- **최근 핫이슈 뉴스**: 댓글 수 기준 뉴스 리스트
- **데이터 수집 현황**: 실시간 데이터 통계
- **급상승 사건**: 24시간 증가율 기준 이슈
- **법 분야별 히트맵**: ECharts 기반 히트맵 (🆕 최신 구현)

### 🔄 구현 예정
- 사건-법 네트워크 그래프 (D3.js)
- 여론 변화 추이 차트
- 전역 필터링 시스템
- 반응형 디자인 최적화

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 18, TypeScript
- **차트 라이브러리**: 
  - ECharts (히트맵)
  - Recharts (바 차트, 라인 차트)
  - Nivo (기존 트렌드 차트)
  - D3.js (네트워크 그래프 예정)
- **상태 관리**: Jotai
- **스타일링**: Tailwind CSS
- **아이콘**: Heroicons, React Icons

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/dashboard/           # 대시보드 페이지 및 컴포넌트
│   ├── components/
│   │   ├── charts/         # 차트 컴포넌트들
│   │   ├── sections/       # 섹션별 컴포넌트들
│   │   └── ranking/        # 랭킹 관련 컴포넌트들
│   └── page.tsx
├── shared/
│   ├── types/              # TypeScript 타입 정의
│   ├── hooks/              # 커스텀 훅들
│   ├── services/           # 데이터 처리 서비스
│   └── utils/              # 유틸리티 함수들
└── features/               # 기존 기능들 (뉴스, 소셜)
```

## 🎯 주요 컴포넌트

### LegalFieldHeatmap
- ECharts 기반 법 분야별 입법수요 히트맵
- 법 분야 × 입장 매트릭스 시각화
- 색상 강도 매핑 및 인터랙티브 툴팁
- 자동 생성 인사이트 텍스트

### DataProcessor
- JSON 데이터 통합 및 정규화
- KPI 메트릭 계산
- 트렌드 데이터 집계
- 필터링 로직

## 📊 데이터 구조

- **LegalArticle**: 법조항 정보
- **Incident**: 사건 정보  
- **SocialComment**: 소셜 댓글 데이터
- **NewsArticle**: 뉴스 기사 데이터
- **HeatmapData**: 히트맵 시각화 데이터

## 🔧 개발 가이드

### 새로운 차트 컴포넌트 추가
1. `src/app/dashboard/components/charts/` 에 컴포넌트 생성
2. 해당 데이터 처리 훅을 `src/shared/hooks/` 에 생성
3. 필요시 `DataProcessor` 클래스에 집계 로직 추가
4. 타입 정의를 `src/shared/types/dashboard.ts` 에 추가

### 테스트
```bash
# 컴포넌트 테스트 (Jest 설정 필요)
npm test

# TypeScript 타입 체크
npx tsc --noEmit
```

## 📈 성능 최적화

- React.memo를 활용한 컴포넌트 메모이제이션
- useMemo를 활용한 데이터 처리 최적화
- 차트 렌더링 최적화
- 가상 스크롤링 (대량 데이터용)

## 🎨 디자인 시스템

- **색상**: 
  - 개정강화: #EF4444 (빨강)
  - 폐지완화: #3B82F6 (파랑)  
  - 반대: #6B7280 (회색)
- **반응형**: 모바일, 태블릿, 데스크톱 지원
- **접근성**: ARIA 레이블, 키보드 네비게이션 지원

## 📝 라이선스

MIT License

## 👥 기여

이슈나 PR은 언제든 환영합니다!