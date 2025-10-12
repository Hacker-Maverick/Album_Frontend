import { store } from "../../store/index.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchViewLinks(imageIds) {
    const token = store.getState().user.token;
  if (!Array.isArray(imageIds) || imageIds.length === 0) return [];

  try {
    const response = await fetch(`${API_URL}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add bearer token here
      },
      body: JSON.stringify({ imageIds }),
    });
    if (!response.ok) throw new Error("Failed to fetch view links");

    const data = await response.json();
    return data.urls || [];
  } catch (err) {
    console.error("Error fetching view links:", err);
    return [];
  }
}
