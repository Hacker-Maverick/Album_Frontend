import React, { useState, useEffect, useRef } from "react";
import { store } from "../../store";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TagShare({ imageIds = [], onClose }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]); // array of friend objects
  const [tags, setTags] = useState([]); // stored as canonical usernames
  const [friends, setFriends] = useState([]); // array of { username, nickname }
  const inputRef = useRef(null);

  // 🔹 Load friend list from Redux user slice on mount
  useEffect(() => {
    const user = store.getState().user.user;
    if (user && Array.isArray(user.friends)) {
      const mapped = user.friends.map((friend) => ({
        username: friend.username,
        nickname: friend.nickname || "",
      }));
      setFriends(mapped);
    }
  }, []);

  // 🔹 Filter suggestions dynamically as user types
  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (q === "") {
      setSuggestions([]);
      return;
    }

    // Find all matches
    let filtered = friends.filter((f) => {
      const u = f.username.toLowerCase();
      const n = (f.nickname || "").toLowerCase();
      return (
        !tags.includes(f.username) &&
        (u.startsWith(q) || n.startsWith(q))
      );
    });

    // Sort: priority to username startsWith, then nickname startsWith
    filtered = filtered.sort((a, b) => {
      const aU = a.username.toLowerCase().startsWith(q) ? 0 : 1;
      const bU = b.username.toLowerCase().startsWith(q) ? 0 : 1;

      if (aU !== bU) return aU - bU;

      const aN = (a.nickname || "").toLowerCase().startsWith(q) ? 0 : 1;
      const bN = (b.nickname || "").toLowerCase().startsWith(q) ? 0 : 1;

      return aN - bN;
    });

    // Limit to top 5
    setSuggestions(filtered.slice(0, 5));
  }, [input, friends, tags]);


  // 🔹 Convert typed value (username or nickname) to canonical username if possible
  function resolveToUsername(val) {
    const q = (val || "").trim().toLowerCase();
    if (!q) return "";
    const found = friends.find(
      (f) =>
        f.username.toLowerCase() === q || (f.nickname || "").toLowerCase() === q
    );
    if (found) return found.username;
    // not found → treat typed value as a username (allow free-text)
    return val.trim();
  }

  // 🔹 Add new tag (either selected or typed manually)
  function addTag(raw) {
    const username = resolveToUsername(raw);
    if (!username) return;
    if (tags.includes(username)) return;
    setTags((prev) => [...prev, username]);
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  // 🔹 Remove tag from list
  function removeTag(username) {
    setTags((prev) => prev.filter((t) => t !== username));
  }

  // 🔹 Submit tagging (share)
  async function shareTags() {
    if (tags.length === 0) {
      toast.warning("Add at least one username to tag.");
      return;
    }

    try {
      const token = store.getState().user.token;
      if (!token) throw new Error("No auth token, please login.");

      const body = {
        taggeesUsernames: tags,
        imageIds,
      };

      const res = await fetch(`${API_URL}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Share failed: ${errText}`);
      }

      await res.json();
      toast.success("Shared successfully!");
      setTags([]);
      setInput("");
      setSuggestions([]);
      onClose?.(true); // notify parent of success
    } catch (err) {
      console.error("Error sharing images:", err.message || err);
      toast.error("Error sharing: " + (err.message || "Unknown error"));
    }
  }

  // helper to get friend object for a username (if exists)
  const getFriendForUsername = (username) =>
    friends.find((f) => f.username === username) || null;

  return (
    <div
      className="relative bg-white rounded-xl shadow-xl p-5 w-[350px] max-w-[90vw] text-gray-800"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={() => onClose?.(false)}
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
        aria-label="Close"
      >
        ×
      </button>

      <h2 className="text-lg font-semibold mb-3 text-center">Tag Friends</h2>

      {/* Input Field */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type username or nickname..."
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#C9A97C] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
        />
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <ul className="border border-gray-300 rounded-lg max-h-28 overflow-y-auto mb-3">
          {suggestions.map((f) => (
            <li
              key={f.username}
              onMouseDown={(e) => {
                // use onMouseDown to avoid input blur interfering
                e.preventDefault();
                addTag(f.username);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-[#FFF3E0] flex justify-between items-center"
            >
              <div className="text-sm">{f.username}</div>
              <div className="text-xs text-gray-500">@{f.nickname || ""}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((username) => {
          const friend = getFriendForUsername(username);
          return (
            <div
              key={username}
              className="bg-[#C9A97C] text-white px-3 py-1 rounded-full flex items-center gap-2"
            >
              <span className="font-medium text-sm">
                {username}
                {friend?.nickname ? (
                  <span className="text-xs text-white/90 ml-2">(@{friend.nickname})</span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={() => removeTag(username)}
                className="text-white text-sm font-bold hover:text-gray-200"
                aria-label={`Remove ${username}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Share Button */}
      <button
        onClick={shareTags}
        className="w-full bg-[#70492c] hover:bg-[#C9A97C] text-white font-semibold py-2 rounded-lg transition-all duration-150"
      >
        Share
      </button>
    </div>
  );
}
