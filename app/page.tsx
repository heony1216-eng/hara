'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SlideShow } from '@/components/SlideShow';
import { WorldMapSlide } from '@/components/slides/WorldMapSlide';
import { StatusSlide } from '@/components/slides/StatusSlide';
import { ImageSlide } from '@/components/slides/ImageSlide';
import { SettingsPanel } from '@/components/ui/SettingsPanel';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useSlideData } from '@/hooks/useSlideData';
import type { CaptionStyle } from '@/types';

export default function Home() {
  const {
    settings,
    statusImageUrl,
    imageSlides,
    isLoading,
    updateSettings,
    updateStatusImage,
    updateImageSlides,
    addImageSlide,
    removeImageSlide,
  } = useSlideData();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 전체화면 상태 동기화
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 새 이미지 슬라이드 추가
  const handleAddSlide = () => {
    addImageSlide('');
  };

  // 이미지 슬라이드 업데이트
  const handleImageSlideUpdate = (id: string, updates: { imageUrl?: string; caption?: string; captionStyle?: CaptionStyle }) => {
    const updated = imageSlides.map((slide) =>
      slide.id === id ? { ...slide, ...updates } : slide
    );
    updateImageSlides(updated);
  };

  // 슬라이드 배열 구성 (지도 + 현황 + 이미지들)
  const slides = [
    // 페이지 1: 세계 지도 (고정, 삭제 안됨)
    <WorldMapSlide
      key="worldmap"
      editMode={settings.editMode}
    />,
    // 페이지 2: 구조 현황 이미지 (고정, 삭제 안됨)
    <StatusSlide
      key="status"
      imageUrl={statusImageUrl}
      editMode={settings.editMode}
      onImageChange={updateStatusImage}
    />,
    // 페이지 3+: 일반 이미지 슬라이드 (추가/삭제 가능)
    ...imageSlides.map((slide) => (
      <ImageSlide
        key={slide.id}
        id={slide.id}
        imageUrl={slide.imageUrl}
        caption={slide.caption}
        captionStyle={slide.captionStyle}
        editMode={settings.editMode}
        onImageChange={(url) => handleImageSlideUpdate(slide.id, { imageUrl: url })}
        onCaptionChange={(caption) => handleImageSlideUpdate(slide.id, { caption })}
        onCaptionStyleChange={(captionStyle) => handleImageSlideUpdate(slide.id, { captionStyle })}
        onDelete={() => removeImageSlide(slide.id)}
      />
    )),
  ];

  // 슬라이드 패널용 데이터
  const slidePanelData = useMemo(() => [
    { id: 'worldmap', label: '세계 지도', thumbnail: undefined },
    { id: 'status', label: '구조 현황', thumbnail: statusImageUrl || undefined },
    ...imageSlides.map((slide, i) => ({
      id: slide.id,
      label: slide.caption || `슬라이드 ${i + 3}`,
      thumbnail: slide.imageUrl || undefined,
    })),
  ], [statusImageUrl, imageSlides]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex">
      {/* 좌측 슬라이드 패널 - 전체화면 아닐 때만 표시 */}
      {!isFullscreen && (
        <SlidePanel
          slides={slidePanelData}
          currentIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
        />
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 h-full flex items-center justify-center">
        <div
          className="relative bg-black"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: isFullscreen ? '100%' : 'calc(100vh * 16 / 9)',
            maxHeight: isFullscreen ? '100%' : 'calc(100vw * 9 / 16)',
          }}
        >
          {/* 슬라이드쇼 */}
          <SlideShow
            duration={settings.slideDuration}
            transitionDuration={settings.transitionDuration}
            autoPlay={settings.autoPlay && !settings.editMode}
            currentIndex={currentSlideIndex}
            onIndexChange={setCurrentSlideIndex}
          >
            {slides}
          </SlideShow>

          {/* 설정 패널 */}
          <SettingsPanel
            settings={settings}
            onSettingsChange={updateSettings}
            onAddSlide={handleAddSlide}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            currentSlide={currentSlideIndex}
            totalSlides={slides.length}
          />
        </div>
      </div>
    </main>
  );
}
