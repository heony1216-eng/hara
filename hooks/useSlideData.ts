'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { storage, DEFAULT_SETTINGS } from '@/lib/storage';
import type { SlideSettings, ImageSlide, CaptionStyle } from '@/types';

// Supabase 테이블 이름
const TABLES = {
  SETTINGS: 'hara_settings',
  SLIDES: 'hara_slides',
  STATUS_IMAGE: 'hara_status_image',
  MAP_BACKGROUND: 'hara_map_background',
};

// localStorage 키 (Supabase 실패 시 폴백)
const STORAGE_KEY_STATUS_IMAGE = 'hara_status_image';
const STORAGE_KEY_MAP_BG = 'hara_map_background';

export function useSlideData() {
  const [settings, setSettings] = useState<SlideSettings>(DEFAULT_SETTINGS);
  const [statusImageUrl, setStatusImageUrl] = useState<string>('');
  const [mapBackground, setMapBackground] = useState<string>('');
  const [imageSlides, setImageSlides] = useState<Omit<ImageSlide, 'type'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase에서 데이터 로드
  const loadFromSupabase = async () => {
    try {
      // 설정 로드
      const { data: settingsData } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .single();

      if (settingsData) {
        setSettings({
          id: settingsData.id,
          slideDuration: settingsData.slide_duration,
          autoPlay: settingsData.auto_play,
          transitionDuration: settingsData.transition_duration,
          editMode: false,
        });
      }

      // 슬라이드 로드
      const { data: slidesData } = await supabase
        .from(TABLES.SLIDES)
        .select('*')
        .eq('slide_type', 'image')
        .order('sort_order', { ascending: true });

      if (slidesData) {
        setImageSlides(
          slidesData.map((s) => ({
            id: s.id,
            imageUrl: s.image_url || '',
            caption: s.caption || '',
            captionStyle: s.caption_style as CaptionStyle,
            sortOrder: s.sort_order,
          }))
        );
      }

      // 구조 현황 이미지 로드
      const { data: statusData } = await supabase
        .from(TABLES.STATUS_IMAGE)
        .select('*')
        .single();

      if (statusData?.image_url) {
        setStatusImageUrl(statusData.image_url);
      }

      // 지도 배경 로드
      const { data: mapData } = await supabase
        .from(TABLES.MAP_BACKGROUND)
        .select('*')
        .single();

      if (mapData?.image_url) {
        setMapBackground(mapData.image_url);
      }

      return true;
    } catch (error) {
      console.error('Supabase load error:', error);
      return false;
    }
  };

  // localStorage에서 데이터 로드 (폴백)
  const loadFromLocalStorage = () => {
    setSettings(storage.getSettings());
    setImageSlides(storage.getImageSlides());
    setStatusImageUrl(storage.get(STORAGE_KEY_STATUS_IMAGE, ''));
    setMapBackground(storage.get(STORAGE_KEY_MAP_BG, ''));
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      // Supabase 시도, 실패 시 localStorage
      const supabaseSuccess = await loadFromSupabase();
      if (!supabaseSuccess) {
        console.log('Falling back to localStorage');
        loadFromLocalStorage();
      }

      setIsLoading(false);
    };

    initData();
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(async (newSettings: Partial<SlideSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      // localStorage에 백업
      storage.setSettings(updated);

      // Supabase 업데이트 (비동기)
      supabase
        .from(TABLES.SETTINGS)
        .upsert({
          id: updated.id,
          slide_duration: updated.slideDuration,
          auto_play: updated.autoPlay,
          transition_duration: updated.transitionDuration,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Settings update error:', error);
        });

      return updated;
    });
  }, []);

  // 구조 현황 이미지 업데이트
  const updateStatusImage = useCallback(async (imageUrl: string) => {
    setStatusImageUrl(imageUrl);
    storage.set(STORAGE_KEY_STATUS_IMAGE, imageUrl);

    // Supabase 업데이트
    const { data: existing } = await supabase
      .from(TABLES.STATUS_IMAGE)
      .select('id')
      .single();

    if (existing) {
      await supabase
        .from(TABLES.STATUS_IMAGE)
        .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from(TABLES.STATUS_IMAGE)
        .insert({ image_url: imageUrl });
    }
  }, []);

  // 지도 배경 업데이트
  const updateMapBackground = useCallback(async (imageUrl: string) => {
    setMapBackground(imageUrl);
    storage.set(STORAGE_KEY_MAP_BG, imageUrl);

    // Supabase 업데이트
    const { data: existing } = await supabase
      .from(TABLES.MAP_BACKGROUND)
      .select('id')
      .single();

    if (existing) {
      await supabase
        .from(TABLES.MAP_BACKGROUND)
        .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from(TABLES.MAP_BACKGROUND)
        .insert({ image_url: imageUrl });
    }
  }, []);

  // 이미지 슬라이드 업데이트
  const updateImageSlides = useCallback(async (slides: Omit<ImageSlide, 'type'>[]) => {
    setImageSlides(slides);
    storage.setImageSlides(slides);

    // Supabase 업데이트 (기존 삭제 후 새로 삽입)
    await supabase.from(TABLES.SLIDES).delete().eq('slide_type', 'image');

    if (slides.length > 0) {
      await supabase.from(TABLES.SLIDES).insert(
        slides.map((s, i) => ({
          id: s.id,
          slide_type: 'image',
          image_url: s.imageUrl,
          caption: s.caption,
          caption_style: s.captionStyle,
          sort_order: i,
        }))
      );
    }
  }, []);

  // 이미지 슬라이드 추가
  const addImageSlide = useCallback(
    (imageUrl: string, caption?: string) => {
      const newSlide = {
        id: crypto.randomUUID(),
        imageUrl,
        caption,
        sortOrder: imageSlides.length,
      };
      updateImageSlides([...imageSlides, newSlide]);
    },
    [imageSlides, updateImageSlides]
  );

  // 이미지 슬라이드 삭제
  const removeImageSlide = useCallback(
    (id: string) => {
      const filtered = imageSlides.filter((s) => s.id !== id);
      const reordered = filtered.map((s, i) => ({ ...s, sortOrder: i }));
      updateImageSlides(reordered);
    },
    [imageSlides, updateImageSlides]
  );

  return {
    settings,
    statusImageUrl,
    mapBackground,
    imageSlides,
    isLoading,
    updateSettings,
    updateStatusImage,
    updateMapBackground,
    updateImageSlides,
    addImageSlide,
    removeImageSlide,
  };
}
