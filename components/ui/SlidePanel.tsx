'use client';

import { ReactNode } from 'react';

interface SlidePanelProps {
  slides: {
    id: string;
    label: string;
    thumbnail?: string;
  }[];
  currentIndex: number;
  onSlideSelect: (index: number) => void;
  editMode?: boolean;
}

export function SlidePanel({ slides, currentIndex, onSlideSelect, editMode = false }: SlidePanelProps) {
  return (
    <div className="w-[200px] h-full bg-neutral-900 border-r border-neutral-700 overflow-y-auto">
      <div className="p-3 space-y-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => !editMode && onSlideSelect(index)}
            disabled={editMode}
            className={`w-full text-left transition-all ${
              currentIndex === index
                ? 'ring-2 ring-blue-500'
                : editMode ? 'opacity-50 cursor-not-allowed' : 'hover:ring-1 hover:ring-white/30'
            }`}
          >
            {/* 썸네일 영역 */}
            <div className="relative aspect-video bg-black rounded overflow-hidden">
              {slide.thumbnail ? (
                <img
                  src={slide.thumbnail}
                  alt={slide.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                  {slide.label}
                </div>
              )}
              {/* 슬라이드 번호 */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-pretendard">
                {index + 1}
              </div>
            </div>
            {/* 라벨 */}
            <p className={`mt-1 text-xs truncate font-pretendard ${
              currentIndex === index ? 'text-white' : 'text-white/60'
            }`}>
              {slide.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
