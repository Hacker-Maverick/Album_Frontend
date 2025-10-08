// src/pages/Signup.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { setUser } from "../../store/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { fetchUser } from "../utils/fetchUser";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Get plan from CTA button state
  const planFromCTA = location.state?.plan || { name: "Free" };

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Signup with email/password
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: planFromCTA.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Save token and user
      dispatch(setUser({ user: { email: data.email }, token: data.token }));
      

      // ✅ Manual users → payment directly
      if (planFromCTA.name.toLowerCase() === "free") {
        fetchUser(data.token, dispatch)
        navigate("/dashboard");
      } else {
        navigate("/payment", { state: { plan: planFromCTA.name } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup with Google → complete profile first
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential, plan: planFromCTA.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Google signup failed");

      dispatch(setUser({ user: { email: data.email }, token: data.token }));

      // ✅ Google users → first complete profile
      navigate("/complete-profile", { state: { plan: planFromCTA } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee]">
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#eee0d1]">
        <h1 className="text-xl font-bold text-[#5a3e2b]">PhotoVault</h1>
        <Link
          to="/login"
          className="px-4 py-2 text-sm rounded-md bg-[#f6e2d5] text-[#c97f5b] font-medium hover:bg-[#e9d3c5]"
        >
          Login Instead
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow px-4">
        <div className="w-full max-w-md bg-transparent">
          <h2 className="text-2xl font-semibold text-center text-[#4a3627] mb-6">
            Create your account
          </h2>

          {error && <p className="text-red-500 text-center mb-3">{error}</p>}

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition"
            >
              {loading ? "Signing Up..." : `Sign Up - ${planFromCTA.name} Plan`}
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-[#e2d5c7]" />
            <span className="px-3 text-gray-500 text-sm">Or continue with</span>
            <hr className="flex-grow border-[#e2d5c7]" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google signup failed")}
              shape="rectangular"
              size="large"
              theme="outline"
              width="350"
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#eee0d1] px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-[#6e5542]">
        <p>© 2023 PhotoVault. All rights reserved.</p>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </footer>
    </div>
  );
}
