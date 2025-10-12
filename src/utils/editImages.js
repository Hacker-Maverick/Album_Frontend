// src/utils/editImages.js
import { store } from "../../store";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function editImages({ albumIds = [], imageIds = [], event = "", date = "" }) {
  try {
    const state = store.getState();
    const token = state.user.token;

    if (!token) throw new Error("No auth token found");

    const body = {
      albumIds,
      imageIds,
      event,
      date,
    };

    const res = await fetch(`${API_URL}/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Edit images failed: ${errorText}`);
    }

    const data = await res.json();
    return data; // Response from backend
  } catch (err) {
    console.error("Error editing images:", err.message);
    throw err;
  }
}
