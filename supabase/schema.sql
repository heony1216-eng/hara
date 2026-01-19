-- hara 슬라이드쇼 앱용 Supabase 테이블
-- Supabase SQL Editor에서 실행해주세요

-- 슬라이드 설정 테이블
CREATE TABLE IF NOT EXISTS hara_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_duration INT DEFAULT 10,
  auto_play BOOLEAN DEFAULT true,
  transition_duration INT DEFAULT 500,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 슬라이드 데이터 테이블 (이미지 URL, 자막 등)
CREATE TABLE IF NOT EXISTS hara_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_type TEXT NOT NULL DEFAULT 'image', -- 'worldmap', 'status', 'image'
  image_url TEXT,
  caption TEXT,
  caption_style JSONB DEFAULT '{"fontSize": 60, "fontWeight": 400, "color": "#ffffff", "letterSpacing": 0, "shadowOpacity": 0}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 지도 배경 이미지
CREATE TABLE IF NOT EXISTS hara_map_background (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 구조 현황 이미지
CREATE TABLE IF NOT EXISTS hara_status_image (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) 비활성화 (공개 앱용)
ALTER TABLE hara_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_map_background ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_status_image ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all for hara_settings" ON hara_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_slides" ON hara_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_map_background" ON hara_map_background FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_status_image" ON hara_status_image FOR ALL USING (true) WITH CHECK (true);

-- 초기 설정 데이터 삽입
INSERT INTO hara_settings (slide_duration, auto_play, transition_duration)
SELECT 10, true, 500
WHERE NOT EXISTS (SELECT 1 FROM hara_settings);
