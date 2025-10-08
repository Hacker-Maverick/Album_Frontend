import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./userSlice"
import albumReducer from "./albumSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    albums: albumReducer,
  },
})
