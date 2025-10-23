// src/utils/fetchThumbnailLinks.js
import { store } from "../../store/index.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchThumbnailLinks(imageIds) {
  const token = store.getState().user.token;
  if (!Array.isArray(imageIds) || imageIds.length === 0) return [];

  try {
    const res = await fetch(`${API_URL}/thumbnails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageIds }),
    });

    if (!res.ok) throw new Error("Failed to fetch thumbnail URLs");
    const data = await res.json();
    return data.urls || [];
  } catch (err) {
    console.error("Thumbnail fetch error:", err);
    return [];
  }
}
