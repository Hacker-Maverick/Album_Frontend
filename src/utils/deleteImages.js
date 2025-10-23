// src/utils/deleteImages.js
import { store } from "../../store";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function deleteImages(albumId, imageIds = [], permanently = false) {
  try {
    const state = store.getState();
    const token = state.user.token;
    const user = state.user.user;

    if (!token) throw new Error("No auth token found");
    if (!user) throw new Error("User not found in store");

    // Get all albumIds from user groups
    const albumIds = [
  ...(user.groups?.map(group => group.albumId).filter(Boolean) || []),
  user.main_album || null,
].filter(Boolean);

    const body = {
      albumId,
      albumIds,
      imageIds,
      permanently,
    };

    const res = await fetch(`${API_URL}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Delete images failed: ${errorText}`);
    }

    const data = await res.json();
    return data; // Return backend response for further handling
  } catch (err) {
    console.error("Error deleting images:", err.message);
    throw err; // rethrow to allow caller to handle
  }
}
