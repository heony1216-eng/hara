// Dropbox API 연동 유틸리티
// company-intranet의 dropbox.js를 Next.js/TypeScript로 포팅

let cachedAccessToken: string | null = null;
let tokenExpiry: number | null = null;

// 액세스 토큰 가져오기 (자동 갱신)
async function getAccessToken(): Promise<string> {
  const appKey = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
  const appSecret = process.env.NEXT_PUBLIC_DROPBOX_APP_SECRET;
  const refreshToken = process.env.NEXT_PUBLIC_DROPBOX_REFRESH_TOKEN;

  // Refresh Token이 없으면 에러
  if (!appKey || !appSecret || !refreshToken) {
    throw new Error('Dropbox credentials not configured');
  }

  // 캐시된 토큰이 유효하면 재사용 (만료 10분 전까지)
  if (cachedAccessToken && tokenExpiry && Date.now() < tokenExpiry - 10 * 60 * 1000) {
    return cachedAccessToken;
  }

  // 새 토큰 발급
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: appKey,
      client_secret: appSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Dropbox token refresh failed:', error);
    throw new Error('Failed to refresh Dropbox token');
  }

  const data = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedAccessToken!;
}

// Dropbox URL을 직접 다운로드 링크로 변환
function toDirectLink(url: string): string {
  return url
    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    .replace('?dl=0', '')
    .replace('&dl=0', '');
}

// 파일 업로드
export async function uploadToDropbox(
  file: File,
  folder: string = '/hara'
): Promise<{ url: string; path: string; size: number }> {
  const accessToken = await getAccessToken();

  // 파일명에 타임스탬프 추가 (중복 방지)
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseName}_${timestamp}.${ext}`;
  const dropboxPath = `${folder}/${newFileName}`;

  // 파일 업로드
  const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: dropboxPath,
        mode: 'add',
        autorename: true,
        mute: false,
      }),
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error('Dropbox upload failed:', error);
    throw new Error('Failed to upload to Dropbox');
  }

  const uploadData = await uploadResponse.json();

  // 공유 링크 생성
  const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: uploadData.path_display,
      settings: {
        requested_visibility: 'public',
      },
    }),
  });

  let shareUrl: string;

  if (shareResponse.ok) {
    const shareData = await shareResponse.json();
    shareUrl = toDirectLink(shareData.url);
  } else {
    // 이미 공유 링크가 있는 경우
    const existingResponse = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: uploadData.path_display,
        direct_only: true,
      }),
    });

    if (existingResponse.ok) {
      const existingData = await existingResponse.json();
      if (existingData.links && existingData.links.length > 0) {
        shareUrl = toDirectLink(existingData.links[0].url);
      } else {
        throw new Error('Failed to get share link');
      }
    } else {
      throw new Error('Failed to create share link');
    }
  }

  return {
    url: shareUrl,
    path: uploadData.path_display,
    size: uploadData.size,
  };
}

// 파일 삭제 (경로로)
export async function deleteFromDropbox(path: string): Promise<boolean> {
  const accessToken = await getAccessToken();

  const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Dropbox delete failed:', error);
    return false;
  }

  return true;
}

// 파일 삭제 (URL로)
export async function deleteFileByUrl(url: string): Promise<boolean> {
  if (!url || !url.includes('dropbox')) {
    return false;
  }

  const accessToken = await getAccessToken();

  // 공유 링크 메타데이터에서 경로 추출
  const response = await fetch('https://api.dropboxapi.com/2/sharing/get_shared_link_metadata', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url.replace('dl.dropboxusercontent.com', 'www.dropbox.com') }),
  });

  if (!response.ok) {
    console.error('Failed to get file metadata');
    return false;
  }

  const data = await response.json();
  return deleteFromDropbox(data.path_lower);
}

// Base64 이미지를 Dropbox에 업로드
export async function uploadBase64ToDropbox(
  base64Data: string,
  fileName: string,
  folder: string = '/hara'
): Promise<{ url: string; path: string; size: number }> {
  // Base64를 Blob으로 변환
  const base64Response = await fetch(base64Data);
  const blob = await base64Response.blob();

  // File 객체 생성
  const file = new File([blob], fileName, { type: blob.type });

  return uploadToDropbox(file, folder);
}
