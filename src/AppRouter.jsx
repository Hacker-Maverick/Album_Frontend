import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Payment from "./pages/Payment"
import CompleteProfile from "./pages/CompleteProfile"
import UploadPage from "./pages/uploads"
import Dashboard from "./pages/dashboard"
import RouteTracker from "./pages/Routetracker"
import Reload from "./pages/Reload"
import ImageViewPage from "./pages/Imageview"
import RequestsPage from "./pages/Request"
import ForgotPassword from "./pages/ForgotPassword"
import Profile from "./pages/Profile"
import Friends from "./pages/Friends"
import CreditsRewards from "./pages/rewards"
import VerifyEmail from "./pages/verifyMail"


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
        <Route path="/dashboard/hidden" element={<Dashboard />} />
        <Route path="/imageview/:imageId" element={<ImageViewPage />} />
        <Route path="/request" element={<RequestsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/rewards" element={<CreditsRewards />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  )
}
