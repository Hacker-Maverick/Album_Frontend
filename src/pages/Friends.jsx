import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchUser } from "../utils/fetchUser";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Friends() {
  const { user, token } = useSelector((s) => s.user);
  const [tab, setTab] = useState("friends");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [mode, setMode] = useState("accept"); // "accept" or "edit"

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user data...
      </div>
    );
  }

  // ------------------ SEARCH ------------------
  const searchUsers = async (value) => {
    setQuery(value);
    if (!value.trim()) return setResults([]);
    try {
      const res = await fetch(`${API_URL}/friends/search?query=${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      toast.error("Failed to search users");
    }
  };

  // ------------------ FRIEND REQUEST ACTIONS ------------------
  const sendRequest = async (toId) => {
    try {
      const res = await fetch(`${API_URL}/friends/send/${toId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.info(data.message);   
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  const handleAccept = (fromId) => {
    setPendingId(fromId);
    setMode("accept");
    setShowModal(true);
  };

  const handleNicknameEdit = (friendId) => {
    setPendingId(friendId);
    setMode("edit");
    setShowModal(true);
  };

  const confirmNickname = async () => {
    if (!nicknameInput.trim()) {
      toast.warn("Nickname cannot be empty");
      return;
    }

    try {
      if (mode === "accept") {
        // Accept request
        await fetch(`${API_URL}/friends/accept/${pendingId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Friend request accepted");
        

        // Then set nickname
        await fetch(`${API_URL}/friends/nickname/${pendingId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: nicknameInput }),
        });
        await fetchUser();
      } else {
        // Update nickname
        await fetch(`${API_URL}/friends/nickname/${pendingId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: nicknameInput }),
        });
        toast.success("Nickname updated");
      }

      setShowModal(false);
      setNicknameInput("");
      setPendingId(null);
      await fetchUser()
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const rejectRequest = async (fromId) => {
    try {
      const res = await fetch(`${API_URL}/friends/reject/${fromId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.info(data.message);
      await fetchUser()
    } catch (err) {
      toast.error("Failed to reject request");
    }
  };

  const removeFriend = async (friendId) => {
    if (!confirm("Remove this friend?")) return;
    try {
      const res = await fetch(`${API_URL}/friends/remove/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.warn(data.message);
      await fetchUser()
    } catch (err) {
      toast.error("Failed to remove friend");
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-2 text-gray-800">Friends</h1>
      <p className="text-gray-500 mb-4">Manage your friends and requests.</p>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by username..."
        value={query}
        onChange={(e) => searchUsers(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />

      {/* Search results */}
      {results.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-2 mb-4 border border-gray-100">
          {results.map((u) => (
            <div
              key={u._id}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md transition"
            >
              <span className="text-gray-800">@{u.username}</span>
              <button
                onClick={() => sendRequest(u._id)}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm transition"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-3">
        <button
          onClick={() => setTab("friends")}
          className={`flex-1 text-center py-2 transition ${
            tab === "friends"
              ? "border-b-2 border-orange-500 font-semibold text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Friends
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`flex-1 text-center py-2 transition ${
            tab === "requests"
              ? "border-b-2 border-orange-500 font-semibold text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Requests ({user.friendRequests?.length || 0})
        </button>
      </div>

      {/* Friends */}
      {tab === "friends" && (
        <div className="space-y-3 mt-3">
          {user.friends?.length > 0 ? (
            user.friends.map((f) => (
              <div
                key={f.ref_id?._id || f.ref_id}
                className="flex justify-between items-center bg-white shadow-sm border border-gray-100 p-3 rounded-xl hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">@{f.username}</p>
                  <p className="text-sm text-gray-500">
                    {f.nickname ? `"${f.nickname}"` : "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNicknameEdit(f.ref_id)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                  >
                    Change Nickname
                  </button>
                  <button
                    onClick={() => removeFriend(f.ref_id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              You don’t have any friends yet 😅
            </p>
          )}
        </div>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-3 mt-3">
          {user.friendRequests?.length > 0 ? (
            user.friendRequests.map((r) => (
              <div
                key={r.from}
                className="flex justify-between items-center bg-white shadow-sm border border-gray-100 p-3 rounded-xl hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">@{r.username}</p>
                  <p className="text-xs text-gray-500">
                    Sent on {new Date(r.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(r.from)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(r.from)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              No new friend requests 💌
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] sm:w-96">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              {mode === "accept" ? "Add Nickname" : "Edit Nickname"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter a nickname for your friend:
            </p>
            <input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter nickname"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmNickname}
                className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
