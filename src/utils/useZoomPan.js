import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/**
 * Zoom/Pan/Swipe/Pinch for images-like media.
 * Always call this hook unconditionally in your component.
 */
export function useZoomPan({ onSwipeLeft, onSwipeRight } = {}) {
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
  const lastTapRef = useRef(0);
  const containerRef = useRef(null);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;
  const SWIPE_THRESHOLD = 50;

  // --- Zoom Controls ---
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))),
    []
  );
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // --- Mouse Drag ---
  const onMouseDown = useCallback(
    (e) => {
      if (zoom <= 1) return;
      dragRef.current.dragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.lastX = pan.x;
      dragRef.current.lastY = pan.y;
    },
    [zoom, pan.x, pan.y]
  );

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.lastX + dx, y: dragRef.current.lastY + dy });
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);

  // --- Mouse Wheel Zoom ---
  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left - rect.width / 2;
      const cursorY = e.clientY - rect.top - rect.height / 2;
      const step = e.deltaY > 0 ? -0.2 : 0.2;

      setZoom((prevZoom) => {
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +(prevZoom + step).toFixed(2)));
        const zoomRatio = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: prevPan.x - cursorX * (zoomRatio - 1),
          y: prevPan.y - cursorY * (zoomRatio - 1),
        }));
        return newZoom;
      });
    },
    []
  );

  // --- Touch helpers ---
  const getMidpoint = useCallback((t1, t2) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  }), []);

  const handleDoubleTap = useCallback(
    (point) => {
      const cx = point.clientX - window.innerWidth / 2;
      const cy = point.clientY - window.innerHeight / 2;
      if (zoom === 1) {
        const newZoom = 2;
        setZoom(newZoom);
        setPan({ x: -cx * (newZoom - 1), y: -cy * (newZoom - 1) });
      } else {
        resetZoom();
      }
    },
    [zoom, resetZoom]
  );

  const onTouchStart = useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // double tap
        if (e.touches && e.touches[0]) handleDoubleTap(e.touches[0]);
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
    },
    [zoom, pan, getMidpoint, handleDoubleTap]
  );

  const onTouchMove = useCallback(
    (e) => {
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
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchRef.current.startZoom * scale));
        const zoomRatio = newZoom / pinchRef.current.startZoom;
        const newPan = {
          x: pinchRef.current.lastPan.x + (1 - zoomRatio) * (mid.x - window.innerWidth / 2),
          y: pinchRef.current.lastPan.y + (1 - zoomRatio) * (mid.y - window.innerHeight / 2),
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
    },
    [zoom, getMidpoint]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (pinchRef.current.active && e.touches.length < 2) {
        pinchRef.current.active = false;
      }
      if (zoom <= 1 && touchRef.current.swiping) {
        const endX = (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
        const deltaX = endX - touchRef.current.startX;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          deltaX < 0 ? onSwipeLeft?.() : onSwipeRight?.();
        }
      }
      dragRef.current.dragging = false;
      touchRef.current.swiping = false;
    },
    [zoom, onSwipeLeft, onSwipeRight]
  );

  // Memoize the return shape so parent props don’t thrash
  return useMemo(
    () => ({
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
      setZoom,
      setPan,
    }),
    [
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
    ]
  );
}
