// src/components/AlbumGallery.jsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { store } from "../../store";
import { initializeAlbumsFromUser, loadMoreImages } from "../utils/loadAlbum";
import { useNavigate, useLocation } from "react-router-dom";

// 🧱 Modular Components
import Album from "../components/albumoptions";
import Select from "../components/select";

export default function AlbumGallery() {
    const user = useSelector((s) => s.user.user);
    const albumsSlice = useSelector((s) => s.albums.albums);
    const [albumOptions, setAlbumOptions] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImages, setSelectedImages] = useState(new Set());

    const sentinelRef = useRef(null);
    const observerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isHiddenView = location.pathname.includes("/dashboard/hidden");

    // 🧠 Load album list
    useEffect(() => {
        if (!user) {
            setAlbumOptions([]);
            setSelectedAlbum(null);
            return;
        }

        // Hidden Album route
        if (isHiddenView) {
            const hiddenGroup = user.groups?.find(
                (g) => g.groupName?.toLowerCase() === "hidden"
            );
            if (hiddenGroup?.albumId) {
                if (selectedAlbum?.id === hiddenGroup.albumId) return;
                setSelectedAlbum({
                    id: hiddenGroup.albumId,
                    name: hiddenGroup.groupName,
                });
            }
            return;
        }

        // Normal Albums
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
        if (!selectedAlbum && opts.length) setSelectedAlbum(opts[0]);
    }, [user, location.pathname]);

    useEffect(() => {
        if (user) initializeAlbumsFromUser();
    }, [user]);

    // 🧠 Utility functions
    const getAlbumFromSlice = (albumName) =>
        albumsSlice.find((a) => a.name === albumName) || null;

    const isAlbumFullyLoaded = (albumName) => {
        const album = getAlbumFromSlice(albumName);
        if (!album || !Array.isArray(album.data) || album.data.length === 0)
            return false;
        return album.data.every((ev) => {
            const loaded = Number(ev.loaded ?? (ev.images ? ev.images.length : 0));
            const total = Number(ev.total ?? 0);
            return total > 0 && loaded >= total;
        });
    };

    const getColumns = () => {
        const w = window.innerWidth;
        if (w < 640) return 4;
        if (w < 1024) return 6;
        if (w < 1440) return 8;
        return 10;
    };

    const getDynamicBatch = () => getColumns() * 2;

    // 🧠 Load album images
    useEffect(() => {
        if (!selectedAlbum) return;

        const albumInSlice = getAlbumFromSlice(selectedAlbum.name);
        const needsInitial =
            !initialLoaded && (!albumInSlice || albumInSlice.data.length === 0);

        if (needsInitial) {
            (async () => {
                try {
                    setIsLoading(true);
                    const beforeState = store.getState().albums.albums;
                    const beforeAlbum = beforeState.find(
                        (a) => a.name === selectedAlbum.name
                    );
                    const beforeCount = beforeAlbum
                        ? beforeAlbum.data.reduce(
                            (acc, ev) => acc + (ev.images?.length || 0),
                            0
                        )
                        : 0;

                    await loadMoreImages(selectedAlbum.id, selectedAlbum.name, 5);

                    const afterState = store.getState().albums.albums;
                    const afterAlbum = afterState.find(
                        (a) => a.name === selectedAlbum.name
                    );
                    const afterCount = afterAlbum
                        ? afterAlbum.data.reduce(
                            (acc, ev) => acc + (ev.images?.length || 0),
                            0
                        )
                        : 0;

                    setHasMore(afterCount - beforeCount >= 5);
                    setInitialLoaded(true);
                } catch (err) {
                    console.error("Initial load error:", err);
                    setHasMore(false);
                } finally {
                    setIsLoading(false);
                }
            })();
        } else {
            setHasMore(!isAlbumFullyLoaded(selectedAlbum.name));
        }
    }, [selectedAlbum]);

    // 🧠 Infinite Scroll
    const handleLoadMore = useCallback(
        async (batch = null) => {
            if (!selectedAlbum || isLoading || !hasMore) return;
            const n = batch ?? getDynamicBatch();

            try {
                setIsLoading(true);
                const beforeState = store.getState().albums.albums;
                const beforeAlbum = beforeState.find(
                    (a) => a.name === selectedAlbum.name
                );
                const beforeCount = beforeAlbum
                    ? beforeAlbum.data.reduce(
                        (acc, ev) => acc + (ev.images?.length || 0),
                        0
                    )
                    : 0;

                await loadMoreImages(selectedAlbum.id, selectedAlbum.name, n);

                const afterState = store.getState().albums.albums;
                const afterAlbum = afterState.find(
                    (a) => a.name === selectedAlbum.name
                );
                const afterCount = afterAlbum
                    ? afterAlbum.data.reduce(
                        (acc, ev) => acc + (ev.images?.length || 0),
                        0
                    )
                    : 0;

                setHasMore(afterCount - beforeCount >= n);
            } catch (err) {
                console.error("Error loading more images:", err);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        },
        [selectedAlbum, isLoading, hasMore]
    );

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        if (!sentinelRef.current || !hasMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const e = entries[0];
                if (e?.isIntersecting && !isLoading && hasMore) {
                    handleLoadMore();
                }
            },
            { root: null, rootMargin: "400px", threshold: 0.25 }
        );
        observerRef.current.observe(sentinelRef.current);

        return () => observerRef.current?.disconnect();
    }, [handleLoadMore, hasMore, isLoading]);

    // 🧠 Toggle image selection
    const toggleImageSelection = (id) => {
        setSelectedImages((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // 🧠 Get current album data
    const currentAlbum = selectedAlbum
        ? getAlbumFromSlice(selectedAlbum.name)
        : null;

    // 🧠 Thumbnail component
    const Thumbnail = ({ src, alt }) => {
        const [loaded, setLoaded] = useState(false);
        return (
            <div className="w-full h-full bg-[#f7f3ee] rounded-lg overflow-hidden relative">
                {!loaded && <div className="absolute inset-0 animate-pulse bg-[#efe7dd]" />}
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

    // 🧠 Render
    return (
        <div className="min-h-screen px-4 md:px-6 lg:px-10" style={{ background: "#FBF7F2" }}>
            {/* 🎛️ Album list + Select panel */}
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between z-10 top-0 sticky py-4 md:py-6 lg:py-8 ">
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
                        setInitialLoaded(false);
                        setHasMore(true);
                        setSelectedImages(new Set());
                    }}
                    clearSelection={() => setSelectedImages(new Set())}
                />


                {selectedAlbum && currentAlbum && (
                    <Select
                        currentAlbum={currentAlbum}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        albumId={selectedAlbum.id}
                        albumName={selectedAlbum.name}
                        user={user}
                        token={user?.token}
                    />
                )}
            </div>

            {/* 🖼️ Image Grid */}
            {selectedAlbum && currentAlbum && currentAlbum.data?.length > 0 ? (
                <div className="space-y-8">
                    {currentAlbum.data.map((ev, idx) => (
                        <section
                            key={`${ev.event}-${idx}`}
                            className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#f0e7dd]"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">{ev.event}</h3>
                                <div className="text-sm text-gray-500">
                                    {ev.date
                                        ? new Date(ev.date).toLocaleString(undefined, {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : ""}
                                </div>
                            </div>

                            <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                                {ev.images.map((imgObj, i) => {
                                    const idKey = imgObj.id || imgObj._id || `${idx}-${i}`;
                                    const thumb = imgObj.thumbnailUrl || imgObj.thumbnailKey;
                                    const isSelected = selectedImages.has(idKey);

                                    return (
                                        <div
                                            key={idKey}
                                            onClick={(e) => {
                                                if (selectedImages.size > 0) {
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
                                                    navigate(`/imageview/${idKey}`, { state: stateToPass });
                                                }
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
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
                    ))}
                    <div ref={sentinelRef} className="h-6" />
                </div>
            ) : (
                <div className="text-center text-gray-600 py-10">
                    {isLoading ? "Loading..." : "No images found."}
                </div>
            )}

            {/* Infinite scroll footer */}
            <div className="mt-8 flex justify-center">
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
                    <div className="text-gray-500">🎉 All events and images loaded.</div>
                ) : null}
            </div>
        </div>
    );
}
