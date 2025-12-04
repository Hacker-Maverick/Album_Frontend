// src/store/albumsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  albums: [],
};

const toIso = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toISOString();
};

const albumsSlice = createSlice({
  name: "albums",
  initialState,
  reducers: {
    // Initialize or update album data
    setAlbumData: (state, action) => {
      const { albumName, events } = action.payload;
      const albumIndex = state.albums.findIndex((a) => a.name === albumName);

      const normalizeEvent = (ev) => ({
        ...ev,
        date: toIso(ev.date),
        loaded: ev.images?.length || 0,
        total: ev.total ?? (ev.images?.length || 0),
        loadMore: (ev.total ?? (ev.images?.length || 0)) > (ev.images?.length || 0),
      });

      if (albumIndex === -1) {
        // New album
        state.albums.push({
          name: albumName,
          data: (events || []).map((ev) => normalizeEvent(ev)),
        });
      } else {
        // Existing album: merge/update events by event+isoDate (unique)
        events.forEach((newEvent) => {
          const normalizedDate = toIso(newEvent.date);
          const album = state.albums[albumIndex];

          const eventIndex = album.data.findIndex(
            (e) => e.event === newEvent.event && toIso(e.date) === normalizedDate
          );

          if (eventIndex === -1) {
            album.data.push(
              normalizeEvent({
                ...newEvent,
                date: normalizedDate,
              })
            );
          } else {
            const event = album.data[eventIndex];
            if (newEvent.images) {
              // append images (no dedupe) — if you want dedupe, replace with a filter
              event.images.push(...newEvent.images);
            }
            event.loaded = event.images.length;
            event.total = newEvent.total ?? event.total;
            event.loadMore = event.loaded < event.total;
          }
        });
      }
    },

    // Append paginated images to events
    appendImages: (state, action) => {
      const { albumName, eventName, eventDate, images, total } = action.payload;
      const album = state.albums.find((a) => a.name === albumName);
      if (!album) return;

      const normalizedDate = toIso(eventDate);

      // find event by eventName + normalized date
      let event = album.data.find(
        (e) => e.event === eventName && toIso(e.date) === normalizedDate
      );

      if (!event) {
        // create new event if not exists
        album.data.push({
          event: eventName,
          date: normalizedDate,
          images: images || [],
          loaded: images?.length || 0,
          total: total ?? (images?.length || 0),
          loadMore: (images?.length || 0) < (total ?? 0),
        });
      } else {
        // append images
        event.images.push(...(images || []));
        event.loaded = (event.loaded || 0) + (images?.length || 0);
        event.total = total ?? event.total;
        event.loadMore = event.loaded < (event.total ?? event.loaded);
      }
    },
  },
});

export const { setAlbumData, appendImages } = albumsSlice.actions;
export default albumsSlice.reducer;
