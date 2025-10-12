// src/components/AuthRestorer.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../store";
import { setUser } from "../../store/userSlice";
import { fetchUser } from "../utils/fetchUser";  // your existing fetchUser function
import { initializeAlbumsFromUser } from "../utils/loadAlbum";

export default function Reload() {
  const navigate = useNavigate();

  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem("album_jwt_token");
      const lastRoute = localStorage.getItem("last_visited_route") || "/";

      if (token) {
        // Set token in Redux
        store.dispatch(setUser({ user: null, token }));

        // Fetch fresh user details and update store
        await fetchUser();

        // Initialize albums redux state based on user data
        initializeAlbumsFromUser();

        // Navigate to last saved route on reload
        navigate(lastRoute, { replace: true });
      }
    }
    restore();
  }, [navigate]);

  return null;  // nothing to render
}
