import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Payment from "./pages/Payment"
import CompleteProfile from "./pages/CompleteProfile"
import UploadPage from "./pages/uploads"
import Dashboard from "./pages/dashboard"
import RouteTracker from "./pages/routeTracker"
import Reload from "./pages/Reload"
import ImageViewPage from "./pages/Imageview"


export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Reload />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/imageview/:imageId" element={<ImageViewPage />} />

        {/* <Route path="" element={<Profile />} />
        <Route path="" element={<AlbumDetail />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
