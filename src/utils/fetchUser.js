// src/utils/fetchUser.js
import { setUser } from "../../store/userSlice";
import { store } from "../../store/index.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchUser() {
  try {
    const state = store.getState();
    const token = state.user.token;

    if (!token) return; // no token, user not logged in

    const res = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch user data");

    // update user in redux but keep token as it is
    store.dispatch(setUser({ user: data, token }));
    return data;
    
  } catch (err) {
    console.error("Error fetching user:", err.message);
  }
}
