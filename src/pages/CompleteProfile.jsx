import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ import useLocation
import { setUser } from "../../store/userSlice";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const location = useLocation(); // ✅ read plan from location.state
  const planFromSignup = location.state?.plan || { name: "Free"};

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to complete profile");
      const data = await res.json();

      // ✅ Pass the original plan to payment page
      navigate("/payment", { state: { plan: planFromSignup.name } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#fdf6ee] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-[#4a3627] mb-4">Complete Your Profile</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]" required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-3 border border-[#e2d5c7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e6b197]" required />

          <button type="submit" disabled={loading} className="w-full py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition">
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
