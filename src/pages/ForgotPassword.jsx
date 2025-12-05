import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Step 1: Send OTP ---
  const handleSendOtp = async () => {
    if (!identifier.trim()) return toast.warning("Please enter email or phone number");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return toast.warning("Please enter OTP");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setMessage("OTP verified! You can now reset your password.");
        setStep(3);
      } else {
        toast.error(data.error || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async () => {
    if (!newPassword.trim()) return toast.info("Please enter a new password");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStep(4); // success step
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] flex flex-col items-center justify-center p-6 text-[#5c3a21]">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Forgot Password
        </h1>

        {message && (
          <p className="text-center text-sm text-green-700 bg-green-100 py-2 mb-4 rounded-md">
            {message}
          </p>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <label className="block text-sm mb-2">Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-4 focus:outline-none"
              placeholder="Enter registered email or phone"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#8b5e3c] hover:bg-[#70492c] text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <label className="block text-sm mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-4 focus:outline-none"
              placeholder="Enter 6-digit OTP"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#8b5e3c] hover:bg-[#70492c] text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Just a sec..." : "Verify OTP"}
            </button>

            <button
              onClick={handleSendOtp}
              className="text-sm text-[#8b5e3c] mt-3 hover:underline"
            >
              Resend OTP
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-4 focus:outline-none"
              placeholder="Enter new password"
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-[#8b5e3c] hover:bg-[#70492c] text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="text-center">
            <Link
              to="/login"
              className="text-[#8b5e3c] font-medium hover:underline"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
