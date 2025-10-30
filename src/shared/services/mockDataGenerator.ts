/**
 * 목 데이터 생성기
 * sample-kpi-data.json을 기반으로 랭킹 데이터를 빠르게 생성
 */

import { LegalArticleRank, StanceDistribution } from '@/shared/types/dashboard';

export class MockDataGenerator {
  static generateTopLegalArticles(): LegalArticleRank[] {
    return [
      {
        id: 'legal_1',
        article: '부동산 대출 규제 (은행법 제37조)',
        commentCount: 1180,
        newsCount: 15,
        incidentCount: 3,
        majorIncidents: [
          { name: '부동산 대출 규제 강화', commentCount: 880 },
          { name: '영끌족 대출 제한', commentCount: 300 }
        ],
        stanceDistribution: {
          reform: 880,
          abolish: 120,
          oppose: 180
        },
        representativeComment: {
          content: '부동산 대출 규제를 더 강화해서 집값을 안정시켜야 합니다.',
          likes: 245
        },
        isHot: true
      },
      {
        id: 'legal_2',
        article: '최저임금 인상 (최저임금법 제8조)',
        commentCount: 1150,
        newsCount: 12,
        incidentCount: 2,
        majorIncidents: [
          { name: '2025년 최저임금 인상률 결정', commentCount: 850 },
          { name: '최저임금 1만원 논의', commentCount: 300 }
        ],
        stanceDistribution: {
          reform: 850,
          abolish: 100,
          oppose: 200
        },
        representativeComment: {
          content: '최저임금을 더 많이 올려야 합니다. 생활비가 너무 올랐어요.',
          likes: 189
        },
        isHot: false
      },
      {
        id: 'legal_3',
        article: '가상자산 규제 (자본시장법 제5조)',
        commentCount: 950,
        newsCount: 18,
        incidentCount: 4,
        majorIncidents: [
          { name: '가상자산 규제 강화 방안 발표', commentCount: 720 },
          { name: '암호화폐 사기 급증', commentCount: 230 }
        ],
        stanceDistribution: {
          reform: 720,
          abolish: 80,
          oppose: 150
        },
        representativeComment: {
          content: '가상자산 규제를 더 강화해야 합니다. 투자자 보호가 우선이에요.',
          likes: 156
        },
        isHot: true
      },
      {
        id: 'legal_4',
        article: '개인정보보호 강화 (개인정보보호법 제24조)',
        commentCount: 820,
        newsCount: 14,
        incidentCount: 3,
        majorIncidents: [
          { name: '개인정보 유출 사건 급증', commentCount: 580 },
          { name: '빅테크 개인정보 수집 논란', commentCount: 240 }
        ],
        stanceDistribution: {
          reform: 650,
          abolish: 70,
          oppose: 100
        },
        representativeComment: {
          content: '개인정보보호법을 더 강화해야 합니다. 기업들의 무분별한 수집을 막아야 해요.',
          likes: 134
        },
        isHot: false
      },
      {
        id: 'legal_5',
        article: '중대재해처벌법 적용 (중대재해처벌법 제5조)',
        commentCount: 780,
        newsCount: 11,
        incidentCount: 2,
        majorIncidents: [
          { name: '태안화력 노동자 사망 사고', commentCount: 520 },
          { name: '건설현장 안전사고 증가', commentCount: 260 }
        ],
        stanceDistribution: {
          reform: 600,
          abolish: 60,
          oppose: 120
        },
        representativeComment: {
          content: '중대재해처벌법을 더 강화해야 합니다. 노동자의 생명이 우선이에요.',
          likes: 98
        },
        isHot: false
      }
    ];
  }

  static calculateStancePercentages(distribution: StanceDistribution): StanceDistribution {
    const total = distribution.reform + distribution.abolish + distribution.oppose;
    if (total === 0) return { reform: 0, abolish: 0, oppose: 0 };

    return {
      reform: Math.round((distribution.reform / total) * 100),
      abolish: Math.round((distribution.abolish / total) * 100),
      oppose: Math.round((distribution.oppose / total) * 100)
    };
  }
}