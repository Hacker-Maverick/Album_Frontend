import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="" element={<Login />} />
        <Route path="" element={<Profile />} />
        <Route path="" element={<AlbumDetail />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
