import { store } from "../../store";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function deleteAlbumSoft(albumId) {
  const token = store.getState().user?.token;
  if (!albumId || !token) throw new Error("albumId and auth token required");

  const res = await fetch(`${API_URL}/album/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ albumId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete album");

  return data;
}
