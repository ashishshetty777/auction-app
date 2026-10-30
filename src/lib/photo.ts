const MAX_EDGE = 1200;

/** Some Android pickers report no type, and HEIC often comes through as "". */
function maybeHeic(file: File) {
  return /^image\/hei[cf]$/.test(file.type) || /\.hei[cf]$/i.test(file.name) || file.type === '';
}

async function decode(blob: Blob): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
}

/**
 * Re-encodes a phone photo as a JPEG of at most 1200px, so it shows in every
 * browser (HEIC doesn't outside Safari) and stays well under the upload limit.
 * Browsers that can't read HEIC (Chrome, Android) get it decoded in JS; that
 * decoder is large, so it only loads when needed. Returns null when the file
 * isn't a readable photo (an SVG, a PDF renamed .jpg).
 */
export async function toJpeg(file: File): Promise<Blob | null> {
  let bitmap = await decode(file);
  if (!bitmap && maybeHeic(file)) {
    try {
      const { default: heic2any } = await import('heic2any');
      const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      bitmap = await decode(Array.isArray(out) ? out[0] : out);
    } catch {
      return null;
    }
  }
  if (!bitmap) return null;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
}
