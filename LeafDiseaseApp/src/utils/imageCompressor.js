/**
 * Image compression utility for LeafGuard AI.
 * Resizes large camera captures to max 1024px dimension at 85% JPEG quality.
 * Prevents uploading multi-megabyte photos over rural mobile networks.
 */

export async function compressImage(fileOrDataUrl, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    let src = "";
    let originalSize = 0;
    let fileName = "leaf_capture.jpg";

    if (typeof fileOrDataUrl === "string") {
      src = fileOrDataUrl;
      originalSize = Math.round((fileOrDataUrl.length * 3) / 4);
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      src = URL.createObjectURL(fileOrDataUrl);
      originalSize = fileOrDataUrl.size;
      fileName = fileOrDataUrl.name || "leaf_capture.jpg";
    } else {
      return reject(new Error("Invalid image input for compression"));
    }

    // If file is already small (under 350KB), avoid double-compression
    if (fileOrDataUrl instanceof File && originalSize <= 350 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          file: fileOrDataUrl,
          dataUrl: reader.result,
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          compressionRatio: 0
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Clean up object URL if created
      if (src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }

      let { width, height } = img;

      // Scale down proportionally
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Unable to create canvas context"));
      }

      // Draw with white background to handle transparency
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas blob generation failed"));
          }

          const cleanName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
          const compressedFile = new File([blob], cleanName, { type: "image/jpeg" });
          const compressedSize = blob.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const compressionRatio = originalSize > 0 
            ? Math.round(((originalSize - compressedSize) / originalSize) * 100) 
            : 0;

          console.log(`[Image Compressor] Original: ${(originalSize / 1024).toFixed(1)} KB | Compressed: ${(compressedSize / 1024).toFixed(1)} KB | Reduction: ${compressionRatio}%`);

          resolve({
            file: compressedFile,
            dataUrl: compressedDataUrl,
            originalSize,
            compressedSize,
            savedBytes,
            compressionRatio
          });
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (err) => {
      if (src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
      reject(new Error("Failed to load image for compression: " + err));
    };

    img.src = src;
  });
}
