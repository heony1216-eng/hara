import type { Slide, SlideSettings, MapMarker, RescueStat, ImageSlide } from '@/types';

const STORAGE_KEYS = {
  SETTINGS: 'hara_settings',
  SLIDES: 'hara_slides',
  MAP_MARKERS: 'hara_map_markers',
  RESCUE_STATS: 'hara_rescue_stats',
  IMAGE_SLIDES: 'hara_image_slides',
} as const;

// 기본 설정
export const DEFAULT_SETTINGS: SlideSettings = {
  id: 'default',
  slideDuration: 10,
  autoPlay: true,
  transitionDuration: 500,
  editMode: false,
};

// 기본 구조 현황 데이터
export const DEFAULT_RESCUE_STATS: RescueStat[] = [
  { id: '1', label: '구조 진행', value: 0, sortOrder: 0, color: '#3B82F6' },
  { id: '2', label: '구조 완료', value: 0, sortOrder: 1, color: '#10B981' },
  { id: '3', label: '요청자', value: 0, sortOrder: 2, color: '#F59E0B' },
  { id: '4', label: '자원봉사자', value: 0, sortOrder: 3, color: '#8B5CF6' },
];

// 기본 마커 데이터
export const DEFAULT_MAP_MARKERS: MapMarker[] = [
  { id: '1', name: '서울', latitude: 37.5665, longitude: 126.9780, description: '한국 본부' },
  { id: '2', name: 'LA', latitude: 34.0522, longitude: -118.2437, description: '미국 지부' },
];

// localStorage 유틸리티
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  // 설정 관련
  getSettings(): SlideSettings {
    return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  setSettings(settings: SlideSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // 지도 마커 관련
  getMapMarkers(): MapMarker[] {
    return this.get(STORAGE_KEYS.MAP_MARKERS, DEFAULT_MAP_MARKERS);
  },

  setMapMarkers(markers: MapMarker[]): void {
    this.set(STORAGE_KEYS.MAP_MARKERS, markers);
  },

  // 구조 현황 관련
  getRescueStats(): { year: number; stats: RescueStat[] } {
    return this.get(STORAGE_KEYS.RESCUE_STATS, { year: new Date().getFullYear(), stats: DEFAULT_RESCUE_STATS });
  },

  setRescueStats(data: { year: number; stats: RescueStat[] }): void {
    this.set(STORAGE_KEYS.RESCUE_STATS, data);
  },

  // 이미지 슬라이드 관련
  getImageSlides(): Omit<ImageSlide, 'type'>[] {
    return this.get(STORAGE_KEYS.IMAGE_SLIDES, []);
  },

  setImageSlides(slides: Omit<ImageSlide, 'type'>[]): void {
    this.set(STORAGE_KEYS.IMAGE_SLIDES, slides);
  },
};
