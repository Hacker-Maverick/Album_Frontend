import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { store } from "../../store";
import { initializeAlbumsFromUser, loadMoreImages } from "../utils/loadAlbum";
import { useNavigate } from "react-router-dom";

export default function AlbumGallery() {
    const user = useSelector((s) => s.user.user);
    const albumsSlice = useSelector((s) => s.albums.albums);
    const [albumOptions, setAlbumOptions] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef(null);
    const observerRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setAlbumOptions([]);
            setSelectedAlbum(null);
            return;
        }
        const opts = [];
        if (user.main_album) opts.push({ id: String(user.main_album), name: "Main Album" });
        if (Array.isArray(user.groups)) {
            user.groups.forEach((g) => {
                if (g.albumId) {
                    const name = g.groupName || `Album-${String(g.albumId)}`;
                    opts.push({ id: String(g.albumId), name });
                }
            });
        }
        setAlbumOptions(opts);
        if (!selectedAlbum && opts.length) setSelectedAlbum(opts[0]);
    }, [user]);

    useEffect(() => {
        if (user) initializeAlbumsFromUser();
    }, [user]);

    const getAlbumFromSlice = (albumName) => albumsSlice.find((a) => a.name === albumName) || null;

    const isAlbumFullyLoaded = (albumName) => {
        const album = getAlbumFromSlice(albumName);
        if (!album || !Array.isArray(album.data) || album.data.length === 0) return false;
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
    const getDynamicBatch = () => {
        const cols = getColumns();
        return cols * 2;
    };

    useEffect(() => {
        if (!selectedAlbum) return;

        const albumInSlice = getAlbumFromSlice(selectedAlbum.name);
        const needsInitial = !initialLoaded && (!albumInSlice || albumInSlice.data.length === 0);

        if (needsInitial) {
            (async () => {
                try {
                    setIsLoading(true);
                    const beforeState = store.getState().albums.albums;
                    const beforeAlbum = beforeState.find((a) => a.name === selectedAlbum.name);
                    const beforeCount = beforeAlbum ? beforeAlbum.data.reduce((acc, ev) => acc + (ev.images?.length || 0), 0) : 0;

                    await loadMoreImages(selectedAlbum.id, selectedAlbum.name, 5);

                    const afterState = store.getState().albums.albums;
                    const afterAlbum = afterState.find((a) => a.name === selectedAlbum.name);
                    const afterCount = afterAlbum ? afterAlbum.data.reduce((acc, ev) => acc + (ev.images?.length || 0), 0) : 0;

                    const delta = afterCount - beforeCount;
                    if (delta < 5) setHasMore(false);
                    else setHasMore(true);

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

    const handleLoadMore = useCallback(
        async (batch = null) => {
            if (!selectedAlbum || isLoading || !hasMore) return;
            const n = batch ?? getDynamicBatch();

            try {
                setIsLoading(true);
                const beforeState = store.getState().albums.albums;
                const beforeAlbum = beforeState.find((a) => a.name === selectedAlbum.name);
                const beforeCount = beforeAlbum ? beforeAlbum.data.reduce((acc, ev) => acc + (ev.images?.length || 0), 0) : 0;

                await loadMoreImages(selectedAlbum.id, selectedAlbum.name, n);

                const afterState = store.getState().albums.albums;
                const afterAlbum = afterState.find((a) => a.name === selectedAlbum.name);
                const afterCount = afterAlbum ? afterAlbum.data.reduce((acc, ev) => acc + (ev.images?.length || 0), 0) : 0;

                const delta = afterCount - beforeCount;
                if (delta < n) {
                    setHasMore(false);
                } else {
                    if (isAlbumFullyLoaded(selectedAlbum.name)) setHasMore(false);
                }
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
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (!sentinelRef.current) return;
        if (!hasMore) return;
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

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [handleLoadMore, hasMore, isLoading]);

    const Thumbnail = ({ src, alt }) => {
        const [loaded, setLoaded] = useState(false);
        return (
            <div className="w-full h-full bg-[#f7f3ee] rounded-lg overflow-hidden relative">
                {!loaded && <div className="absolute inset-0 animate-pulse bg-[#efe7dd]" />}
                {src ? (
                    <img
                        src={src}
                        alt={alt || "thumb"}
                        onLoad={() => setLoaded(true)}
                        onError={() => setLoaded(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
                        loading="lazy"
                    />
                ) : null}
            </div>
        );
    };

    const currentAlbum = selectedAlbum ? getAlbumFromSlice(selectedAlbum.name) : null;

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-10" style={{ background: "#FBF7F2" }}>
            <div className="flex flex-wrap gap-3 mb-6">
                {albumOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => {
                            setSelectedAlbum(opt);
                            setInitialLoaded(false);
                            setHasMore(true);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${selectedAlbum && selectedAlbum.id === opt.id ? "bg-[#C9A97C] text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-[#fff8f2]"
                            }`}
                    >
                        {opt.name}
                    </button>
                ))}
            </div>

            {!selectedAlbum && <div className="text-center text-gray-600 py-20">No albums available</div>}

            {selectedAlbum && (
                <>
                    {!currentAlbum || !currentAlbum.data || currentAlbum.data.length === 0 ? (
                        <div className="text-center text-gray-600 py-10">{isLoading ? "Loading thumbnails..." : "No images to load."}</div>
                    ) : (
                        <div className="space-y-8">
                            {currentAlbum.data.map((ev, idx) => (
                                <section key={`${ev.event}-${idx}`} className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#f0e7dd]">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{ev.event}</h3>
                                        <div className="text-sm text-gray-500">{ev.date ? new Date(ev.date).toLocaleString(undefined, { month: "long", year: "numeric" }) : ""}</div>
                                    </div>

                                    <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                                        {ev.images && ev.images.length > 0 ? (
                                            ev.images.map((imgObj, i) => {
                                                const thumb = imgObj.thumbnailUrl || imgObj.thumbnailKey || imgObj.images?.thumbnailKey || null;
                                                const idKey = imgObj.id || imgObj._id || `${selectedAlbum.id}-${idx}-${i}`;

                                                return (
                                                    <div
                                                        key={idKey}
                                                        className="aspect-square rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            const stateToPass = {
                                                                imageId: idKey,
                                                                albumId: selectedAlbum.id,
                                                                albumName: selectedAlbum.name,
                                                                eventName: ev.event,
                                                                eventDate: ev.date,
                                                                images: ev.images,
                                                            };

                                                            // 💾 Store state in sessionStorage for refresh/reload recovery
                                                            sessionStorage.setItem("imageViewState", JSON.stringify(stateToPass));

                                                            // ✅ Navigate with state
                                                            navigate(`/imageview/${idKey}`, { state: stateToPass });
                                                        }}

                                                    >
                                                        <Thumbnail src={thumb} alt={`${ev.event}-${i}`} />
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                                                    <div className="w-full h-full animate-pulse bg-[#efe7dd]" />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            ))}

                            <div ref={sentinelRef} className="h-6" />
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        {isLoading ? (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <svg
                                    className="animate-spin h-5 w-5 text-[#C9A97C]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <span>Loading...</span>
                            </div>
                        ) : !hasMore ? (
                            <div className="text-gray-500">🎉 All events and images loaded.</div>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}
