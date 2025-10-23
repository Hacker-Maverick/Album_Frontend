import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchDownloadLinks } from "../utils/downloadlink";
import { fetchViewLinks } from "../utils/viewlink";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import ImageFooter from "./imagefooter";
import { useZoomPan } from "../utils/useZoomPan";

export default function ViewMedia() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeImageId } = useParams();

  const savedState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("imageViewState") || "null");
    } catch {
      return null;
    }
  }, []);

  // ✅ Correct state priority
  const state = location.state || savedState || { imageId: routeImageId };
  const { imageId, albumId, albumName, eventName, eventDate, images } = state || {};

  const token = useSelector((s) => s.user.token);
  const user = useSelector((s) => s.user.user);

  // ✅ Save only when valid
  useEffect(() => {
    if (state && state.imageId && state.images) {
      sessionStorage.setItem("imageViewState", JSON.stringify(state));
    }
  }, [state]);

  // ✅ Find index based on the clicked image
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (images && imageId) {
      const idx = images.findIndex((img) => (img.id || img._id) === imageId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  // ✅ Update route when switching (same `/imageview/:id`)
  useEffect(() => {
    if (!images || currentIndex < 0 || currentIndex >= images.length) return;
    const newId = images[currentIndex].id || images[currentIndex]._id;
    if (!newId) return;
    navigate(`/imageview/${newId}`, {
      replace: true,
      state: { ...state, imageId: newId },
    });
    sessionStorage.setItem(
      "imageViewState",
      JSON.stringify({ ...state, imageId: newId })
    );
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const [viewUrl, setViewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  // ✅ Fetch URLs for the *current* image
  useEffect(() => {
    if (!images || currentIndex < 0 || currentIndex >= images.length) return;
    const cur = images[currentIndex];
    const curId = cur.id || cur._id;

    setIsMediaLoading(true);
    setViewUrl(null);
    setDownloadUrl(null);

    Promise.all([fetchViewLinks([curId], token), fetchDownloadLinks([curId], token)])
      .then(([viewRes, downloadRes]) => {
        const v =
          viewRes?.[0]?.shareUrl ||
          viewRes?.[0]?.viewUrl ||
          viewRes?.[0]?.imageUrl ||
          viewRes?.[0]?.url;
        const d = downloadRes?.[0]?.downloadUrl || downloadRes?.[0]?.url;
        setViewUrl(v || null);
        setDownloadUrl(d || null);
      })
      .catch((e) => console.error("URL fetch error:", e));
  }, [currentIndex, images, token]);

  // ✅ Navigation
  const goNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // ✅ Zoom & Pan
  const {
    zoom,
    pan,
    zoomIn,
    zoomOut,
    resetZoom,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleDoubleTap,
    containerRef,
  } = useZoomPan({ onSwipeLeft: goNext, onSwipeRight: goPrev });

  if (!images || !images.length) {
    return (
      <div className="fixed inset-0 bg-[#171312] text-white flex items-center justify-center">
        <p>No media found.</p>
      </div>
    );
  }

  const cur = images[currentIndex];
  const fileName = cur?.name || cur?.originalname || cur?.key || "";
  const mimeType = cur?.type || cur?.mime || "";
  const isVideo =
    mimeType.toLowerCase().includes("video") ||
    /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(fileName);
  const curEventName = eventName || cur.event || albumName || "Untitled";
  const headerMonthYear = eventDate
    ? new Date(eventDate).toLocaleString(undefined, { month: "long", year: "numeric" })
    : "";

  // ✅ Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (!isVideo && (e.key === "+" || e.key === "=")) zoomIn();
      else if (!isVideo && (e.key === "-" || e.key === "_")) zoomOut();
      else if (!isVideo && e.key === "0") resetZoom();
      else if (isVideo && e.key === " ") {
        e.preventDefault();
        const video = containerRef.current?.querySelector("video");
        if (video) {
          video.paused ? video.play() : video.pause();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVideo, goNext, goPrev, zoomIn, zoomOut, resetZoom, containerRef]);

  return (
    <div className="fixed inset-0 bg-[#171312] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="text-[20px] font-semibold">{curEventName}</div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#C9C3BD]">{headerMonthYear}</div>
          <button
            aria-label="Close"
            onClick={() => {
              navigate(-1);
              setTimeout(() => window.location.reload(), 150);
            }}
            className="text-xl opacity-80 hover:opacity-100"
          >
            ×
          </button>
        </div>
      </header>

      {/* Viewer */}
      <main className="relative flex-1 flex items-center justify-center px-4 pb-2 select-none">
        <button
          onClick={goPrev}
          disabled={currentIndex <= 0}
          className="absolute left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hidden lg:flex items-center justify-center hover:bg-black/85 disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          ref={containerRef}
          className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center bg-[#1F1A18] rounded-lg overflow-hidden touch-pan-y"
          onMouseDown={(e) => !isVideo && onMouseDown(e)}
          onMouseMove={(e) => !isVideo && onMouseMove(e)}
          onMouseUp={(e) => !isVideo && onMouseUp(e)}
          onMouseLeave={(e) => !isVideo && onMouseUp(e)}
          onTouchStart={(e) => !isVideo && onTouchStart(e)}
          onTouchMove={(e) => !isVideo && onTouchMove(e)}
          onTouchEnd={(e) => !isVideo && onTouchEnd(e)}
          onDoubleClick={(e) => !isVideo && handleDoubleTap(e.nativeEvent)}
          onWheel={(e) => !isVideo && onWheel(e)}
        >
          {(!viewUrl || isMediaLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1F1A18]/90 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-4 border-[#C9A97C]/30 border-t-[#C9A97C] animate-spin" />
                <span className="text-[#C9A97C] text-sm font-medium tracking-wide">
                  Loading {isVideo ? "video…" : "image…"}
                </span>
              </div>
            </div>
          )}

          {viewUrl &&
            (isVideo ? (
              <video
                src={viewUrl}
                controls
                autoPlay
                playsInline
                className={`max-w-[90vw] max-h-[80vh] rounded-lg transition-opacity duration-150 ${isMediaLoading ? "opacity-0" : "opacity-100"
                  }`}
                onLoadedData={() => setIsMediaLoading(false)}
                onError={() => setIsMediaLoading(false)}
              />
            ) : (
              <img
                src={viewUrl}
                alt={curEventName}
                className={`max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-150 ease-out ${isMediaLoading ? "opacity-0" : "opacity-100"
                  } select-none`}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  cursor: zoom > 1 ? "grab" : "default",
                }}
                onLoad={() => setIsMediaLoading(false)}
                onError={() => setIsMediaLoading(false)}
                draggable={false}
              />
            ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex >= images.length - 1}
          className="absolute right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hidden lg:flex items-center justify-center hover:bg-black/85 disabled:opacity-30"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>

        {!isVideo && (
          <div className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 md:flex-col gap-5 hidden lg:flex">
            <button className="h-9 w-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/85" onClick={zoomIn}>
              <ZoomIn size={18} />
            </button>
            <button className="h-9 w-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/85" onClick={zoomOut}>
              <ZoomOut size={18} />
            </button>
            <button className="mt-1 px-2 py-1 rounded bg-black/60 text-xs hover:bg-black/75" onClick={resetZoom}>
              100%
            </button>
          </div>
        )}
      </main>

      {!state?.fromRequest && (
        <ImageFooter
          albumId={albumId}
          albumName={albumName}
          eventDate={eventDate}
          eventName={curEventName}
          imageId={images[currentIndex]?.id || images[currentIndex]?._id}
          viewUrl={viewUrl}
          downloadUrl={downloadUrl}
          user={user}
          token={token}
          images={images}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      )}

    </div>
  );
}
