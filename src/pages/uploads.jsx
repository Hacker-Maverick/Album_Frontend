// src/pages/UploadPage.jsx
import React, { useState, useCallback, useMemo, useEffect,useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { generateThumbnail } from "../utils/generateThumbnail"; // 👈 add this
import UserNav from "../components/usernav.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function UploadPage() {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  const [files, setFiles] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [tagees, setTagees] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const suggestBoxRef = useRef(null);

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        try { URL.revokeObjectURL(f.preview || f.id); } catch { }
      });
    };
  }, []);

  const removeFile = (id) => {
    setFiles((prev) => {
      const next = prev.filter((f) => {
        if (f.id === id) {
          try { URL.revokeObjectURL(f.preview || f.id); } catch { }
          return false;
        }
        return true;
      });
      return next;
    });
  };



  // Albums
  const albums = useMemo(() => {
    if (!user) return [];
    const arr = [];
    if (user.main_album) arr.push({ _id: user.main_album, name: "Main Album" });
    if (user.groups?.length) {
      user.groups.forEach((g) => {
        if (g.albumId)
          arr.push({ _id: g.albumId, name: g.groupName || `Album-${g.albumId}` });
      });
    }
    return arr;
  }, [user]);

  // Friends
  const friends = useMemo(() => {
    if (!user?.friends) return [];
    return user.friends.map((f) => ({
      username: f.username,
      nickname: f.nickname || "",
      label: f.nickname || f.username,
    }));
  }, [user]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const mapped = acceptedFiles.map((file) => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        id: preview,
        preview,
        size: file.size,
        mime: file.type,
        name: file.name,
      };
    });
    setFiles((prev) => [...prev, ...mapped]);
  }, []);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "image/*": [], "video/*": [] },
  });

  // Add tags (manual + suggestions)
  const handleTagAdd = (username) => {
    if (username && !tagees.includes(username)) {
      setTagees([...tagees, username]);
    }
    setTagInput("");
  };

  // -------------------------------------
  // Upload handler
  // -------------------------------------
  const handleUpload = async () => {
    if (!files.length) return alert("Please add files");
    if (!eventName || !eventDate)
      return alert("Event name and date are required");
    if (!selectedAlbums.length)
      return alert("Select at least one album");

    setIsUploading(true);
    setFadeOut(false);

    try {
      // 1️⃣ INIT request
      const initRes = await fetch(`${API_BASE}/upload-init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          files: files.map((f) => ({ mime: f.mime, size: f.size })),
        }),
      });

      if (!initRes.ok) {
        const errData = await initRes.json();
        throw new Error(errData.message || "Upload init failed");
      }

      const { items } = await initRes.json();
      const uploadedKeysLocal = [];
      const uploadedThumbKeysLocal = [];

      // 2️⃣ Upload each file + generated thumbnail
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const item = items[i];

        // Generate thumbnail automatically
        const thumbBlob = await generateThumbnail(file.file, 400);
        const thumbFile = new File([thumbBlob], "thumbnail.jpg", {
          type: "image/jpeg",
        });

        // Upload main file
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = ((i + e.loaded / e.total) / files.length) * 100;
              setOverallProgress(Math.round(percent));
            }
          };
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(xhr.statusText);
          xhr.open("PUT", item.url);
          xhr.setRequestHeader("Content-Type", item.contentType);
          xhr.send(file.file);
        });

        // Upload thumbnail
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(xhr.statusText);
          xhr.open("PUT", item.thumbnailUrl);
          xhr.setRequestHeader("Content-Type", "image/jpeg");
          xhr.send(thumbFile);
        });

        uploadedKeysLocal.push(item.key);
        uploadedThumbKeysLocal.push(item.thumbnailKey);
      }

      // 3️⃣ COMPLETE request
      const body = {
        keys: uploadedKeysLocal,
        thumbnailKeys: uploadedThumbKeysLocal, // 👈 send thumbnail keys
        albumIds: selectedAlbums,
        event: eventName,
        date: eventDate,
        taggeesUsernames: tagees,
      };

      const completeRes = await fetch(`${API_BASE}/upload-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok)
        throw new Error(completeData.message || "Upload complete failed");

      alert("Upload completed successfully!");
      window.location.reload();

      // Reset form
      setFiles([]);
      setEventName("");
      setEventDate("");
      setSelectedAlbums([]);
      setTagees([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setFadeOut(true);
      setTimeout(() => {
        setIsUploading(false);
        setOverallProgress(0);
      }, 600);
    }
  };

  // -------------------------------------
  // UI (unchanged)
  // -------------------------------------
  return (<>
    <UserNav />
    <div className="min-h-screen flex flex-col items-center p-8 bg-[#fffaf7] text-[#5c3a21]">
      <h1 className="text-2xl font-semibold mb-2">Upload Your Photos</h1>
      <p className="mb-8 text-gray-500">
        Relive your memories by adding them to your PhotoVault.
      </p>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-[#d4bba4] rounded-lg p-12 w-full max-w-xl text-center cursor-pointer mb-6 hover:border-[#8b5e3c] transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop files here...</p> : <p>Click to upload or drag and drop</p>}
        <p className="text-sm text-gray-400">
          SVG, PNG, JPG, GIF or MP4 (max 800x400px)
        </p>
      </div>

      <div className="w-full max-w-xl space-y-2 mb-6">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between border border-[#d4bba4] rounded p-2 bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded overflow-hidden bg-[#f7f3ee] flex-shrink-0">
                {(f.mime || "").startsWith("image/") ? (
                  <img
                    src={f.preview}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    {f.mime?.startsWith("video/") ? "VIDEO" : "FILE"}
                  </div>
                )}
              </div>

              <div className="text-sm">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-500">
                  {Math.round(f.size / 1024)} KB
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile(f.id);
              }}
              className="text-red-600 hover:text-red-800 ml-4 text-sm"
            >
              x
            </button>
          </div>
        ))}
      </div>


      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="border border-[#d4bba4] w-full max-w-xl p-2 rounded mb-4"
      />

      <input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        className="border border-[#d4bba4] w-full max-w-xl p-2 rounded mb-4"
      />

      <div className="w-full max-w-xl mb-4">
        <label className="block mb-1 text-sm text-[#5c3a21]">Albums</label>
        <select
          className="border border-[#d4bba4] w-full p-2 rounded"
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
        <div className="flex gap-2 mt-2 flex-wrap">
          {selectedAlbums.map((id) => {
            const alb = albums.find((a) => a._id === id);
            return (
              <span
                key={id}
                className="px-2 py-1 rounded-full bg-[#f3e1d3] text-sm flex items-center gap-1"
              >
                {alb?.name}
                <button
                  onClick={() =>
                    setSelectedAlbums(selectedAlbums.filter((x) => x !== id))
                  }
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  x
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-xl mb-6 relative">
        <label className="block mb-1 text-sm text-[#5c3a21]">Tag Friends</label>
        <input
          type="text"
          placeholder="Type a friend's username"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTagAdd(tagInput.trim());
            }
          }}
          className="border border-[#d4bba4] w-full p-2 rounded"
        />
        {tagInput && (
          <div ref={suggestBoxRef} className="absolute bg-white border border-gray-200 rounded shadow-md w-full mt-1 z-10 max-h-32 overflow-y-auto">
            {friends
              .filter(f => {
                const q = tagInput.toLowerCase();
                if (!f.username) return false;
                // exclude yourself
                if (f.username === user?.username) return false;
                return (f.username || "").toLowerCase().includes(q)
                  || (f.nickname || "").toLowerCase().includes(q)
                  || (f.label || "").toLowerCase().includes(q);
              })
              .map((f) => (
                <div
                  key={f.username}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!tagees.includes(f.username)) {
                      setTagees((prev) => [...prev, f.username]);
                    }
                    setTagInput("");
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex w-full justify-between"
                >
                  <div className="text-sm">{f.username}</div>
                  <div className="text-xs text-gray-500">@{f.nickname || ""}</div>
                </div>
              ))}
          </div>
        )}
        <div className="flex gap-2 mt-2 flex-wrap">
          {tagees.map((username) => (
            <span
              key={username}
              className="px-2 py-1 rounded-full bg-[#f3e1d3] text-sm flex items-center gap-1"
            >
              {username}
              <button
                onClick={() =>
                  setTagees(tagees.filter((x) => x !== username))
                }
                className="text-xs text-red-600 hover:text-red-800"
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <button
          onClick={handleUpload}
          className="bg-[#8b5e3c] hover:bg-[#70492c] text-white px-6 py-3 rounded-lg shadow"
        >
          Start Upload
        </button>
      )}

      {isUploading && (
        <div
          className={`
    fixed bottom-[10px] left-1/2 -translate-x-1/2
    w-full max-w-xl p-4
    rounded-lg border border-[#d4bba4]
    bg-white
    drop-shadow-[0_0_35px_rgba(255,255,255,0.9)]
    shadow
    transition-opacity duration-500
    ${fadeOut ? "opacity-0" : "opacity-100"}
  `}
        >
          <div className="flex justify-between mb-1 text-sm text-[#5c3a21]">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full h-3 rounded bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[#8b5e3c] transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </>
  );
}
