const UPLOAD_MAX_DIMENSION = 1600;
const UPLOAD_QUALITY = 0.85;

// Сжимаем в браузере до отправки — телефонное фото весит 5-10+ МБ, а прод
// крутится на тесной VDS (2 vCPU, ~4ГБ), где то же самое сжатие на сервере
// на секунду-две грузит оба ядра и память так, что виснет весь сайт (не
// только бэк-офис). Здесь работы намного больше — у пользователя обычно
// современный телефон/ноутбук, а не общая VDS на несколько сервисов.
export async function compressInBrowser(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, UPLOAD_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', UPLOAD_QUALITY));
  if (!blob) throw new Error('canvas.toBlob failed');
  return blob;
}
