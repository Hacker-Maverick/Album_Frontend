// src/pages/Login.jsx
import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Link,useNavigate } from "react-router-dom"
import { setUser } from "../../store/userSlice"
import { GoogleLogin } from "@react-oauth/google"
import { fetchUser } from "../utils/fetchUser"

const API_URL = import.meta.env.VITE_API_BASE_URL // 🔗 backend base URL

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ✅ Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      dispatch(setUser({ user: { email: data.email }, token: data.token }))
      localStorage.setItem("album_jwt_token", data.token);
      let verified = await fetchUser(data.token, dispatch)
      if(verified) navigate("/dashboard")
      else navigate("/verify-email")
    } catch (err) {
      alert(err.message || "Login failed")
    }
  }

  // ✅ Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Google login failed")

      dispatch(setUser({ user: { email: data.email }, token: data.token }))
      localStorage.setItem("album_jwt_token", data.token);
      fetchUser(data.token, dispatch)
      navigate("/dashboard")
    } catch (err) {
      alert(err.message || "Google login failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3ebe1] to-[#e9dccb] p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl px-8 py-10">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-[#5a3e2b] mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Please sign in to continue
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b27d48] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b27d48] focus:outline-none"
            />
          </div>

          {/* Remember + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="mr-2 rounded" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-[#b27d48] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#5a3e2b] text-white py-3 rounded-xl font-semibold hover:bg-[#472f1f] transition"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            shape="rectangular"
            size="large"
            theme="outline"
            width="280"
          />
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-[#b27d48] font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  )
}
