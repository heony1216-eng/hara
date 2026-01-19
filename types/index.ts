// 슬라이드 타입
export type SlideType = 'worldMap' | 'status' | 'image';

export interface BaseSlide {
  id: string;
  type: SlideType;
  sortOrder: number;
  duration?: number; // 개별 슬라이드 체류 시간 (초)
}

// 지도 마커
export interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  highlightTime?: string; // HH:MM 형식
  isActive?: boolean;
}

export interface WorldMapSlide extends BaseSlide {
  type: 'worldMap';
  markers: MapMarker[];
  title?: string;
}

// 구조 현황 통계
export interface RescueStat {
  id: string;
  label: string;
  value: number;
  sortOrder: number;
  color?: string;
}

export interface StatusSlide extends BaseSlide {
  type: 'status';
  year: number;
  title: string;
  stats: RescueStat[];
  backgroundImage?: string;
}

// 자막 스타일
export interface CaptionStyle {
  fontSize: number; // px
  fontWeight: number; // 100-900
  color: string; // hex
  letterSpacing: number; // px
  shadowOpacity: number; // -100 ~ 100 (-100: 흰색 그림자, 0: 없음, 100: 검정색 그림자)
}

// 이미지 슬라이드
export interface ImageSlide extends BaseSlide {
  type: 'image';
  imageUrl: string;
  caption?: string;
  captionStyle?: CaptionStyle;
}

export type Slide = WorldMapSlide | StatusSlide | ImageSlide;

// 전역 설정
export interface SlideSettings {
  id: string;
  slideDuration: number; // 기본 슬라이드 체류 시간 (초)
  autoPlay: boolean;
  transitionDuration: number; // 전환 시간 (밀리초)
  editMode: boolean;
}

// 앱 상태
export interface AppState {
  slides: Slide[];
  settings: SlideSettings;
  currentSlideIndex: number;
  isFullscreen: boolean;
}

// Supabase 테이블 타입
export interface DbSlideSettings {
  id: string;
  slide_duration: number;
  auto_play: boolean;
  transition_duration: number;
  created_at: string;
  updated_at: string;
}

export interface DbMapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  highlight_time: string | null;
  created_at: string;
}

export interface DbRescueStat {
  id: string;
  year: number;
  label: string;
  value: number;
  sort_order: number;
  color: string | null;
  created_at: string;
}

export interface DbImageSlide {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}
