'use client';

import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import type { SlideSettings } from '@/types';

interface SettingsPanelProps {
  settings: SlideSettings;
  onSettingsChange: (settings: Partial<SlideSettings>) => void;
  onAddSlide: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onAddSlide,
  onToggleFullscreen,
  isFullscreen,
  currentSlide,
  totalSlides,
}: SettingsPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 마우스 움직임 감지
  const handleMouseMove = useCallback(() => {
    setIsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!isExpanded) {
        setIsVisible(false);
      }
    }, 3000);
  }, [isExpanded]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  // F키로 전체화면 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        onToggleFullscreen();
      } else if (e.key === 'e' || e.key === 'E') {
        onSettingsChange({ editMode: !settings.editMode });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleFullscreen, onSettingsChange, settings.editMode]);

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 60) {
      onSettingsChange({ slideDuration: value });
    }
  };

  return (
    <>
      {/* 좌측 상단: 슬라이드 번호 */}
      <div
        className={`fixed top-4 left-4 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-white text-sm font-pretendard">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      {/* 우측 상단: 컨트롤 버튼 (위치 고정) */}
      <div
        className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* 버튼 3개 - 항상 우측 정렬 */}
        <div className="flex items-center gap-2 justify-end">
          {/* 편집 모드 토글 */}
          <button
            onClick={() => onSettingsChange({ editMode: !settings.editMode })}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-pretendard ${
              settings.editMode
                ? 'bg-blue-500 text-white'
                : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
            }`}
          >
            편집
          </button>

          {/* 전체화면 토글 */}
          <button
            onClick={onToggleFullscreen}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-pretendard ${
              isFullscreen
                ? 'bg-blue-500 text-white'
                : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
            }`}
          >
            {isFullscreen ? '창모드' : '전체화면'}
          </button>

          {/* 설정 확장 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-pretendard ${
              isExpanded
                ? 'bg-blue-500 text-white'
                : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
            }`}
          >
            설정
          </button>
        </div>

        {/* 확장된 설정 패널 - 버튼 아래에 우측 정렬 */}
        {isExpanded && (
          <div className="mt-2 bg-black/80 backdrop-blur-md rounded-lg p-4 w-[280px]">
            <h3 className="text-white font-bold mb-4 font-pretendard">설정</h3>

            {/* 슬라이드 체류 시간 */}
            <div className="mb-4">
              <label className="text-white/80 text-sm block mb-2 font-pretendard">
                슬라이드 체류 시간: {settings.slideDuration}초
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={settings.slideDuration}
                onChange={handleDurationChange}
                className="w-full"
              />
            </div>

            {/* 자동 재생 */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-white/80 text-sm font-pretendard">자동 재생</span>
              <button
                onClick={() => onSettingsChange({ autoPlay: !settings.autoPlay })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoPlay ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.autoPlay ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 전환 시간 */}
            <div className="mb-4">
              <label className="text-white/80 text-sm block mb-2 font-pretendard">
                전환 효과 시간: {settings.transitionDuration}ms
              </label>
              <input
                type="range"
                min="200"
                max="1000"
                step="100"
                value={settings.transitionDuration}
                onChange={(e) => onSettingsChange({ transitionDuration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* 슬라이드 추가 버튼 - 항상 표시 */}
            <button
              onClick={onAddSlide}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-pretendard"
            >
              + 이미지 슬라이드 추가
            </button>

            {/* 단축키 안내 */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white/50 text-xs mb-2 font-pretendard">단축키</p>
              <ul className="text-white/60 text-xs space-y-1 font-pretendard">
                <li>F - 전체화면</li>
                <li>E - 편집 모드</li>
                <li>← → - 슬라이드 이동</li>
                <li>Space - 다음 슬라이드</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
