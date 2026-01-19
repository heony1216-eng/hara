'use client';

import { useRef, ChangeEvent, useState } from 'react';
import { processImageTo1080p } from '@/lib/imageUtils';
import type { CaptionStyle } from '@/types';

const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontSize: 60,
  fontWeight: 400,
  color: '#ffffff',
  letterSpacing: 0,
  shadowOpacity: 0, // -100 ~ 100: 음수=흰색, 양수=검정색
};

interface ImageSlideProps {
  id: string;
  imageUrl: string;
  caption?: string;
  captionStyle?: CaptionStyle;
  editMode?: boolean;
  onImageChange?: (imageUrl: string) => void;
  onCaptionChange?: (caption: string) => void;
  onCaptionStyleChange?: (style: CaptionStyle) => void;
  onDelete?: () => void;
}

export function ImageSlide({
  id,
  imageUrl,
  caption = '',
  captionStyle = DEFAULT_CAPTION_STYLE,
  editMode = false,
  onImageChange,
  onCaptionChange,
  onCaptionStyleChange,
  onDelete,
}: ImageSlideProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const currentStyle = { ...DEFAULT_CAPTION_STYLE, ...captionStyle };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;

    setIsProcessing(true);
    try {
      // 1920x1080으로 자동 리사이즈/크롭
      const processedImage = await processImageTo1080p(file);
      onImageChange(processedImage);
      setImageError(false);
      setIsImageLoading(true);
    } catch (error) {
      console.error('Image processing error:', error);
      // 실패 시 원본 사용
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
        setImageError(false);
        setIsImageLoading(true);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  const updateStyle = (updates: Partial<CaptionStyle>) => {
    onCaptionStyleChange?.({ ...currentStyle, ...updates });
  };

  // 폰트 두께 라벨
  const getFontWeightLabel = (weight: number) => {
    if (weight <= 200) return 'Thin';
    if (weight <= 300) return 'Light';
    if (weight <= 400) return 'Regular';
    if (weight <= 500) return 'Medium';
    if (weight <= 600) return 'SemiBold';
    if (weight <= 700) return 'Bold';
    if (weight <= 800) return 'ExtraBold';
    return 'Black';
  };

  // 그림자 스타일 생성 (-100: 흰색, 0: 없음, 100: 검정색)
  const getTextShadow = (shadowValue: number) => {
    if (shadowValue === 0) return 'none';

    const alpha = Math.abs(shadowValue) / 100;
    const color = shadowValue < 0 ? '255,255,255' : '0,0,0'; // 음수: 흰색, 양수: 검정색

    return `0 2px 8px rgba(${color},${alpha}), 0 4px 16px rgba(${color},${alpha * 0.5})`;
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* 배경 이미지 */}
      {imageUrl && !imageError ? (
        <>
          {(isImageLoading || isProcessing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                {isProcessing && (
                  <p className="text-white/60 text-sm" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>이미지 처리 중...</p>
                )}
              </div>
            </div>
          )}
          <img
            src={imageUrl}
            alt="슬라이드 이미지"
            className="w-full h-full object-cover"
            style={{
              opacity: isImageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-white/50">
          {editMode ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg mb-4" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>이미지를 업로드하세요</p>
              <p className="text-sm mb-4 text-white/30" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>자동으로 1920×1080 비율로 조정됩니다</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}
              >
                이미지 선택
              </button>
            </>
          ) : (
            <p className="text-xl" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>이미지가 없습니다</p>
          )}
        </div>
      )}

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 하단 그라데이션 + 자막 영역 */}
      {(caption || editMode) && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            paddingTop: '60px',
          }}
        >
          <div className="px-8 pb-8 pointer-events-auto">
            {editMode ? (
              <div className="flex flex-col items-center gap-3">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => onCaptionChange?.(e.target.value)}
                  placeholder="자막을 입력하세요..."
                  className="w-full bg-transparent text-center outline-none border-b border-white/30 focus:border-white/60 pb-2 placeholder:text-white/40"
                  style={{
                    fontFamily: 'AppleSDGothicNeo, sans-serif',
                    fontSize: `${currentStyle.fontSize}px`,
                    fontWeight: currentStyle.fontWeight,
                    color: currentStyle.color,
                    letterSpacing: `${currentStyle.letterSpacing}px`,
                    textShadow: getTextShadow(currentStyle.shadowOpacity),
                  }}
                />
                {/* 스타일 편집 토글 버튼 */}
                <button
                  onClick={() => setShowStyleEditor(!showStyleEditor)}
                  className="text-white/50 text-xs hover:text-white/80 transition-colors"
                  style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}
                >
                  {showStyleEditor ? '스타일 편집 닫기 ▲' : '스타일 편집 ▼'}
                </button>

                {/* 스타일 편집 패널 */}
                {showStyleEditor && (
                  <div className="bg-black/70 rounded-lg p-4 flex flex-wrap gap-4 justify-center items-center">
                    {/* 글씨 크기 */}
                    <div className="flex items-center gap-2">
                      <label className="text-white/70 text-xs whitespace-nowrap" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>크기</label>
                      <input
                        type="range"
                        min="16"
                        max="100"
                        value={currentStyle.fontSize}
                        onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-white/50 text-xs w-12">{currentStyle.fontSize}px</span>
                    </div>

                    {/* 두께 */}
                    <div className="flex items-center gap-2">
                      <label className="text-white/70 text-xs whitespace-nowrap" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>두께</label>
                      <input
                        type="range"
                        min="100"
                        max="900"
                        step="100"
                        value={currentStyle.fontWeight}
                        onChange={(e) => updateStyle({ fontWeight: parseInt(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-white/50 text-xs w-16">{getFontWeightLabel(currentStyle.fontWeight)}</span>
                    </div>

                    {/* 색상 */}
                    <div className="flex items-center gap-2">
                      <label className="text-white/70 text-xs whitespace-nowrap" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>색상</label>
                      <input
                        type="color"
                        value={currentStyle.color}
                        onChange={(e) => updateStyle({ color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                    </div>

                    {/* 자간 */}
                    <div className="flex items-center gap-2">
                      <label className="text-white/70 text-xs whitespace-nowrap" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>자간</label>
                      <input
                        type="range"
                        min="-2"
                        max="10"
                        value={currentStyle.letterSpacing}
                        onChange={(e) => updateStyle({ letterSpacing: parseInt(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-white/50 text-xs w-8">{currentStyle.letterSpacing}px</span>
                    </div>

                    {/* 그림자 */}
                    <div className="flex items-center gap-2">
                      <label className="text-white/70 text-xs whitespace-nowrap" style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}>그림자</label>
                      <span className="text-white/30 text-xs">흰</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={currentStyle.shadowOpacity}
                        onChange={(e) => updateStyle({ shadowOpacity: parseInt(e.target.value) })}
                        className="w-24"
                      />
                      <span className="text-white/30 text-xs">검</span>
                      <span className="text-white/50 text-xs w-8">{currentStyle.shadowOpacity}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              caption && (
                <p
                  className="text-center leading-relaxed"
                  style={{
                    fontFamily: 'AppleSDGothicNeo, sans-serif',
                    fontSize: `${currentStyle.fontSize}px`,
                    fontWeight: currentStyle.fontWeight,
                    color: currentStyle.color,
                    letterSpacing: `${currentStyle.letterSpacing}px`,
                    textShadow: getTextShadow(currentStyle.shadowOpacity),
                  }}
                >
                  {caption}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* 편집 모드 컨트롤 - 좌측 하단에 배치 */}
      {editMode && (
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          {imageUrl && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}
            >
              이미지 변경
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              style={{ fontFamily: 'AppleSDGothicNeo, sans-serif' }}
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
