// 상세분석(기사슬라이드)

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MutableRefObject } from "react";
import Image from "next/image";
import { formatPeriodDate } from "@/shared/utils/period";

type Article = { title: string; url: string; content: string };

type Props = {
  slideRef: MutableRefObject<HTMLDivElement | null>;
  date: string;
  mid: string;
  sub: string;
  articles: Article[];
  onClose: () => void;
  periodLabel: string;
};

export default function ArticleSlider({
  slideRef,
  date,
  mid,
  sub,
  articles,
  onClose,
  periodLabel,
}: Props) {
  const displayDate = formatPeriodDate(periodLabel, date);

  return (
    <div
      ref={slideRef}
      className="mt-6 w-full h-[400px] bg-white/35 backdrop-blur-md p-5 rounded-xl border border-white/50 text-neutral-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xl font-semibold">기사 슬라이드 ({periodLabel}별)</h4>
            <Image
              src="/icons/info.png"
              alt="도움말"
              width={24}
              height={24}
              title={`버블 차트에서 선택된 사건(${periodLabel}별 소셜 언급량 피크일의 지정 사건)에 관한 기사들을 확인할 수 있습니다. 카드 하단의 '원문보기'를 클릭하면 원문 기사로 이동합니다.`}
              className="object-contain cursor-pointer"
            />
          </div>
          <p className="text-neutral-700/70">
            피크일: {displayDate ?? date} / 테마: {mid} / 사건명: {sub}
          </p>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination, A11y, Keyboard, Autoplay]}
        navigation
        pagination={false}
        keyboard={{ enabled: true }}
        spaceBetween={16}
        slidesPerView={4}
        breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
        autoplay={{
          delay: 3000,                 //  3초마다 자동 이동
          disableOnInteraction: false, // 사용자가 스와이프해도 자동재생 유지
          pauseOnMouseEnter: true,     // 마우스 올리면 일시정지(선택)
        }}
        loop                         // 마지막 슬라이드 후 처음으로 루프(선택)

        className="pb-8"
      >
        {articles.map((a, idx) => (
          <SwiperSlide key={idx}>
            <div className="h-full w-full flex flex-col bg-white/35 backdrop-blur-md border border-white/50 rounded-xl p-4">
              <h5 className="text-lg font-semibold mb-2 line-clamp-2">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-sky-600 hover:text-sky-700"
                >
                  {a.title}
                </a>
              </h5>
              <p className="text-sm text-neutral-700 line-clamp-5">{a.content}</p>
              <div className="mt-auto pt-3">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sky-600 hover:text-sky-700 text-sm hover:underline underline-offset-2"
                >
                  원문 보기 →
                </a>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
