'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';

interface WorldClock {
  name: string;
  zone: string;
  top: number;
  left: number;
}

interface WorldMapSlideProps {
  mapImage?: string;
  editMode?: boolean;
  onMapImageChange?: (imageUrl: string) => void;
}

// 시계 위치 - index.html 기준 그대로
const LOCATIONS: WorldClock[] = [
  { name: '대한민국', zone: 'Asia/Seoul', top: 54, left: 43.5 },
  { name: '중국', zone: 'Asia/Shanghai', top: 50, left: 38 },
  { name: '러시아', zone: 'Europe/Moscow', top: 34, left: 37 },
  { name: '카자흐스탄', zone: 'Asia/Almaty', top: 45, left: 31 },
  { name: '두바이', zone: 'Asia/Dubai', top: 60, left: 28 },
  { name: '오스트레일리아', zone: 'Australia/Sydney', top: 73.5, left: 44 },
  { name: '미국', zone: 'America/New_York', top: 48.5, left: 69 },
  { name: '캐나다', zone: 'America/Toronto', top: 37, left: 67 },
  { name: '그린란드', zone: 'America/Nuuk', top: 21, left: 82 },
  { name: '브라질', zone: 'America/Sao_Paulo', top: 68, left: 79 },
  { name: '아이슬란드', zone: 'Atlantic/Reykjavik', top: 33, left: 13 },
];

// 기본 지도 이미지 URL
const DEFAULT_MAP_IMAGE = 'https://cdn.imweb.me/upload/S20221123700ca8cd5ea82/fa5b65761fcbb.jpg';

export function WorldMapSlide({
  mapImage = DEFAULT_MAP_IMAGE,
  editMode = false,
  onMapImageChange,
}: WorldMapSlideProps) {
  const [currentTimes, setCurrentTimes] = useState<Record<number, string>>({});
  const mapInputRef = useRef<HTMLInputElement>(null);

  // 시계 업데이트 (매초)
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const times: Record<number, string> = {};
      LOCATIONS.forEach((loc, index) => {
        try {
          const timeString = new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: loc.zone,
          }).format(now);
          times[index] = timeString;
        } catch {
          times[index] = '--:--:--';
        }
      });
      setCurrentTimes(times);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMapImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onMapImageChange) return;
    const reader = new FileReader();
    reader.onload = (event) => onMapImageChange(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full max-w-full max-h-full" style={{ aspectRatio: '16/9' }}>
        {/* 베이스 레이어 - 지도 */}
        <img
          src={mapImage}
          alt="세계지도"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ zIndex: 1 }}
        />

        {/* 시계 레이어 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {LOCATIONS.map((loc, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${loc.top}%`,
                left: `${loc.left}%`,
              }}
            >
              <span
                className="font-pretendard font-extrabold text-black whitespace-nowrap"
                style={{
                  fontSize: '14px',
                  textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 0 8px rgba(255,255,255,0.8)',
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {currentTimes[index] || '--:--:--'}
              </span>
            </div>
          ))}
        </div>

        {/* 편집 모드 UI - 좌측 하단 */}
        {editMode && (
          <div className="absolute bottom-4 left-4 z-20">
            <input ref={mapInputRef} type="file" accept="image/*" onChange={handleMapImageUpload} className="hidden" />
            <button
              onClick={() => mapInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-pretendard"
            >
              지도 이미지 변경
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
