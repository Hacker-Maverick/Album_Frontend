/**
 * Generate a square JPG thumbnail (center-cropped) for images and videos.
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

        // Determine crop area (center-crop square)
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(
          img,
          sx, sy, minSide, minSide, // source area
          0, 0, size, size          // destination
        );

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
        video.currentTime = Math.min(1, video.duration / 4); // capture ~1s in
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Compute square crop
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const minSide = Math.min(vw, vh);
        const sx = (vw - minSide) / 2;
        const sy = (vh - minSide) / 2;

        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(
          video,
          sx, sy, minSide, minSide,
          0, 0, size, size
        );

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
