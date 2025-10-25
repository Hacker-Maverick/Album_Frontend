import React, { useState , useEffect, useRef} from "react";
import { useSelector,useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUser } from "../utils/fetchUser";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function VerifyEmail() {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const planFromCTA = location.state?.plan || "Free";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
    const hasRun = useRef(false);

  // 🔁 Resend OTP
  const resendOtp = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/email/send`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) toast.success(data.message || "OTP sent again!", { theme: "colored" });
      else toast.error(data.error || "Failed to resend OTP", { theme: "colored" });
    } catch {
      toast.error("Server error while resending OTP", { theme: "colored" });
    } finally {
      setResending(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.warn("Please enter OTP first", { theme: "colored" });
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/email/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Email verified successfully!", { theme: "colored" });
        setTimeout(async () => {
          if (planFromCTA === "Free") {
            await fetchUser(token, dispatch);
            navigate("/dashboard")
        }
          else navigate("/payment", { state: { plan: planFromCTA } });
        }, 1200);
      } else toast.error(data.error || "Invalid OTP", { theme: "colored" });
    } catch {
      toast.error("Server error while verifying", { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (user?.email && !hasRun.current) {
    resendOtp(false);
    hasRun.current = true;
  }
}, []);

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#fff5ec] border border-[#ead7c4] rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-semibold text-[#4a3627] mb-2">Verify Your Email</h2>
        <p className="text-sm text-[#6e5542] mb-6">
          We’ve sent a 6-digit verification code to your email:
          <br />
          <span className="font-medium text-[#4a3627]">{user?.email}</span>
        </p>

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full p-3 border border-[#e2d5c7] rounded-md text-center tracking-widest text-lg font-semibold text-[#4a3627] bg-[#fffaf5] focus:outline-none focus:ring-2 focus:ring-[#e6b197]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-5 text-sm text-[#6e5542]">
          Didn’t receive the code?{" "}
          <button
            onClick={resendOtp}
            disabled={resending}
            className="text-[#c97f5b] font-medium hover:underline disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <p className="text-xs text-[#9c826b] mt-6">
          Please check your spam folder if you don’t see the email.
        </p>
      </div>
    </div>
  );
}
