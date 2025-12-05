import { useState, useEffect, useRef } from "react";
import { deleteAlbumSoft } from "../utils/albumdelete.js";
import { store } from "../../store";

export default function Album({
    albums = [],
    selectedAlbum,
    setSelectedAlbum,
    clearSelection,
}) {
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        album: null,
    });

    const [renameModal, setRenameModal] = useState({
        open: false,
        album: null,
        newName: "",
    });

    const [confirmDelete, setConfirmDelete] = useState({
        open: false,
        album: null,
        hasImages: false,
    });

    /* 🧠 Handle right-click */
    const handleAlbumContextMenu = (e, album) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            album,
        });
    };

    // long-press support for touch devices
    const longPressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const startLongPress = (touch, album) => {
        // begin 600ms long-press timer
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        longPressTimer.current = setTimeout(() => {
            // simulate context menu using touch coords
            setContextMenu({
                visible: true,
                x: touch.clientX,
                y: touch.clientY,
                album,
            });
        }, 600);
    };

    const cancelLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };


    /* 🧠 Handle actions */
    const handleAction = async (action) => {
        const album = contextMenu.album;
        setContextMenu({ visible: false });

        if (!album) return;

        if (action === "Rename Album") {
            // open rename modal
            setRenameModal({ open: true, album, newName: album.name });
        }

        if (action === "Delete Album") {
            // Check if album has any images — from album data structure (if available)
            const hasImages = Boolean(album?.data?.some(ev => ev.images?.length > 0));
            setConfirmDelete({ open: true, album, hasImages });
        }
    };

    /* 🧠 Close menu when clicking elsewhere */
    useEffect(() => {
        const closeMenu = () => setContextMenu((prev) => ({ ...prev, visible: false }));
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    /* 🧱 API: Rename Album */
    const renameAlbum = async () => {
        try {
            const token = store.getState().user?.token;
            if (!token) throw new Error("Authentication token missing.");

            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await fetch(`${API_URL}/album/rename`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    albumId: renameModal.album.id,
                    newName: renameModal.newName.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data?.message || "Failed to rename album.";
                throw new Error(msg);
            }

            alert(data.message || "Album renamed successfully.");
            window.location.reload();
        } catch (err) {
            console.error("Rename error:", err);
            alert(err.message || "An unexpected error occurred while renaming.");
        } finally {
            setRenameModal({ open: false, album: null, newName: "" });
        }
    };


    /* 🧱 API: Delete Album */
    const confirmAlbumDelete = async () => {
        try {
            if (!confirmDelete.album)
                throw new Error("No album selected for deletion.");

            const albumId = confirmDelete.album.id;
            const mainAlbumId = store.getState().user?.user.main_album;

            if (String(albumId) === String(mainAlbumId)) {
                alert("⚠️ You cannot delete your Main Album.");
                return;
            }

            // Proceed to delete
            const result = await deleteAlbumSoft(albumId);

            console.log("Delete result:", result);
            if (!result || result.error) {
                const msg =
                    result?.message ||
                    result?.error ||
                    "Unexpected error occurred while deleting album.";
                throw new Error(msg);
            }

            alert("✅ Album deleted successfully.");
            window.location.reload();
        } catch (err) {
            // Show backend message or fallback
            const message = err.message || "An unexpected error occurred while deleting the album.";
            console.log(`${message}`);
        } finally {
            setConfirmDelete({ open: false, album: null, hasImages: false });
        }
    };

    if (!albums || albums.length === 0) {
        return <div className="text-gray-600 text-center py-4">No albums available</div>;
    }

    return (
        <>
            {/* 🧭 Album Buttons */}
            <div className="flex flex-wrap gap-3">
                {albums.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => {
                            setSelectedAlbum(opt);
                            clearSelection?.();
                        }}
                        onContextMenu={(e) => handleAlbumContextMenu(e, opt)}
                        onTouchStart={(e) => {
                            // start long-press using first touch point
                            const t = e.touches ? e.touches[0] : e;
                            startLongPress(t, opt);
                        }}
                        onTouchMove={() => {
                            // cancel if finger moves
                            cancelLongPress();
                        }}
                        onTouchEnd={() => {
                            cancelLongPress();
                        }}
                        onTouchCancel={() => {
                            cancelLongPress();
                        }}
                        className={`w-full text-left flex items-center justify-between gap-3 px-3 py-3 rounded-md text-sm font-medium transition ${selectedAlbum && selectedAlbum.id === opt.id
                            ? "bg-white border border-[#e9e1d6] shadow-sm text-gray-900"
                            : "bg-white text-gray-700 border border-[#f0e7dd] hover:bg-[#fff8f2]"
                            }`}

                    >

                        {opt.name}
                    </button>
                ))}
            </div>

            {/* 🎛️ Context Menu */}
            {contextMenu.visible && (
                <div
                    style={{
                        position: "fixed",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        zIndex: 1000,
                        padding: "4px 0",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {["Rename Album", "Delete Album"].map((opt) => (
                        <div
                            key={opt}
                            onClick={() => handleAction(opt)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            {/* ✏️ Rename Modal */}
            {renameModal.open && (
                <ModalOverlay>
                    <div className="bg-white rounded-xl w-[380px] max-w-[90vw] p-5 shadow-xl">
                        <h3 className="text-lg font-semibold mb-3">Rename Album</h3>
                        <input
                            type="text"
                            value={renameModal.newName}
                            onChange={(e) =>
                                setRenameModal((prev) => ({ ...prev, newName: e.target.value }))
                            }
                            className="border rounded w-full px-3 py-2 text-sm mb-4"
                            placeholder="Enter new album name"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-2 rounded border hover:bg-gray-100"
                                onClick={() => setRenameModal({ open: false, album: null, newName: "" })}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-2 rounded bg-[#C9A97C] text-black hover:bg-[#e1bf8a]"
                                onClick={renameAlbum}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* 🗑️ Delete Confirmation Modal */}
            {confirmDelete.open && (
                <ModalOverlay>
                    <div className="bg-white rounded-xl w-[380px] max-w-[90vw] p-5 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Delete Album</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{confirmDelete.album?.name}</span>?
                            {confirmDelete.hasImages && (
                                <span className="block mt-2 text-red-500">
                                    ⚠️ This will also remove all images in this album.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-2 rounded border hover:bg-gray-100"
                                onClick={() =>
                                    setConfirmDelete({ open: false, album: null, hasImages: false })
                                }
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                onClick={confirmAlbumDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </>
    );
}

/* 🪶 Modal Wrapper */
const ModalOverlay = ({ children }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
        {children}
    </div>
);
