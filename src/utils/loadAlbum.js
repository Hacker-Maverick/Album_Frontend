// src/helpers/albumsHelpers.js
import {store} from "../../store";
import { setAlbumData, appendImages } from "../../store/albumSlice";

/**
 * Initialize albums in Redux from user data
 */
export function initializeAlbumsFromUser() {
  const { user } = store.getState().user;
  if (!user) return;

  // Main album
  if (user.main_album) {
    store.dispatch(
      setAlbumData({
        albumName: "Main Album",
        events: [],
      })
    );
  }

  // Group albums
  user.groups?.forEach(group => {
    if (group.albumId) {
      store.dispatch(
        setAlbumData({
          albumName: group.groupName || `Album-${group.albumId}`,
          events: [],
        })
      );
    }
  });
}

/**
 * Load next `n` images across events in an album
 */
export async function loadMoreImages(albumId, albumName, n) {
  try {
    const state = store.getState();
    const album = state.albums.albums.find(a => a.name === albumName);
    if (!album) return;

    // Count already loaded images in this album
    let loadedImages = 0;
    album.data.forEach(event => {
      loadedImages += event.loaded || 0;
    });

    const token = state.user.token;

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/albums/${albumId}/images?loaded=${loadedImages}&n=${n}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to load images");

    const data = await res.json();
    // data format: [{ event, date, images: [{id,key,thumbnailKey}], total }, ...]

    data.forEach(ev => {
      store.dispatch(
        appendImages({
          albumName,
          eventName: ev.event,
          eventDate: ev.date,
          images: ev.images,
          total: ev.total,
        })
      );
    });
  } catch (err) {
    console.error("Error loading more images:", err.message);
  }
}
