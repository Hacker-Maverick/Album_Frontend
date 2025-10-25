// src/components/AlbumGallery.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { store } from "../../store";
import { initializeAlbumsFromUser, loadMoreImages } from "../utils/loadAlbum";
import { useNavigate, useLocation } from "react-router-dom";
import Usernav from "../components/usernav.jsx";
import Album from "../components/albumoptions";
import Select from "../components/select";

export default function AlbumGallery() {
  const user = useSelector((s) => s.user.user);
  const token = useSelector((s) => s.user.token);
  const albumsSlice = useSelector((s) => s.albums.albums);
  const [albumOptions, setAlbumOptions] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const sentinelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHiddenView = location.pathname.includes("/dashboard/hidden");
  const openHidden = location.state?.openHidden || false;

  // responsive batch size
  const getColumns = () => {
    const w = window.innerWidth;
    if (w < 640) return 4;
    if (w < 1024) return 6;
    if (w < 1440) return 8;
    return 10;
  };
  const calcBatch = () => getColumns();
  const [BATCH_SIZE, setBATCH_SIZE] = useState(calcBatch());
  useEffect(() => {
    const onResize = () => setBATCH_SIZE(calcBatch());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // load album list
  useEffect(() => {
    if (!user) {
      setAlbumOptions([]);
      setSelectedAlbum(null);
      return;
    }

    if (isHiddenView) {
      if (!openHidden) {
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 0);
        return;
      }

      const hiddenGroup = user.groups?.find(
        (g) => g.groupName?.toLowerCase() === "hidden"
      );
      if (hiddenGroup?.albumId) {
        setSelectedAlbum({
          id: hiddenGroup.albumId,
          name: hiddenGroup.groupName || "Hidden Album",
        });

        // 🧹 Optional: clear state so reloads don’t re-open automatically
        navigate("/dashboard/hidden", { replace: true, state: {} });
      }
      return;
    }


    // 🧠 If we’re here, we’re NOT on hidden route anymore
    // Reset selection to main album if the previous one was "Hidden Album"
    if (selectedAlbum?.name?.toLowerCase() === "hidden") {
      const mainAlbum = user.main_album
        ? { id: String(user.main_album), name: "Main Album" }
        : null;
      if (mainAlbum) setSelectedAlbum(mainAlbum);
    }

    // 🧱 Normal album listing
    const opts = [];
    if (user.main_album)
      opts.push({ id: String(user.main_album), name: "Main Album" });
    if (Array.isArray(user.groups)) {
      user.groups.forEach((g) => {
        if (g.albumId)
          opts.push({
            id: String(g.albumId),
            name: g.groupName || `Album-${g.albumId}`,
          });
      });
    }
    setAlbumOptions(opts);

    // 🧩 Auto-select main if none selected
    if (!selectedAlbum && opts.length) setSelectedAlbum(opts[0]);
  }, [user, location.pathname]);


  useEffect(() => {
    if (user) initializeAlbumsFromUser();
  }, [user]);

  const getAlbumFromSlice = (albumName) =>
    albumsSlice.find((a) => a.name === albumName) || null;

  const formatEventDate = (d) => {
    if (!d) return "";
    const s = typeof d === "string" ? d : String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, day] = s.split("-").map(Number);
      const date = new Date(y, m - 1, day);
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    const date = new Date(s);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // infinite scroll
  useEffect(() => {
    if (!selectedAlbum) return;
    setIsLoading(false);
    setHasMore(true);
    setSelectedImages(new Set());
    setSelectionMode(false);

    const loadInitial = async () => {
      try {
        setIsLoading(true);
        await loadMoreImages(selectedAlbum.id, selectedAlbum.name, BATCH_SIZE);
        const album = store
          .getState()
          .albums.albums.find((a) => a.name === selectedAlbum.name);
        const totalLoaded = album
          ? album.data.reduce((sum, ev) => sum + (ev.images?.length || 0), 0)
          : 0;
        setHasMore(totalLoaded >= BATCH_SIZE);
      } catch (err) {
        console.error("Initial load error:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, [selectedAlbum, BATCH_SIZE]);

  const handleLoadMore = useCallback(async () => {
    if (!selectedAlbum || isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const beforeCount = (() => {
        const a = store
          .getState()
          .albums.albums.find((alb) => alb.name === selectedAlbum.name);
        return a
          ? a.data.reduce((sum, ev) => sum + (ev.images?.length || 0), 0)
          : 0;
      })();
      await loadMoreImages(selectedAlbum.id, selectedAlbum.name, BATCH_SIZE);
      const afterCount = (() => {
        const a = store
          .getState()
          .albums.albums.find((alb) => alb.name === selectedAlbum.name);
        return a
          ? a.data.reduce((sum, ev) => sum + (ev.images?.length || 0), 0)
          : 0;
      })();
      const delta = afterCount - beforeCount;
      if (delta < BATCH_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Scroll load error:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlbum, isLoading, hasMore, BATCH_SIZE]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && hasMore) handleLoadMore();
      },
      { root: null, rootMargin: "600px", threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, isLoading]);

  const toggleImageSelection = (id) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return new Set(next);
    });
  };

  const currentAlbum = selectedAlbum
    ? getAlbumFromSlice(selectedAlbum.name)
    : null;

  const Thumbnail = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="w-full h-full bg-[#f7f3ee] rounded-lg overflow-hidden relative">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-[#efe7dd]" />
        )}
        {src && (
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
              }`}
          />
        )}
      </div>
    );
  };

  const handleCreateAlbum = async () => {
    const albumName = prompt("Enter new album name");
    if (!albumName || !albumName.trim()) return;
    if (!user) return;
    if(albumName=="Hidden" || albumName=="hidden" || albumName=="HIDDEN" || albumName=="Hidden Folder" || albumName=="hidden folder" || albumName=="HIDDEN FOLDER"){
      alert("Album name 'Hidden' is reserved. Please choose a different name.");
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/makegroup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ albumType: "group", albumName: albumName.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Album created successfully.");
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Could not create album. Please try again.");
    }
  };
  return (
    <>
      <Usernav />
      <div className="min-h-screen px-4 md:px-6 lg:px-10" style={{ background: "#FBF7F2" }}>
        {/* header */}
        <div className="flex flex-wrap gap-3 items-center justify-between z-10 top-14 sticky py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Album
              albums={
                isHiddenView
                  ? (() => {
                    const hiddenGroup = user?.groups?.find(
                      (g) => g.groupName?.toLowerCase() === "hidden"
                    );
                    return hiddenGroup?.albumId
                      ? [{ id: hiddenGroup.albumId, name: "Hidden Album" }]
                      : [];
                  })()
                  : albumOptions.filter(
                    (opt) => opt.name.toLowerCase() !== "hidden"
                  )
              }
              selectedAlbum={selectedAlbum}
              setSelectedAlbum={(album) => {
                setSelectedAlbum(album);
                setHasMore(true);
                setSelectedImages(new Set());
                setSelectionMode(false);
              }}
              clearSelection={() => {
                setSelectedImages(new Set());
                setSelectionMode(false);
              }}
            />

            {!isHiddenView && (
              <button
                onClick={handleCreateAlbum}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#e3d6c5] bg-white text-sm font-medium text-[#a0522d] hover:bg-[#f8f1ea] hover:border-[#d4b693] transition-colors shadow-sm"
              >
                <span className="text-lg leading-none font-bold">+</span>
                <span className="hidden sm:inline">Create album</span>
              </button>
            )}
          </div>

          {selectedAlbum && currentAlbum && (
            <Select
              currentAlbum={currentAlbum}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              albumId={selectedAlbum.id}
              albumName={selectedAlbum.name}
              user={user}
            />
          )}
        </div>

        {/* image grid */}
        {selectedAlbum && currentAlbum && currentAlbum.data?.length > 0 ? (
          <div className="space-y-6">
            {currentAlbum.data.map((ev, idx) => {
              const eventIds = ev.images.map(
                (imgObj, i) => imgObj.id || imgObj._id || `${idx}-${i}`
              );
              const selectedInEvent = eventIds.filter((id) =>
                selectedImages.has(id)
              );
              const allSelectedInEvent =
                eventIds.length > 0 && selectedInEvent.length === eventIds.length;

              const handleEventSelectAll = () => {
                setSelectedImages((prev) => {
                  const next = new Set(prev);
                  eventIds.forEach((id) => next.add(id));
                  return new Set(next);
                });
                setSelectionMode(true);
              };
              const handleEventDeselectAll = () => {
                setSelectedImages((prev) => {
                  const next = new Set(prev);
                  eventIds.forEach((id) => next.delete(id));
                  return new Set(next);
                });
              };

              return (
                <section
                  key={`${ev.event}-${idx}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#f0e7dd]"
                >
                  {/* header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {ev.event}
                    </h3>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <div className="text-sm text-gray-500">
                        {formatEventDate(ev.date)}
                      </div>

                      {selectedInEvent.length > 0 && (
                        <button
                          onClick={
                            allSelectedInEvent
                              ? handleEventDeselectAll
                              : handleEventSelectAll
                          }
                          className="px-3 py-1.5 rounded-full border border-[#e3d6c5] bg-white text-xs sm:text-sm font-medium text-[#6b4c2f] hover:bg-[#f8f1ea] hover:border-[#d4b693] transition-colors"
                        >
                          {allSelectedInEvent ? "Deselect all" : "Select all"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                    {ev.images.map((imgObj, i) => {
                      const idKey =
                        imgObj.id || imgObj._id || `${idx}-${i}`;
                      const thumb =
                        imgObj.thumbnailUrl || imgObj.thumbnailKey;
                      const isSelected = selectedImages.has(idKey);
                      return (
                        <div
                          key={idKey}
                          onClick={(e) => {
                            if (selectionMode || selectedImages.size > 0) {
                              toggleImageSelection(idKey);
                              e.stopPropagation();
                            } else {
                              const stateToPass = {
                                imageId: idKey,
                                albumId: selectedAlbum.id,
                                albumName: selectedAlbum.name,
                                eventName: ev.event,
                                eventDate: ev.date,
                                images: ev.images,
                              };
                              sessionStorage.setItem(
                                "imageViewState",
                                JSON.stringify(stateToPass)
                              );
                              navigate(`/imageview/${idKey}`, {
                                state: stateToPass,
                              });
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setSelectionMode(true);
                            toggleImageSelection(idKey);
                          }}
                          className={`aspect-square rounded-lg relative cursor-pointer border-2 ${isSelected
                              ? "border-[#C9A97C] ring-2 ring-[#C9A97C]"
                              : "border-transparent"
                            }`}
                        >
                          <Thumbnail src={thumb} alt={`${ev.event}-${i}`} />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-[#C9A97C] text-white text-xs px-2 py-1 rounded-full">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            <div ref={sentinelRef} className="h-6" />
          </div>
        ) : (
          <div className="text-center text-gray-600 py-10">
            {isLoading ? "Loading..." : "No images found."}
          </div>
        )}

        <div className="flex justify-center py-6">
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <svg
                className="animate-spin h-5 w-5 text-[#C9A97C]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span>Loading...</span>
            </div>
          ) : !hasMore ? (
            <div className="text-gray-500">🎉 All images loaded.</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
