'use client';

import { useRef, ChangeEvent } from 'react';

export interface StatusSlideProps {
  imageUrl: string;
  editMode?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

export function StatusSlide({
  imageUrl,
  editMode = false,
  onImageChange,
}: StatusSlideProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    const reader = new FileReader();
    reader.onload = (event) => onImageChange(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="구조현황"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white/50 text-center">
            <p className="text-xl mb-2">구조현황 이미지를 업로드해주세요</p>
            <p className="text-sm">편집 모드에서 이미지를 추가할 수 있습니다</p>
          </div>
        )}

        {/* 편집 모드 UI - 좌측 하단 */}
        {editMode && (
          <div className="absolute bottom-4 left-4 z-20">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-pretendard"
            >
              구조현황 이미지 변경
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
