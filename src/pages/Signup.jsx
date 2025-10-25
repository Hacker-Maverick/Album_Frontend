// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
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

  // ✅ Plan from CTA (if user clicked a plan button before)
  const planFromCTA = location.state?.plan || null;

  // ✅ Extract referral code from query params
  const searchParams = new URLSearchParams(location.search);
  const referralFromQuery = searchParams.get("ref");

  // ✅ Local form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    referalCode: referralFromQuery || "",
    plan: planFromCTA?.name || "free",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Dropdown plan options (only visible if no CTA plan)
  const plans = [
    { name: "Free", label: "Free – 2GB Lifetime", price: 0 },
    { name: "Basic", label: "Basic – 25GB (6 months)", price: 399 },
    { name: "Standard", label: "Standard – 100GB (12 months)", price: 799 },
    { name: "Premium", label: "Premium – 250GB (24 months)", price: 1499 },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Manual Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      dispatch(setUser({ user: { email: data.email }, token: data.token }));
      localStorage.setItem("album_jwt_token", data.token);

      navigate("/verify-email", { state: { plan: form.plan  } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Signup Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
          referalCode: form.referalCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google signup failed");

      dispatch(setUser({ user: { email: data.email }, token: data.token }));
      localStorage.setItem("album_jwt_token", data.token);

      if (res.status === 200) {
        await fetchUser(data.token, dispatch);
        navigate("/dashboard");
      } else {
        navigate("/complete-profile", { state: { plan: { name: form.plan } } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee]">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#eee0d1]">
        <h1 className="text-xl font-bold text-[#5a3e2b]">PhotoVault</h1>
        <Link
          to="/login"
          className="px-4 py-2 text-sm rounded-md bg-[#f6e2d5] text-[#c97f5b] font-medium hover:bg-[#e9d3c5]"
        >
          Login Instead
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex flex-col items-center justify-center flex-grow px-4 my-6">
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

            {/* Referral Input (always visible, autofilled if query present) */}
            <input
              type="text"
              name="referalCode"
              placeholder="Referral code (optional)"
              value={form.referalCode}
              onChange={handleChange}
              className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
            />

            {/* Dropdown for plan selection if NOT from CTA */}
            {!planFromCTA && (
              <div className="my-6">
                <label className="block mb-2 text-sm font-semibold text-[#4a3627]">
                  Choose a plan
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {plans.map((p) => (
                    <div
                      key={p.name}
                      onClick={() => setForm({ ...form, plan: p.name })}
                      className={`cursor-pointer rounded-lg border transition-all duration-200 px-4 py-3 text-left
            ${form.plan === p.name
                          ? "border-[#e6b197] bg-[#f8ece1] shadow-sm"
                          : "border-[#e2d5c7] bg-[#fffaf5] hover:border-[#e6b197]"
                        }`}
                    >
                      <p className="font-semibold text-[#4a3627] text-[15px]">
                        {p.label.split("–")[0].trim()}
                      </p>
                      <p className="text-xs text-[#6e5542] opacity-80 mt-0.5">
                        {p.label.split("–")[1]?.trim() || ""}
                      </p>
                      <p className="font-semibold text-[#4a3627] text-sm mt-2">
                        ₹{p.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition"
            >
              {loading
                ? "Signing Up..."
                : `Sign Up${planFromCTA ? ` - ${planFromCTA.name}` : ""}`}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-[#e2d5c7]" />
            <span className="px-3 text-gray-500 text-sm">Or continue with</span>
            <hr className="flex-grow border-[#e2d5c7]" />
          </div>

          {/* Google Login */}
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

      {/* Footer */}
      <footer className="border-t border-[#eee0d1] px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-[#6e5542]">
        <p>© 2025 PhotoVault. All rights reserved.</p>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <a href="#" className="hover:underline">
            About Us
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
