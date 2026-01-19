# Hara 배포 가이드

## 1. Supabase 테이블 생성

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 좌측 메뉴 "SQL Editor" 클릭
4. 아래 SQL 복사해서 실행:

```sql
-- 슬라이드 설정 테이블
CREATE TABLE IF NOT EXISTS hara_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_duration INT DEFAULT 10,
  auto_play BOOLEAN DEFAULT true,
  transition_duration INT DEFAULT 500,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 슬라이드 데이터 테이블
CREATE TABLE IF NOT EXISTS hara_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_type TEXT NOT NULL DEFAULT 'image',
  image_url TEXT,
  caption TEXT,
  caption_style JSONB DEFAULT '{"fontSize": 60, "fontWeight": 400, "color": "#ffffff", "letterSpacing": 0, "shadowOpacity": 0}',
  sort_order INT NOT NULL DEFAULT 0,
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

-- 지도 배경 이미지
CREATE TABLE IF NOT EXISTS hara_map_background (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책 (모든 사용자 접근 허용)
ALTER TABLE hara_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_status_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE hara_map_background ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for hara_settings" ON hara_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_slides" ON hara_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_status_image" ON hara_status_image FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for hara_map_background" ON hara_map_background FOR ALL USING (true) WITH CHECK (true);

-- 초기 설정
INSERT INTO hara_settings (slide_duration, auto_play, transition_duration)
SELECT 10, true, 500
WHERE NOT EXISTS (SELECT 1 FROM hara_settings);
```

## 2. Vercel 배포

1. https://vercel.com 접속 (GitHub 로그인)
2. "Add New Project" 클릭
3. GitHub에서 `hara` 저장소 선택
4. "Environment Variables" 섹션에서 아래 변수 추가:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://khwzdwewgadvpglptvua.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtod3pkd2V3Z2FkdnBnbHB0dnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDIxODAsImV4cCI6MjA4MzgxODE4MH0.EiDPa3pJuEDNzfM-mho7PZ0NR83MGAH2XPf1lvP-9l4 |
| NEXT_PUBLIC_DROPBOX_APP_KEY | fvr4cismfdje3d8 |
| NEXT_PUBLIC_DROPBOX_APP_SECRET | ov7ykh1arjvag8q |
| NEXT_PUBLIC_DROPBOX_REFRESH_TOKEN | wCxiziVcNH0AAAAAAAAAATYQOTE7ajbAsA4aSyDz0_B0YMpZ5jqrelvDPamyPrf4 |

5. "Deploy" 클릭
6. 배포 완료 후 URL 확인 (예: hara-xxx.vercel.app)

## 3. 폰트 설정 (선택사항)

AppleSDGothicNeo 폰트는 macOS 기본 폰트라 웹에서 동작합니다.
다른 환경에서도 동일하게 보이려면 웹폰트를 추가하세요.

## 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인
