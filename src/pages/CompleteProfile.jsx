// src/pages/CompleteProfile.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Usernav from "../components/usernav.jsx";
import { fetchUser } from "../utils/fetchUser.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const location = useLocation();

  const planFromCTA =
    typeof location.state?.plan === "object"
      ? location.state.plan.name
      : location.state?.plan || "Free";

  const [form, setForm] = useState({
    username: "",
    password: "",
    plan: planFromCTA || "Free",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Plans (always visible)
  const plans = [
    { name: "Free", label: "Free – 2GB Lifetime", price: 0 },
    { name: "Basic", label: "Basic – 25GB (6 months)", price: 399 },
    { name: "Standard", label: "Standard – 100GB (12 months)", price: 799 },
    { name: "Premium", label: "Premium – 250GB (24 months)", price: 1499 },
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete profile");

      if (form.plan === "Free") {
        await fetchUser(token, dispatch);
        navigate("/dashboard");
      } else {
        navigate("/payment", { state: { plan: form.plan } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (<>
  <Usernav />
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] px-4 py-8 items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-[#4a3627] mb-4">
          Complete Your Profile
        </h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
            required
          />

          {/* 🌿 Always show plan selection */}
          <div className="my-4">
            <label className="block mb-2 text-sm font-semibold text-[#4a3627]">
              Choose a plan
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((p) => {
                const selected = form.plan === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => setForm({ ...form, plan: p.name })}
                    className={`cursor-pointer rounded-lg border px-4 py-3 transition-all duration-200 relative ${
                      selected
                        ? "border-[#e6b197] bg-[#f8ece1] shadow-sm"
                        : "border-[#e2d5c7] bg-[#fffaf5] hover:border-[#e6b197]"
                    }`}
                  >
                    {/* Highlight indicator */}
                    {selected && (
                      <span className="absolute top-2 right-2 text-[#e6b197] font-bold text-lg">
                        ✓
                      </span>
                    )}

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
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition"
          >
            {loading ? "Saving..." : `Complete Profile (${form.plan} Plan)`}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
