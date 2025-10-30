# 입법수요 분석 대시보드 요구사항 문서

## 소개

입법수요 분석 시스템의 종합 대시보드는 뉴스 기사에서 추출한 사건, 관련 법조항, 소셜 댓글 데이터를 기반으로 입법수요를 시각화하는 웹 애플리케이션입니다. 사용자는 실시간으로 여론 동향을 파악하고, 법조항별 입법수요를 분석할 수 있습니다.

## 용어 정의

- **Legislative_Dashboard**: 입법수요 분석 대시보드 시스템
- 1**KPI_Card**: 핵심 지표를 표시하는 카드형 컴포넌트
- 2**Legal_Article**: 법조항 (예: 개인정보보호법 제2조의2)
- 3**Social_Comment**: 소셜 미디어 댓글 데이터
- 4**News_Article**: 뉴스 기사 데이터
- 5**Legislative_Stance**: 입법 입장 (개정강화/폐지완화/반대)
- 6**Incident**: 뉴스에서 추출된 사건
- 7**Trend_Chart**: 시간대별 트렌드를 보여주는 차트
- 8**Heatmap**: 법 분야별 입법수요를 색상으로 표시하는 히트맵
- 9**Network_Graph**: 사건-법 연결망을 보여주는 네트워크 그래프

## 요구사항

### 요구사항 1

**사용자 스토리:** 관리자로서, 전체 시스템의 핵심 지표를 한눈에 파악하고 싶습니다. 그래야 입법수요 분석 현황을 빠르게 이해할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 총 댓글 분석 건수, 이슈 사건 수, 관련 법조항 수, 매핑 성공률을 KPI_Card 형태로 표시한다
2. WHEN 사용자가 KPI_Card에 마우스를 올릴 때, THE Legislative_Dashboard SHALL 전주 대비 상세 비교 정보를 툴팁으로 표시한다
3. THE Legislative_Dashboard SHALL 각 KPI_Card에 전주 대비 증감율을 화살표와 색상으로 표시한다
4. THE Legislative_Dashboard SHALL KPI_Card를 화면 상단에 4개 가로 배치로 표시한다

### 요구사항 2

**사용자 스토리:** 분석가로서, 입법수요가 높은 법조항 순위를 확인하고 싶습니다. 그래야 우선적으로 검토해야 할 법안을 파악할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL Legal_Article별 Social_Comment 수를 기준으로 TOP 5 순위를 표시한다
2. THE Legislative_Dashboard SHALL 각 Legal_Article에 대해 총 댓글 수, 관련 뉴스 수, 사건 개수를 표시한다
3. THE Legislative_Dashboard SHALL 각 Legal_Article의 Legislative_Stance 분포를 진행바 형태로 표시한다
4. THE Legislative_Dashboard SHALL 댓글 수가 많은 주요 사건 2개를 각 Legal_Article별로 표시한다
5. WHEN 사용자가 "상세보기" 버튼을 클릭할 때, THE Legislative_Dashboard SHALL 해당 Legal_Article의 상세 페이지로 이동한다

### 요구사항 3

**사용자 스토리:** 분석가로서, 시간에 따른 입법수요 변화 추이를 확인하고 싶습니다. 그래야 트렌드를 파악하고 예측할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL TOP 3 Legal_Article에 대한 일별 Social_Comment 수를 Trend_Chart로 표시한다
2. THE Legislative_Dashboard SHALL 최근 7일, 14일, 30일, 전체 기간 선택 필터를 제공한다
3. WHEN 사용자가 차트 라인에 마우스를 올릴 때, THE Legislative_Dashboard SHALL 정확한 수치를 표시한다
4. WHEN 사용자가 범례를 클릭할 때, THE Legislative_Dashboard SHALL 해당 라인을 표시하거나 숨긴다

### 요구사항 4

**사용자 스토리:** 정책 담당자로서, 전체 여론의 성향 분포를 파악하고 싶습니다. 그래야 정책 방향을 결정할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 전체 Social_Comment의 Legislative_Stance별 비율을 시각화한다
2. THE Legislative_Dashboard SHALL 개정강화, 폐지완화, 반대 각 입장별 실제 댓글 수를 표시한다
3. THE Legislative_Dashboard SHALL 개정강화는 빨간색, 폐지완화는 파란색, 반대는 회색으로 색상 구분한다
4. THE Legislative_Dashboard SHALL 바 차트 또는 파이 차트 형태로 분포를 표시한다

### 요구사항 5

**사용자 스토리:** 기자로서, 최근 화제가 되고 있는 뉴스와 관련 법조항을 확인하고 싶습니다. 그래야 후속 기사를 작성할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 최근 7일 내 News_Article을 Social_Comment 수 기준으로 정렬하여 표시한다
2. THE Legislative_Dashboard SHALL 각 News_Article에 대해 제목, 댓글 수, 작성일, 매핑된 Legal_Article을 표시한다
3. WHEN 사용자가 "원문보기" 링크를 클릭할 때, THE Legislative_Dashboard SHALL 새 창에서 원문을 표시한다
4. THE Legislative_Dashboard SHALL 최대 5개의 News_Article을 표시한다
5. WHEN 사용자가 "더보기" 버튼을 클릭할 때, THE Legislative_Dashboard SHALL 전체 뉴스 리스트 페이지로 이동한다

### 요구사항 6

**사용자 스토리:** 시스템 관리자로서, 데이터 수집 현황을 모니터링하고 싶습니다. 그래야 시스템 상태를 파악할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 뉴스 데이터와 댓글 데이터의 전체 건수와 오늘 추가 건수를 표시한다
2. THE Legislative_Dashboard SHALL 뉴스와 댓글 데이터의 매핑 성공률을 표시한다
3. THE Legislative_Dashboard SHALL 데이터 출처별 분포를 바 차트로 표시한다
4. THE Legislative_Dashboard SHALL 마지막 업데이트 시간을 표시한다

### 요구사항 7

**사용자 스토리:** 분석가로서, 급상승하는 이슈를 빠르게 파악하고 싶습니다. 그래야 신속하게 대응할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 최근 24시간 vs 이전 24시간 Social_Comment 수를 비교하여 증가율을 계산한다
2. THE Legislative_Dashboard SHALL 증가율 상위 3개 Incident를 표시한다
3. THE Legislative_Dashboard SHALL 각 Incident에 대해 증가율, 오늘 댓글 수, 관련 Legal_Article을 표시한다
4. THE Legislative_Dashboard SHALL 관련 키워드를 해시태그 형태로 표시한다

### 요구사항 8

**사용자 스토리:** 정책 연구원으로서, 법 분야별 입법수요 패턴을 분석하고 싶습니다. 그래야 분야별 정책 우선순위를 설정할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 법 분야별 Legislative_Stance 분포를 Heatmap으로 표시한다
2. THE Legislative_Dashboard SHALL 50% 이상은 진한 빨강, 20-50%는 노랑, 20% 미만은 초록으로 색상 구분한다
3. WHEN 사용자가 Heatmap 셀에 마우스를 올릴 때, THE Legislative_Dashboard SHALL 정확한 비율과 댓글 수를 표시한다
4. THE Legislative_Dashboard SHALL Heatmap 하단에 주요 인사이트를 텍스트로 표시한다

### 요구사항 9

**사용자 스토리:** 연구원으로서, 주요 사건과 법조항 간의 연결 관계를 시각적으로 파악하고 싶습니다. 그래야 법안 간 연관성을 이해할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL TOP 5 Legal_Article과 관련 Incident를 Network_Graph로 표시한다
2. THE Legislative_Dashboard SHALL Legal_Article은 사각형, Incident는 원형으로 노드를 구분한다
3. THE Legislative_Dashboard SHALL Incident 노드 크기를 Social_Comment 수에 비례하여 표시한다
4. WHEN 사용자가 노드를 클릭할 때, THE Legislative_Dashboard SHALL 상세 정보를 팝업으로 표시한다
5. THE Legislative_Dashboard SHALL 드래그, 줌 인/아웃 기능을 제공한다

### 요구사항 10

**사용자 스토리:** 정책 담당자로서, 여론 성향의 시간별 변화를 추적하고 싶습니다. 그래야 정책 효과를 평가할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 최근 4주간 Legislative_Stance별 비율 변화를 적층 영역 차트로 표시한다
2. WHEN 사용자가 차트에 마우스를 올릴 때, THE Legislative_Dashboard SHALL 해당 주의 정확한 비율과 댓글 수를 표시한다
3. THE Legislative_Dashboard SHALL 차트 하단에 주요 변화량을 화살표와 퍼센트로 요약 표시한다
4. THE Legislative_Dashboard SHALL 개정강화, 폐지완화, 반대를 구분된 색상으로 표시한다

### 요구사항 11

**사용자 스토리:** 사용자로서, 원하는 조건으로 데이터를 필터링하고 싶습니다. 그래야 관심 있는 정보만 집중해서 볼 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 기간 선택 필터(최근 7일/14일/30일/전체)를 제공한다
2. THE Legislative_Dashboard SHALL 법 분야 선택 필터를 제공한다
3. THE Legislative_Dashboard SHALL 데이터 출처 선택 필터를 제공한다
4. WHEN 사용자가 필터를 변경할 때, THE Legislative_Dashboard SHALL 모든 차트와 통계를 자동으로 업데이트한다

### 요구사항 12

**사용자 스토리:** 사용자로서, 다양한 기기에서 대시보드를 사용하고 싶습니다. 그래야 언제 어디서나 정보에 접근할 수 있습니다.

#### 승인 기준

1. THE Legislative_Dashboard SHALL 데스크톱(1920px), 태블릿(768px), 모바일(375px) 화면에서 적절히 표시된다
2. WHEN 화면 크기가 모바일일 때, THE Legislative_Dashboard SHALL 카드를 세로 배치로 변경한다
3. THE Legislative_Dashboard SHALL 터치 기반 인터랙션을 지원한다
4. THE Legislative_Dashboard SHALL 모든 차트가 반응형으로 동작한다