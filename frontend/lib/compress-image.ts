/**
 * Compresses an image file before upload (especially useful for high-res mobile camera photos).
 * PDF files or images already under 500KB are returned as-is.
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File> {
  if (!file) return file;

  // Don't compress PDF files
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (isPdf) {
    return file;
  }

  // Check if file is image or has image extension or missing mime-type (common on mobile iOS/Android)
  const isImage = file.type.startsWith('image/') || 
                  /\.(jpg|jpeg|png|webp|heic|heif|bmp|gif|tiff)$/i.test(file.name) || 
                  !file.type;

  if (!isImage || file.size <= 500 * 1024) {
    return file;
  }

  // Attempt 1: Fast & reliable createImageBitmap (supported in modern mobile browsers)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file);
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality)
        );

        if (blob && blob.size < file.size) {
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
        }
      }
    } catch (e) {
      console.warn("createImageBitmap compression failed, falling back to FileReader:", e);
    }
  }

  // Attempt 2: FileReader + Image fallback for legacy browsers / iOS
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File(
              [blob],
              newName,
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
