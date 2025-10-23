// src/store/albumsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  albums: [],
};

const albumsSlice = createSlice({
  name: "albums",
  initialState,
  reducers: {
    // Initialize or update album data
    setAlbumData: (state, action) => {
      const { albumName, events } = action.payload;
      const albumIndex = state.albums.findIndex(a => a.name === albumName);

      if (albumIndex === -1) {
        // New album
        state.albums.push({
          name: albumName,
          data: events.map(ev => ({
            ...ev,
            loaded: ev.images?.length || 0,
            total: ev.total || (ev.images?.length || 0),
            loadMore: (ev.total || (ev.images?.length || 0)) > (ev.images?.length || 0),
          })),
        });
      } else {
        // Existing album: merge/update events
        events.forEach(newEvent => {
          const eventIndex = state.albums[albumIndex].data.findIndex(e => e.event === newEvent.event);
          if (eventIndex === -1) {
            state.albums[albumIndex].data.push({
              ...newEvent,
              loaded: newEvent.images?.length || 0,
              total: newEvent.total || (newEvent.images?.length || 0),
              loadMore: (newEvent.total || (newEvent.images?.length || 0)) > (newEvent.images?.length || 0),
            });
          } else {
            const event = state.albums[albumIndex].data[eventIndex];
            if (newEvent.images) event.images.push(...newEvent.images);
            event.loaded = event.images.length;
            event.total = newEvent.total || event.total;
            event.loadMore = event.loaded < event.total;
          }
        });
      }
    },

    // Append paginated images to events
    appendImages: (state, action) => {
      const { albumName, eventName, eventDate, images, total } = action.payload;
      const album = state.albums.find(a => a.name === albumName);
      if (!album) return;

      let event = album.data.find(e => e.event === eventName);
      if (!event) {
        // create new event if not exists
        album.data.push({
          event: eventName,
          date: eventDate,
          images: images || [],
          loaded: images?.length || 0,
          total: total || (images?.length || 0),
          loadMore: (images?.length || 0) < (total || 0),
        });
      } else {
        event.images.push(...images);
        event.loaded += images.length;
        event.total = total;
        event.loadMore = event.loaded < total;
      }
    },
  },
});

export const { setAlbumData, appendImages } = albumsSlice.actions;
export default albumsSlice.reducer;
