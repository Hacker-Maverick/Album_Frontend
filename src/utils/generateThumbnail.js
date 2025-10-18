/**
 * Generate a square JPG thumbnail (center-cropped) for images and videos.
 * For videos, adds a play button overlay.
 * Returns a Promise that resolves to a Blob (image/jpeg).
 *
 * @param {File} file - Input image or video File object
 * @param {number} size - Square dimension (default: 400x400)
 */
export async function generateThumbnail(file, size = 400) {
  if (!file) throw new Error("No file provided");

  const type = file.type.toLowerCase();

  // ---- CASE 1: IMAGE ----
  if (type.startsWith("image/")) {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error("Failed to create image thumbnail")),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ---- CASE 2: VIDEO ----
  else if (type.startsWith("video/")) {
    return await new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 4);
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const minSide = Math.min(vw, vh);
        const sx = (vw - minSide) / 2;
        const sy = (vh - minSide) / 2;

        canvas.width = size;
        canvas.height = size;

        // Draw frame
        ctx.drawImage(video, sx, sy, minSide, minSide, 0, 0, size, size);

        // --- Draw dark overlay (optional) ---
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, size, size);

        // --- Draw white play button ---
        const triangleSize = size * 0.2;
        const x = size / 2 - triangleSize / 3;
        const y = size / 2 - triangleSize / 2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + triangleSize);
        ctx.lineTo(x + triangleSize, size / 2);
        ctx.closePath();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 6;
        ctx.fill();

        // --- Export thumbnail ---
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error("Failed to create video thumbnail")),
          "image/jpeg",
          0.85
        );
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  // ---- Unsupported Type ----
  else {
    throw new Error("Unsupported file type for thumbnail generation");
  }
}
