import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Share2,
  Tag,
  Pencil,
  FolderInput,
  Copy,
  Trash2,
  CheckCircle,
} from "lucide-react";
import TagShare from "../components/Tagshare";
import { deleteImages } from "../utils/deleteImages";
import { editImages } from "../utils/editImages";
import { store } from "../../store";
import { toast } from "react-toastify";

export default function ImageFooter({
  albumId,
  albumName,
  eventName,
  eventDate,
  imageId,
  viewUrl,
  downloadUrl,
  user,
  token,
  images,
  currentIndex,
  setCurrentIndex,
}) {
  const navigate = useNavigate();

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

  const [tagOpen, setTagOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySelection, setCopySelection] = useState([]);
  const [deleteChoiceOpen, setDeleteChoiceOpen] = useState(false);
  const [permConfirmOpen, setPermConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editModal, setEditModal] = useState({
    open: false,
    albumId: null,
    imageIds: [],
    eventName: "",
    eventDate: "",
  });


  // --- helper to update session state properly ---
  const updateImageViewState = (removedId, images, setCurrentIndex) => {
    try {
      const state = JSON.parse(sessionStorage.getItem("imageViewState") || "null");
      if (!state?.images?.length) return;

      const updatedImages = state.images.filter(
        (img) => (img.id || img._id) !== removedId
      );

      let nextIndex = 0;
      const curIdx = state.images.findIndex(
        (img) => (img.id || img._id) === removedId
      );
      if (curIdx >= 0 && curIdx < updatedImages.length) nextIndex = curIdx;
      else if (updatedImages.length > 0) nextIndex = updatedImages.length - 1;

      if (updatedImages.length > 0) {
        const newImageId = updatedImages[nextIndex].id || updatedImages[nextIndex]._id;
        state.images = updatedImages;
        state.imageId = newImageId;
        sessionStorage.setItem("imageViewState", JSON.stringify(state));
        setCurrentIndex(nextIndex);
      } else {
        sessionStorage.removeItem("imageViewState");
        navigate("/dashboard");
      }
    } catch (e) {
      console.error("Failed to update image view state", e);
    }
  };

  // --- handlers ---
  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "";
    a.click();
  };

  const handleShare = () => {
    if (!viewUrl) return;
    if (navigator.share)
      navigator.share({ title: eventName || albumName || "Photo", url: viewUrl });
    else window.open(`https://wa.me/?text=${encodeURIComponent(viewUrl)}`, "_blank");
  };

  const moveToAlbum = async (targetAlbumId) => {
    if (!targetAlbumId || targetAlbumId === albumId) return setMoveOpen(false);
    await editImages({
      albumIds: [targetAlbumId],
      imageIds: [imageId],
      event: eventName,
      date: eventDate,
    });

    updateImageViewState(imageId, images, setCurrentIndex);
    setMoveOpen(false);
    window.location.reload();
  };

  const toggleCopy = (id) =>
    setCopySelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const confirmCopy = async () => {
    if (!copySelection.length) return setCopyOpen(false);
    await editImages({
      albumIds: Array.from(new Set([...copySelection])),
      imageIds: [imageId],
      event: eventName,
      date: eventDate,
    });
    setCopySelection([]);
    setCopyOpen(false);
    window.location.reload();
  };

  const deleteFromAlbum = async (permanent = false) => {
    setDeleting(true);
    try {
      await deleteImages(albumId, [imageId], permanent);
      updateImageViewState(imageId, images, setCurrentIndex);
      setDeleting(false);
      setDeleteChoiceOpen(false);
      setPermConfirmOpen(false);
      window.location.reload();
    } catch {
      setDeleting(false);
      toast.error("Delete failed");
    }
  };

  const confirmEventAction = async () => {
    if (!editModal.open) return;
    const { albumId: targetAlbumId, imageIds, eventName, eventDate } = editModal;
    if (!imageIds?.length) {
      setEditModal({ open: false, albumId: null, imageIds: [], eventName: "", eventDate: "" });
      return;
    }
    try {
      await editImages({
        albumIds: [targetAlbumId],
        imageIds,
        event: eventName,
        date: eventDate,
      });
      // simple approach: reload so everything refreshes
      window.location.reload();
    } catch (e) {
      console.error("Failed to update event/date", e);
      toast.error("Failed to update event/date. Please try again.");
    }
  };



  // --- main render ---
  return (
    <footer className="border-t border-[#2A2320] px-3 sm:px-4 md:px-6 py-3 bg-[#171312]">
      {/* Toolbar */}
      <div className="flex justify-between items-center flex-wrap text-sm text-[#EDEAE6] max-w-[900px] mx-auto gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <TooltipButton icon={<Download className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />} label="Download" onClick={handleDownload} />
        <TooltipButton icon={<Share2 className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />} label="Share" onClick={handleShare} />
        <TooltipButton icon={<Tag className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />} label="Tag Someone" onClick={() => setTagOpen(true)} />
        <TooltipButton icon={<Pencil className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />} label="Change Event/Date" onClick={() =>
          setEditModal({
            open: true,
            albumId,
            imageIds: [imageId],
            eventName,
            eventDate: eventDate ? new Date(eventDate).toISOString().slice(0,10) : "",
          })
        } />

        {/* Move */}
        <DropdownButton
          icon={<FolderInput className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
          label="Move to Album"
          open={moveOpen}
          setOpen={setMoveOpen}
          list={userAlbums}
          onSelect={moveToAlbum}
          currentId={albumId}
        />

        {/* Copy */}
        <DropdownCheckboxButton
          icon={<Copy className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
          label="Copy to Album"
          open={copyOpen}
          setOpen={setCopyOpen}
          list={userAlbums}
          selection={copySelection}
          toggle={toggleCopy}
          confirm={confirmCopy}
          currentId={albumId}
        />

        <TooltipButton
          icon={<Trash2 className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
          label="Delete"
          danger
          onClick={() => setDeleteChoiceOpen(true)}
        />
      </div>

      {/* Tag Modal */}
      {tagOpen && (
        <ModalOverlay>
          <TagShare imageIds={[imageId]} onClose={() => setTagOpen(false)} />
        </ModalOverlay>
      )}

 {/* Edit Event/Date Modal */}
{editModal.open && (
  <ModalOverlay>
    <div className="bg-white rounded-xl w-[420px] max-w-[90vw] p-5 shadow-xl">
      <h2 className="text-lg font-semibold mb-3 text-black">Change Event / Date</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Event Name"
          value={editModal.eventName}
          onChange={(e) => setEditModal((m) => ({ ...m, eventName: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full text-black"
        />
        <input
          type="date"
          defaultValue={editModal.eventDate}
          onChange={(e) => setEditModal((m) => ({ ...m, eventDate: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full text-black"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="px-3 py-2 rounded border hover:bg-gray-100 text-black"
          onClick={() => setEditModal({ open: false, albumId: null, imageIds: [], eventName: "", eventDate: "" })}
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



      {/* Delete Choice */}
      {deleteChoiceOpen && (
        <ModalOverlay>
          <div className="bg-[#1E1A18] text-white rounded-xl w-[420px] max-w-[90vw] p-5 border border-[#2A2320] shadow-xl overflow-y-auto">
            <div className="text-lg font-semibold mb-2">Delete Image</div>
            <p className="text-sm text-[#D9D4CF]">
              Are you sure you want to delete this image from{" "}
              <span className="font-medium">{albumName}</span>?
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="px-3 py-2 rounded border border-[#3a322e] hover:bg-[#2A2421]" onClick={() => setDeleteChoiceOpen(false)}>
                Cancel
              </button>
              <button className="px-3 py-2 rounded bg-[#5A514C] hover:bg-[#6A5E58]" onClick={() => deleteFromAlbum(false)} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete here"}
              </button>
              <button className="px-3 py-2 rounded bg-[#D64C4C] hover:bg-[#E05757]" onClick={() => { setDeleteChoiceOpen(false); setPermConfirmOpen(true); }}>
                Delete Global
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Permanent Confirm */}
      {permConfirmOpen && (
        <ModalOverlay>
          <div className="bg-[#1E1A18] text-white rounded-xl w-[420px] max-w-[90vw] p-5 border border-[#2A2320] shadow-xl overflow-y-auto">
            <div className="text-lg font-semibold mb-2">Confirm Permanent Delete</div>
            <p className="text-sm text-[#D9D4CF] mb-3">This will permanently delete the image from all albums.</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded border border-[#3a322e] hover:bg-[#2A2421]" onClick={() => setPermConfirmOpen(false)}>
                Cancel
              </button>
              <button className="px-3 py-2 rounded bg-[#D64C4C] hover:bg-[#E05757]" onClick={() => deleteFromAlbum(true)} disabled={deleting}>
                {deleting ? "Deleting…" : "Confirm"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </footer>
  );
}

/* ========== Small Components ========== */

const TooltipButton = ({ icon, onClick, label, danger }) => (
  <div className="relative group flex items-center justify-center">
    <button
      onClick={onClick}
      className={`h-9 w-9 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full shadow-md transition-all ${danger
        ? "bg-[#2A1818] hover:bg-[#3A1E1E] text-[#FF6B6B]"
        : "bg-[#201B19] hover:bg-[#2A2421] text-[#EDEAE6]"
        }`}
    >
      {icon}
    </button>

    <span
      className="
        absolute -top-8 left-1/2 -translate-x-1/2
        bg-black/80 text-xs text-white rounded-md
        px-2 py-1 whitespace-nowrap
        opacity-0 group-hover:opacity-100
        translate-y-1 group-hover:translate-y-0
        transition-all duration-200 ease-out
        pointer-events-none
      "
    >
      {label}
    </span>
  </div>
);

const DropdownButton = ({ icon, label, open, setOpen, list, onSelect, currentId }) => (
  <div className="relative group">
    <TooltipButton icon={icon} label={label} onClick={() => setOpen((v) => !v)} />
    {open && (
      <ul className="absolute bottom-[110%] right-0 w-64 max-w-[90vw] max-h-60 overflow-auto rounded-lg bg-[#201B19] border border-[#2A2320] shadow-xl z-50 p-1 transition-all duration-200 ease-in-out">
        {list.map((alb) => (
          <li
            key={alb.id}
            onClick={() => onSelect(alb.id)}
            className={`px-3 py-2 flex justify-between items-center hover:bg-[#2A2421] cursor-pointer ${alb.id === String(currentId)
              ? "text-[#C9A97C] bg-[#C9A97C]/20"
              : "text-[#EDEAE6]"
              }`}
          >
            <span>{alb.name}</span>
            {alb.id === String(currentId) && <CheckCircle size={14} />}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const DropdownCheckboxButton = ({
  icon,
  label,
  open,
  setOpen,
  list,
  selection,
  toggle,
  confirm,
  currentId,
}) => (
  <div className="relative group">
    <TooltipButton icon={icon} label={label} onClick={() => setOpen((v) => !v)} />
    {open && (
      <div className="absolute bottom-[110%] right-0 w-72 max-w-[90vw] p-2 bg-[#201B19] border border-[#2A2320] rounded-lg shadow-xl z-50 transition-all duration-200 ease-in-out">
        <ul className="max-h-56 overflow-auto space-y-1">
          {list.map((alb) => (
            <li
              key={alb.id}
              className={`px-2 py-2 flex justify-between items-center rounded hover:bg-[#2A2421] cursor-pointer ${alb.id === String(currentId)
                ? "text-[#C9A97C] bg-[#C9A97C]/20"
                : "text-[#EDEAE6]"
                }`}
              onClick={() => toggle(alb.id)}
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
            className="px-3 py-1 rounded border border-[#3a322e] hover:bg-[#2A2421]"
            onClick={() => setOpen(false)}
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
    )}
  </div>
);

const ModalOverlay = ({ children }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
    {children}
  </div>
);
