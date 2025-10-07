import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Payment from "./pages/Payment"
import CompleteProfile from "./pages/CompleteProfile"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        {/* <Route path="" element={<Profile />} />
        <Route path="" element={<AlbumDetail />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
