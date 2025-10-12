import { store } from "../../store/index.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchDownloadLinks(imageIds) {
    const token = store.getState().user.token;
  if (!Array.isArray(imageIds) || imageIds.length === 0) return [];

  try {
    const response = await fetch(`${API_URL}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add bearer token here
      },
      body: JSON.stringify({ imageIds }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data||"Failed to fetch download links");

    return data.urls || [];
  } catch (err) {
    console.error("Error fetching download links:", err);
    return [];
  }
}
