// src/components/Select.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Download,
  Tag,
  Pencil,
  FolderInput,
  Copy,
  Trash2,
  CheckCircle,
} from "lucide-react";
import TagShare from "../components/TagShare";
import { deleteImages } from "../utils/deleteImages";
import { editImages } from "../utils/editImages";
import { fetchDownloadLinks } from "../utils/downloadlink";

export default function Select({
  currentAlbum,
  selectedImages,
  setSelectedImages,
  albumId,
  albumName,
  user,
}) {
  const navigate = useNavigate();

  /* ---------------- USER ALBUM LIST ---------------- */
  const userAlbums = [];
  if (user?.main_album)
    userAlbums.push({ id: String(user.main_album), name: "Main Album" });
  if (Array.isArray(user?.groups)) {
    user.groups.forEach((g) => {
      if (g.albumId)
        userAlbums.push({
          id: String(g.albumId),
          name: g.groupName || `Album-${g.albumId}`,
        });
    });
  }

  /* ---------------- LOCAL STATES ---------------- */
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [eventModal, setEventModal] = useState({ open: false, mode: "", albums: [] });
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [copySelection, setCopySelection] = useState([]);
  const [deleteChoiceOpen, setDeleteChoiceOpen] = useState(false);
  const [permConfirmOpen, setPermConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- SELECTION LOGIC ---------------- */
  const totalImages =
    currentAlbum?.data?.reduce(
      (sum, ev) => sum + (ev.images?.length || 0),
      0
    ) || 0;

  const allSelected = selectedImages.size === totalImages && totalImages > 0;

  const handleSelectAll = () => {
    if (!currentAlbum?.data) return;
    if (allSelected) {
      setSelectedImages(new Set());
      return;
    }

    const allIds = [];
    currentAlbum.data.forEach((ev) =>
      ev.images?.forEach((img) => allIds.push(img._id || img.id))
    );
    setSelectedImages(new Set(allIds));
  };

  /* ---------------- ACTIONS ---------------- */

  // ✅ FIXED: Awaiting download link fetch
const handleDownload = async () => {
  const ids = Array.from(selectedImages);
  if (!ids.length) return alert("Please select images to download.");

  try {
    const response = await fetchDownloadLinks(ids);
    const urls = response
      .map((item) => item.downloadUrl || item.url || "")
      .filter((u) => typeof u === "string" && u.trim() !== "");

    if (!urls.length) return alert("No downloadable links found.");

    // Single image → direct download
    if (urls.length === 1) {
      const link = document.createElement("a");
      link.href = urls[0];
      link.download = "";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Multiple images → zip them
    const zip = new JSZip();
    for (const [i, url] of urls.entries()) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const ext = (url.split("?")[0].split(".").pop() || "jpg").split(/[?#]/)[0];
        zip.file(`image_${i + 1}.${ext}`, blob);
      } catch {}
    }

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    saveAs(zipBlob, `Albumify_${Date.now()}.zip`);
  } catch {
    alert("Failed to download images.");
  }
};

  const handleChangeEventDate = () => {
    const ids = Array.from(selectedImages);
    if (!ids.length) return;
    navigate("/edit", {
      state: {
        imageIds: ids,
        albumIds: [albumId],
        albumId,
        eventName: currentAlbum?.data?.[0]?.event || "",
        eventDate: currentAlbum?.data?.[0]?.date || "",
      },
    });
  };

  // ✅ FIXED: Move now passes only the target album, not current
  const openMovePopup = (targetAlbumId) => {
    if (!targetAlbumId) return;
    setEventModal({
      open: true,
      mode: "move",
      albums: [targetAlbumId], // ✅ only target album
    });
  };

  // ✅ FIXED: Copy now passes only target albums
  const openCopyPopup = (targetAlbums) => {
    if (!Array.isArray(targetAlbums) || targetAlbums.length === 0) return;
    setEventModal({
      open: true,
      mode: "copy",
      albums: targetAlbums, // ✅ no default current album
    });
  };

  const confirmEventAction = async () => {
    if (!eventName || !eventDate) {
      alert("Please enter both event name and date.");
      return;
    }

    try {
      await editImages({
        albumIds: eventModal.albums,
        imageIds: Array.from(selectedImages),
        event: eventName,
        date: eventDate,
      });

      setEventModal({ open: false, mode: "", albums: [] });
      setEventName("");
      setEventDate("");
      setCopySelection([]);
      window.location.reload();
    } catch (err) {
      console.error("editImages failed:", err);
      alert("Failed to complete action.");
    }
  };

  const toggleCopy = (id) =>
    setCopySelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const deleteFromAlbum = async (permanent = false) => {
    if (!selectedImages.size) return;
    setDeleting(true);
    try {
      await deleteImages(albumId, Array.from(selectedImages), permanent);
      setDeleting(false);
      setDeleteChoiceOpen(false);
      setPermConfirmOpen(false);
      setSelectedImages(new Set());
      window.location.reload();
    } catch {
      setDeleting(false);
      alert("Delete failed");
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => setIsActionMenuOpen(false);
    if (isActionMenuOpen)
      window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isActionMenuOpen]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex items-center gap-2 relative z-40">
      <button
        onClick={handleSelectAll}
        className="px-4 py-2 rounded-lg bg-[#F3EADF] hover:bg-[#EADFCF] text-sm font-medium text-gray-800"
      >
        {allSelected ? "Deselect All" : "Select All"}
      </button>

      {selectedImages.size > 0 && (
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsActionMenuOpen((prev) => !prev);
            }}
          >
            ⋮
          </button>

          {isActionMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
              <MenuItem
                icon={<Download size={15} />}
                label="Download"
                onClick={handleDownload}
              />
              <MenuItem
                icon={<Pencil size={15} />}
                label="Change Event/Date"
                onClick={handleChangeEventDate}
              />
              <MenuItem
                icon={<FolderInput size={15} />}
                label="Move to Album"
                onClick={() => setMoveOpen(true)}
              />
              <MenuItem
                icon={<Copy size={15} />}
                label="Copy to Album"
                onClick={() => setCopyOpen(true)}
              />
              <MenuItem
                icon={<Tag size={15} />}
                label="Tag Someone"
                onClick={() => setTagOpen(true)}
              />
              <MenuItem
                icon={<Trash2 size={15} />}
                label="Delete"
                onClick={() => setDeleteChoiceOpen(true)}
                danger
              />
            </div>
          )}
        </div>
      )}

      {/* Tag Modal */}
      {tagOpen && (
        <ModalOverlay>
          <TagShare
            imageIds={Array.from(selectedImages)}
            onClose={() => setTagOpen(false)}
          />
        </ModalOverlay>
      )}

      {/* Move */}
      {moveOpen && (
        <DropdownList
          title="Move to Album"
          list={userAlbums}
          currentId={albumId}
          onSelect={(targetId) => {
            setMoveOpen(false);
            openMovePopup(targetId);
          }}
          onClose={() => setMoveOpen(false)}
        />
      )}

      {/* Copy */}
      {copyOpen && (
        <DropdownCheckboxList
          title="Copy to Album"
          list={userAlbums}
          selection={copySelection}
          toggle={toggleCopy}
          confirm={() => {
            setCopyOpen(false);
            openCopyPopup(copySelection);
          }}
          currentId={albumId}
          onClose={() => setCopyOpen(false)}
        />
      )}

      {/* Event/Date modal */}
      {eventModal.open && (
        <ModalOverlay>
          <div className="bg-white rounded-xl w-[420px] max-w-[90vw] p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-3 capitalize">
              {eventModal.mode} Images
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Enter event name and date for selected images.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded border hover:bg-gray-100"
                onClick={() => setEventModal({ open: false, mode: "", albums: [] })}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-[#C9A97C] text-black hover:bg-[#e1bf8a]"
                onClick={confirmEventAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Delete modals */}
      {deleteChoiceOpen && (
        <ModalOverlay>
          <div className="bg-white rounded-xl w-[420px] max-w-[90vw] p-5 shadow-xl">
            <div className="text-lg font-semibold mb-2">Delete Images</div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete {selectedImages.size} image(s) from{" "}
              <span className="font-medium">{albumName}</span>?
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                className="px-3 py-2 rounded border"
                onClick={() => setDeleteChoiceOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-gray-200"
                onClick={() => deleteFromAlbum(false)}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  setDeleteChoiceOpen(false);
                  setPermConfirmOpen(true);
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {permConfirmOpen && (
        <ModalOverlay>
          <div className="bg-white rounded-xl w-[420px] max-w-[90vw] p-5 shadow-xl">
            <div className="text-lg font-semibold mb-2">
              Confirm Permanent Delete
            </div>
            <p className="text-sm text-gray-700 mb-3">
              This will permanently delete all selected images.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded border"
                onClick={() => setPermConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => deleteFromAlbum(true)}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ---------------- SUBCOMPONENTS ---------------- */

const MenuItem = ({ icon, label, onClick, danger }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
      danger ? "text-red-500" : "text-gray-800"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const DropdownList = ({ title, list, onSelect, currentId, onClose }) => (
  <ModalOverlay>
    <div className="bg-white rounded-xl w-[380px] max-w-[90vw] p-5 shadow-xl">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="max-h-56 overflow-auto space-y-1">
        {list.map((alb) => (
          <li
            key={alb.id}
            onClick={() => onSelect(alb.id)}
            className={`px-3 py-2 flex justify-between items-center rounded hover:bg-gray-100 cursor-pointer ${
              alb.id === String(currentId)
                ? "text-[#C9A97C]"
                : "text-gray-800"
            }`}
          >
            <span>{alb.name}</span>
            {alb.id === String(currentId) && <CheckCircle size={14} />}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <button
          className="px-3 py-1 rounded border hover:bg-gray-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </ModalOverlay>
);

const DropdownCheckboxList = ({
  title,
  list,
  selection,
  toggle,
  confirm,
  currentId,
  onClose,
}) => (
  <ModalOverlay>
    <div className="bg-white rounded-xl w-[380px] max-w-[90vw] p-5 shadow-xl">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="max-h-56 overflow-auto space-y-1">
        {list.map((alb) => (
          <li
            key={alb.id}
            onClick={() => toggle(alb.id)}
            className={`px-3 py-2 flex justify-between items-center rounded hover:bg-gray-100 cursor-pointer ${
              alb.id === String(currentId)
                ? "text-[#C9A97C]"
                : "text-gray-800"
            }`}
          >
            <span>{alb.name}</span>
            <input
              type="checkbox"
              checked={selection.includes(alb.id)}
              onChange={() => toggle(alb.id)}
            />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end gap-2">
        <button
          className="px-3 py-1 rounded border hover:bg-gray-100"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 rounded bg-[#C9A97C] text-black hover:bg-[#e1bf8a]"
          onClick={confirm}
          disabled={!selection.length}
        >
          Confirm
        </button>
      </div>
    </div>
  </ModalOverlay>
);

const ModalOverlay = ({ children }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
    {children}
  </div>
);
