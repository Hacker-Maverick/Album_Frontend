// src/components/AuthRestorer.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { store } from "../../store";
import { setUser } from "../../store/userSlice";
import { fetchUser } from "../utils/fetchUser";
import { initializeAlbumsFromUser } from "../utils/loadAlbum";

export default function Reload() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.token); // current user from Redux

  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem("album_jwt_token");
      const lastRoute = localStorage.getItem("last_visited_route") || "/";

      // ✅ Only restore if Redux user is empty (prevents messing up state-based routes)
      if (!user && token) {
        store.dispatch(setUser({ user: null, token }));

        await fetchUser();
        initializeAlbumsFromUser();

        navigate(lastRoute, { replace: true });
      }
    }

    restore();
  }, [navigate, user]);

  return null; // nothing to render
}
