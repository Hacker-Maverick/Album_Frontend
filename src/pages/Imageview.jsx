import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { fetchDownloadLinks } from "../utils/downloadlink";
import { fetchViewLinks } from "../utils/viewlink";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import ImageFooter from "./imagefooter";

export default function ViewImage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeImageId } = useParams();

  // Recover previously saved state
  const savedState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("imageViewState") || "null");
    } catch {
      return null;
    }
  }, []);

  const state = location.state || savedState || { imageId: routeImageId };
  const { imageId, albumId, albumName, eventName, eventDate, images } = state || {};

  // Persist state for refresh/re-render
  useEffect(() => {
    if (state && state.imageId) {
      sessionStorage.setItem("imageViewState", JSON.stringify(state));
    }
  }, [state]);

  const token = useSelector((s) => s.user.token);
  const user = useSelector((s) => s.user.user);

  // Current index
  const [currentIndex, setCurrentIndex] = useState(-1);
  useEffect(() => {
    if (images && imageId) {
      const idx = images.findIndex((img) => (img.id || img._id) === imageId);
      setCurrentIndex(idx >= 0 ? idx : 0);
    }
  }, [imageId, images]);

  // Keep URL in sync when image changes
  useEffect(() => {
    if (!images || currentIndex < 0 || currentIndex >= images.length) return;
    const newId = images[currentIndex].id || images[currentIndex]._id;
    if (!newId) return;
    navigate(`/imageview/${newId}`, { replace: true });
    const updated = { ...(state || {}), imageId: newId };
    sessionStorage.setItem("imageViewState", JSON.stringify(updated));
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Image URLs + loading
  const [viewUrl, setViewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (!images || currentIndex < 0 || currentIndex >= images.length) return;

    const cur = images[currentIndex];
    const curId = cur.id || cur._id;

    setIsImageLoading(true);
    setViewUrl(null);
    setDownloadUrl(null);

    Promise.all([fetchViewLinks([curId], token), fetchDownloadLinks([curId], token)])
      .then(([viewRes, downloadRes]) => {
        if (Array.isArray(viewRes) && viewRes.length) {
          const v =
            viewRes[0].shareUrl ||
            viewRes[0].viewUrl ||
            viewRes[0].imageUrl ||
            viewRes[0].url;
          setViewUrl(v || null);
        }
        if (Array.isArray(downloadRes) && downloadRes.length) {
          const d = downloadRes[0].downloadUrl || downloadRes[0].url;
          setDownloadUrl(d || null);
        }
      })
      .catch((e) => console.error("URL fetch error:", e));
  }, [currentIndex, images, token]);

  const headerMonthYear = eventDate
    ? new Date(eventDate).toLocaleString(undefined, { month: "long", year: "numeric" })
    : "";

  const goNext = () => {
    if (!images || currentIndex >= images.length - 1) return;
    setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (!images || currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
  };

  // ZOOM + PAN + SWIPE
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1,
    startMid: { x: 0, y: 0 },
    lastPan: { x: 0, y: 0 },
  });

  const containerRef = useRef(null);
  const lastTapRef = useRef(0);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  // Mouse drag
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.lastX = pan.x;
    dragRef.current.lastY = pan.y;
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.lastX + dx, y: dragRef.current.lastY + dy });
  };
  const onMouseUp = () => (dragRef.current.dragging = false);

  // Touch logic
  const SWIPE_THRESHOLD = 50;
  const getMidpoint = (t1, t2) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const onTouchStart = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap(e.touches[0]);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (!e.touches) return;
    if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const mid = getMidpoint(t1, t2);
      pinchRef.current = {
        active: true,
        startDistance: distance,
        startZoom: zoom,
        startMid: mid,
        lastPan: { ...pan },
      };
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current.startX = t.clientX;
      touchRef.current.startY = t.clientY;
      touchRef.current.swiping = true;

      if (zoom > 1) {
        dragRef.current.dragging = true;
        dragRef.current.startX = t.clientX;
        dragRef.current.startY = t.clientY;
        dragRef.current.lastX = pan.x;
        dragRef.current.lastY = pan.y;
      }
    }
  };

  const onTouchMove = (e) => {
    if (!e.touches) return;

    // Pinch zoom
    if (e.touches.length === 2 && pinchRef.current.active) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const mid = getMidpoint(t1, t2);
      const scale = distance / pinchRef.current.startDistance;
      let newZoom = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, pinchRef.current.startZoom * scale)
      );
      const zoomRatio = newZoom / pinchRef.current.startZoom;
      const newPan = {
        x:
          pinchRef.current.lastPan.x +
          (1 - zoomRatio) * (mid.x - window.innerWidth / 2),
        y:
          pinchRef.current.lastPan.y +
          (1 - zoomRatio) * (mid.y - window.innerHeight / 2),
      };
      setZoom(newZoom);
      setPan(newPan);
      return;
    }

    // Pan when zoomed
    if (zoom > 1 && dragRef.current.dragging && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      setPan({ x: dragRef.current.lastX + dx, y: dragRef.current.lastY + dy });
    }
  };

  const onTouchEnd = (e) => {
    if (pinchRef.current.active && e.touches.length < 2) {
      pinchRef.current.active = false;
    }
    if (zoom <= 1 && touchRef.current.swiping) {
      const endX = (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
      const deltaX = endX - touchRef.current.startX;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        deltaX < 0 ? goNext() : goPrev();
      }
    }
    dragRef.current.dragging = false;
    touchRef.current.swiping = false;
  };

  // --- NEW: Double click / double tap zoom handler ---
  const handleDoubleTap = (point) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = point.clientX - rect.left - rect.width / 2;
    const cy = point.clientY - rect.top - rect.height / 2;

    if (zoom === 1) {
      const newZoom = 2; // zoom in
      setZoom(newZoom);
      setPan({
        x: -cx * (newZoom - 1),
        y: -cy * (newZoom - 1),
      });
    } else {
      resetZoom();
    }
  };

  if (!state || !imageId || !images || currentIndex < 0) {
    return (
      <div className="fixed inset-0 bg-[#171312] text-white flex items-center justify-center">
        <p>No image selected.</p>
      </div>
    );
  }

  const cur = images[currentIndex];
  const curEventName = eventName || cur.event || albumName || "Untitled";
  const showMonthYear = headerMonthYear;

  return (
    <div className="fixed inset-0 bg-[#171312] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="text-[20px] font-semibold">{curEventName}</div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#C9C3BD]">{showMonthYear}</div>
          <button
            aria-label="Close"
            onClick={() => navigate(-1)}
            className="text-xl opacity-80 hover:opacity-100"
          >
            ×
          </button>
        </div>
      </header>

      {/* Main view */}
      <main className="relative flex-1 flex items-center justify-center px-4 pb-2 select-none">
        {/* Left chevron (desktop only) */}
        <button
          onClick={goPrev}
          disabled={currentIndex <= 0}
          className="absolute left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hidden lg:flex items-center justify-center hover:bg-black/85 disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Image container */}
        <div
          ref={containerRef}
          className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center bg-[#1F1A18] rounded-lg overflow-hidden touch-pan-y"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={(e) => handleDoubleTap(e.nativeEvent)}
          onWheel={(e) => {
            e.preventDefault();
            const rect = containerRef.current?.getBoundingClientRect();
            const cursorX = e.clientX - rect.left - rect.width / 2;
            const cursorY = e.clientY - rect.top - rect.height / 2;
            const zoomStep = e.deltaY > 0 ? -0.2 : 0.2;
            setZoom((prevZoom) => {
              const newZoom = Math.max(0.5, Math.min(3, +(prevZoom + zoomStep).toFixed(2)));
              const zoomRatio = newZoom / prevZoom;
              setPan((prevPan) => ({
                x: prevPan.x - cursorX * (zoomRatio - 1),
                y: prevPan.y - cursorY * (zoomRatio - 1),
              }));
              return newZoom;
            });
          }}
        >
          {/* Loading overlay */}
          {(!viewUrl || isImageLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1F1A18]/90 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-4 border-[#C9A97C]/30 border-t-[#C9A97C] animate-spin" />
                <span className="text-[#C9A97C] text-sm font-medium tracking-wide">
                  Loading image…
                </span>
              </div>
            </div>
          )}

          {/* Image */}
          {viewUrl && (
            <img
              src={viewUrl}
              alt={curEventName}
              className={`max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-150 ease-out ${
                isImageLoading ? "opacity-0" : "opacity-100"
              } select-none`}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                cursor: zoom > 1 ? "grab" : "default",
              }}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
              draggable={false}
            />
          )}
        </div>

        {/* Right chevron (desktop only) */}
        <button
          onClick={goNext}
          disabled={currentIndex >= images.length - 1}
          className="absolute right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hidden lg:flex items-center justify-center hover:bg-black/85 disabled:opacity-30"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>

        {/* Zoom controls (desktop only) */}
        <div className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 md:flex-col gap-5 hidden lg:flex">
          <button
            className="h-9 w-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/85"
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            className="h-9 w-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/85"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            className="mt-1 px-2 py-1 rounded bg-black/60 text-xs hover:bg-black/75"
            onClick={resetZoom}
            title="Reset Zoom"
          >
            100%
          </button>
        </div>
      </main>

      {/* Footer */}
      <ImageFooter
        albumId={albumId}
        albumName={albumName}
        eventDate={eventDate}
        eventName={curEventName}
        imageId={images[currentIndex].id || images[currentIndex]._id}
        viewUrl={viewUrl}
        downloadUrl={downloadUrl}
        user={user}
        token={token}
        images={images}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}
