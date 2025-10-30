import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '입법수요 분석 대시보드',
  description: '뉴스 기사와 소셜 댓글 데이터를 기반으로 한 입법수요 분석 대시보드',
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}