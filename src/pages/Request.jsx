// src/pages/RequestsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserNav from "../components/usernav.jsx";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function RequestsPage() {
  const token = useSelector((s) => s.user.token);
  const user = useSelector((s) => s.user.user);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // selection state is per-request
  const [selectedRequestIndex, setSelectedRequestIndex] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // accept modal state
  const [popupOpen, setPopupOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [tagees, setTagees] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Build album list from user (Main + Groups)
  const albums = useMemo(() => {
    if (!user) return [];
    const arr = [];
    if (user.main_album) arr.push({ _id: user.main_album, name: "Main Album" });
    user.groups?.forEach((g) => {
      if (g.albumId) arr.push({ _id: g.albumId, name: g.groupName || "Group Album" });
    });
    return arr;
  }, [user]);

  const friends = useMemo(() => user?.friends || [], [user]);

  // Load requests from backend
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!ignore) {
          if (res.ok) setRequests(data.requests || []);
          else console.error(data?.message || "Failed to fetch requests");
        }
      } catch (e) {
        if (!ignore) console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [token]);

  // When you click a different request block, reset its selection
  const focusRequest = (i) => {
    if (i !== selectedRequestIndex) {
      setSelectedRequestIndex(i);
      setSelectedImages([]);
    }
  };

  const toggleSelect = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((x) => x !== imageId) : [...prev, imageId]
    );
  };

  const openViewer = (req, imageId) => {
    // pass images as array of {_id} for your ViewMedia
    const viewerImages = req.imageIds.map((id) => ({ _id: id }));
    navigate(`/imageview/${imageId}`, {
      state: {
        imageId,
        images: viewerImages,
        eventName: "Request Images",
        eventDate: req.date,
        fromRequest: true,
      },
    });
  };

  const openAcceptModal = (i) => {
    if (!selectedImages.length) {
      alert("Select at least one image using the checkboxes.");
      return;
    }
    setSelectedRequestIndex(i);
    setPopupOpen(true);
  };

  const handleAccept = async () => {
    if (!selectedImages.length)
      return alert("Select at least one image to accept");
    if (!eventName || !eventDate)
      return alert("Event name and date required");
    if (!selectedAlbums.length)
      return alert("Select at least one album");

    try {
      const res = await fetch(`${API_URL}/requests/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageIds: selectedImages,
          event: eventName,
          date: eventDate,
          albumIds: selectedAlbums,
          taggeesUsernames: tagees, // ✅ identical to Upload.jsx
          requestIndex: selectedRequestIndex,
        }),
      });

      const resjson = await res.json();
      if (!res.ok) throw new Error(resjson.message||"Failed to accept images");

      alert("Images accepted successfully!");

      const updated = [...requests];
      updated.splice(selectedRequestIndex, 1);
      setRequests(updated);
      setPopupOpen(false);
      setSelectedImages([]);
      setEventName("");
      setEventDate("");
      setSelectedAlbums([]);
      setTagees([]);
      setTagInput("");
    } catch (err) {
      alert(err.message);
    }
  };



  const handleDecline = async (i) => {
    try {
      const res = await fetch(`${API_URL}/requests/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestIndex: i }),
      });
      if (!res.ok) throw new Error("Failed to decline request");
      const updated = [...requests];
      updated.splice(i, 1);
      setRequests(updated);

      // clear selection if this was the focused one
      if (i === selectedRequestIndex) {
        setSelectedRequestIndex(null);
        setSelectedImages([]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // album add/remove
  const addAlbum = (albumId) => {
    if (albumId && !selectedAlbums.includes(albumId)) {
      setSelectedAlbums((prev) => [...prev, albumId]);
    }
  };
  const removeAlbum = (albumId) => {
    setSelectedAlbums((prev) => prev.filter((x) => x !== albumId));
  };

  // tagees add/remove
  const addTag = (username) => {
    if (username && !tagees.includes(username)) {
      setTagees((prev) => [...prev, username]);
    }
    setTagInput("");
  };
  const removeTag = (username) => {
    setTagees((prev) => prev.filter((x) => x !== username));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading requests...
      </div>
    );
  }

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-[#fffaf7] p-4 sm:p-6 text-[#5c3a21]">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          Incoming Image Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            No pending image requests.
          </p>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {requests.map((req, i) => (
              <div
                key={i}
                className="border border-[#d4bba4] rounded-lg sm:rounded-xl bg-white p-4 sm:p-5 shadow-sm"
                onMouseEnter={() => focusRequest(i)}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex flex-col leading-tight">
                    <p className="font-medium text-base sm:text-lg">
                      From:{" "}
                      <span className="text-[#8b5e3c]">{req.from}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(req.date).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={() => openAcceptModal(i)}
                      disabled={
                        selectedRequestIndex !== i || selectedImages.length === 0
                      }
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-white transition ${selectedRequestIndex === i && selectedImages.length > 0
                          ? "bg-[#8b5e3c] hover:bg-[#70492c]"
                          : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Accept Selected
                    </button>
                    <button
                      onClick={() => handleDecline(i)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      Decline All
                    </button>
                  </div>
                </div>

                {/* Image thumbnails */}
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2">
                  {req.images.map((img) => {
                    const isSelected =
                      selectedRequestIndex === i &&
                      selectedImages.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`relative rounded-md overflow-hidden bg-gray-100 aspect-square group`}
                      >
                        {/* Click image = open viewer */}
                        <img
                          src={img.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.04]"
                          onClick={() => {
                            focusRequest(i);
                            openViewer(req, img.id);
                          }}
                        />

                        {/* Checkbox overlay */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            focusRequest(i);
                            toggleSelect(img.id);
                          }}
                          className={`absolute top-1 left-1 h-4 w-4 sm:h-5 sm:w-5 rounded border flex items-center justify-center text-[9px] sm:text-[10px] ${isSelected
                              ? "bg-[#8b5e3c] border-[#8b5e3c] text-white"
                              : "bg-white/90 border-gray-300 text-transparent"
                            }`}
                          title={isSelected ? "Unselect" : "Select"}
                        >
                          ✓
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal (kept same but tightened spacing) */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-xl text-sm sm:text-base">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Accept Selected Images
            </h2>

            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="border border-[#d4bba4] w-full p-2 rounded mb-2 sm:mb-3 text-sm"
            />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="border border-[#d4bba4] w-full p-2 rounded mb-3 sm:mb-4 text-sm"
            />

            {/* Albums */}
            <div className="w-full mb-3 sm:mb-4">
              <label className="block mb-1 text-xs sm:text-sm text-[#5c3a21]">
                Albums
              </label>
              <select
                className="border border-[#d4bba4] w-full p-2 rounded text-sm"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedAlbums.includes(val)) {
                    setSelectedAlbums([...selectedAlbums, val]);
                  }
                }}
              >
                <option value="">Select an album</option>
                {albums.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
                {selectedAlbums.map((id) => {
                  const alb = albums.find((a) => a._id === id);
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-full bg-[#f3e1d3] text-[12px] sm:text-sm flex items-center gap-1"
                    >
                      {alb?.name}
                      <button
                        onClick={() =>
                          setSelectedAlbums(selectedAlbums.filter((x) => x !== id))
                        }
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        ✖
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tag Friends */}
            <div className="w-full mb-3 sm:mb-4 relative">
              <label className="block mb-1 text-xs sm:text-sm text-[#5c3a21]">
                Tag Friends
              </label>
              <input
                type="text"
                placeholder="Type a friend's username"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const username = tagInput.trim();
                    if (username && !tagees.includes(username)) {
                      setTagees([...tagees, username]);
                    }
                    setTagInput("");
                  }
                }}
                className="border border-[#d4bba4] w-full p-2 rounded text-sm"
              />
              {tagInput && (
                <div className="absolute bg-white border border-gray-200 rounded shadow-md w-full mt-1 z-10 max-h-32 overflow-y-auto">
                  {friends
                    .filter((f) =>
                      f.username.toLowerCase().includes(tagInput.toLowerCase())
                    )
                    .map((f) => (
                      <div
                        key={f.username}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (!tagees.includes(f.username)) {
                            setTagees([...tagees, f.username]);
                          }
                          setTagInput("");
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {f.label || f.username}
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
                {tagees.map((username) => (
                  <span
                    key={username}
                    className="px-2 py-0.5 rounded-full bg-[#f3e1d3] text-[12px] sm:text-sm flex items-center gap-1"
                  >
                    {username}
                    <button
                      onClick={() =>
                        setTagees(tagees.filter((x) => x !== username))
                      }
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 sm:gap-3 mt-3">
              <button
                onClick={() => setPopupOpen(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-400 hover:bg-gray-100 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-[#8b5e3c] text-white hover:bg-[#70492c] text-xs sm:text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

}
