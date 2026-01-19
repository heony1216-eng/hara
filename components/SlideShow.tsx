'use client';

import { useState, useEffect, useCallback, ReactNode, useRef } from 'react';

interface SlideShowProps {
  children: ReactNode[];
  duration: number; // 슬라이드 체류 시간 (초)
  transitionDuration: number; // 전환 시간 (밀리초)
  autoPlay: boolean;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  editMode?: boolean; // 편집 모드일 때 슬라이드 이동 비활성화
}

export function SlideShow({
  children,
  duration,
  transitionDuration,
  autoPlay,
  currentIndex,
  onIndexChange,
  editMode = false,
}: SlideShowProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [showIndicator, setShowIndicator] = useState(false);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slideCount = children.length;

  // 인디케이터 표시 (1초 후 사라짐)
  const showIndicatorBriefly = useCallback(() => {
    setShowIndicator(true);
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowIndicator(false);
    }, 1000);
  }, []);

  // 다음 슬라이드로 이동
  const goToNext = useCallback((manual: boolean = false) => {
    if (editMode || slideCount <= 1) return; // 편집 모드일 때 이동 불가
    const nextIndex = (currentIndex + 1) % slideCount;
    onIndexChange(nextIndex);
    if (manual) showIndicatorBriefly();
  }, [editMode, currentIndex, slideCount, onIndexChange, showIndicatorBriefly]);

  // 이전 슬라이드로 이동
  const goToPrev = useCallback((manual: boolean = false) => {
    if (editMode || slideCount <= 1) return; // 편집 모드일 때 이동 불가
    const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
    onIndexChange(prevIndex);
    if (manual) showIndicatorBriefly();
  }, [editMode, currentIndex, slideCount, onIndexChange, showIndicatorBriefly]);

  // 특정 슬라이드로 이동
  const goToSlide = useCallback((index: number) => {
    if (editMode) return; // 편집 모드일 때 이동 불가
    if (index >= 0 && index < slideCount && index !== currentIndex) {
      onIndexChange(index);
      showIndicatorBriefly();
    }
  }, [editMode, slideCount, currentIndex, onIndexChange, showIndicatorBriefly]);

  // 슬라이드 전환 효과
  useEffect(() => {
    if (displayIndex !== currentIndex) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex);
        setIsTransitioning(false);
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayIndex, transitionDuration]);

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const timer = setInterval(() => {
      goToNext(false); // 자동 재생은 인디케이터 표시 안함
    }, duration * 1000);

    return () => clearInterval(timer);
  }, [autoPlay, duration, goToNext, slideCount]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext(true); // 수동 조작
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev(true); // 수동 조작
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // cleanup
  useEffect(() => {
    return () => {
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* 슬라이드 컨테이너 */}
      {children.map((child, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: index === displayIndex ? (isTransitioning ? 0 : 1) : 0,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
            zIndex: index === displayIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
        >
          {child}
        </div>
      ))}

      {/* 슬라이드 인디케이터 - 수동 조작 시에만 1초간 표시 */}
      {slideCount > 1 && (
        <div
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 transition-opacity duration-300 ${
            showIndicator ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 네비게이션 버튼 (호버 시 표시) */}
      {slideCount > 1 && (
        <>
          <button
            onClick={() => goToPrev(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
            aria-label="이전 슬라이드"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => goToNext(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
            aria-label="다음 슬라이드"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
