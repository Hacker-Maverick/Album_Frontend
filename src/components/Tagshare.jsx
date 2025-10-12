import React, { useState, useEffect, useRef } from "react";
import { store } from "../../store";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TagShare({ imageIds = [], onClose }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [friendsUsernames, setFriendsUsernames] = useState([]);
  const inputRef = useRef(null);

  // 🔹 Load friend usernames from Redux user slice on mount
  useEffect(() => {
    const user = store.getState().user.user;
    if (user && Array.isArray(user.friends)) {
      const usernames = user.friends.map((friend) => friend.username);
      setFriendsUsernames(usernames);
    }
  }, []);

  // 🔹 Filter suggestions dynamically as user types
  useEffect(() => {
    if (input.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = friendsUsernames.filter(
      (username) =>
        username.toLowerCase().startsWith(input.toLowerCase()) &&
        !tags.includes(username)
    );
    setSuggestions(filtered);
  }, [input, friendsUsernames, tags]);

  // 🔹 Add new tag (either selected or typed manually)
  function addTag(username) {
    if (!username.trim()) return;
    if (tags.includes(username)) return;
    setTags((prev) => [...prev, username.trim()]);
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
      alert("Add at least one username to tag.");
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

      const data = await res.json();
      alert("Shared successfully!");
      setTags([]);
      setInput("");
      setSuggestions([]);
      onClose?.(true); // notify parent of success
    } catch (err) {
      console.error("Error sharing images:", err.message);
      alert("Error sharing: " + err.message);
    }
  }

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
          placeholder="Type username..."
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
          {suggestions.map((username) => (
            <li
              key={username}
              onClick={() => addTag(username)}
              className="px-3 py-2 cursor-pointer hover:bg-[#FFF3E0]"
            >
              {username}
            </li>
          ))}
        </ul>
      )}

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((username) => (
          <div
            key={username}
            className="bg-[#C9A97C] text-white px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span>{username}</span>
            <button
              type="button"
              onClick={() => removeTag(username)}
              className="text-white text-sm font-bold hover:text-gray-200"
              aria-label={`Remove ${username}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Share Button */}
      <button
        onClick={shareTags}
        className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-semibold py-2 rounded-lg transition-all duration-150"
      >
        Share
      </button>
    </div>
  );
}
