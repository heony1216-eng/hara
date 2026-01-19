/**
 * 이미지를 1920x1080 (16:9) 비율로 crop하고 resize하는 유틸리티
 */

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 16:9 = 1.777...

export async function processImageTo1080p(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // 원본 이미지 비율 계산
        const srcRatio = img.width / img.height;

        let srcX = 0;
        let srcY = 0;
        let srcWidth = img.width;
        let srcHeight = img.height;

        if (srcRatio > TARGET_RATIO) {
          // 원본이 더 넓음 -> 좌우를 자름
          srcWidth = img.height * TARGET_RATIO;
          srcX = (img.width - srcWidth) / 2;
        } else if (srcRatio < TARGET_RATIO) {
          // 원본이 더 높음 -> 상하를 자름
          srcHeight = img.width / TARGET_RATIO;
          srcY = (img.height - srcHeight) / 2;
        }

        // 검은 배경으로 채우기
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        // 이미지 그리기 (crop & resize)
        ctx.drawImage(
          img,
          srcX, srcY, srcWidth, srcHeight, // source
          0, 0, TARGET_WIDTH, TARGET_HEIGHT // destination
        );

        // JPEG로 변환 (품질 0.9)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Base64 이미지 문자열을 1920x1080으로 처리
 */
export async function processBase64ImageTo1080p(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      const srcRatio = img.width / img.height;

      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      if (srcRatio > TARGET_RATIO) {
        srcWidth = img.height * TARGET_RATIO;
        srcX = (img.width - srcWidth) / 2;
      } else if (srcRatio < TARGET_RATIO) {
        srcHeight = img.width / TARGET_RATIO;
        srcY = (img.height - srcHeight) / 2;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      ctx.drawImage(
        img,
        srcX, srcY, srcWidth, srcHeight,
        0, 0, TARGET_WIDTH, TARGET_HEIGHT
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}
