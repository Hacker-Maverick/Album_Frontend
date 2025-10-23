// src/components/profile/ProfileInfoDisplay.jsx
import React from "react";
import { CheckCircle } from "lucide-react";

export default function ProfileInfoDisplay({
  user,
  email,
  phone,
  setEmail,
  setPhone,
  loading,
  otpModal,
  setOtpModal,
  otp,
  setOtp,
  passwordModal,
  setPasswordModal,
  oldPassword,
  newPassword,
  setOldPassword,
  setNewPassword,
  handleEmailChange,
  handlePhoneChange,
  handleDeleteAccount,
  handleChangePassword,
  sendOtp,
  verifyOtp,
}) {
  return (
    <div className="flex flex-col items-center text-[#5c3a21] bg-[#fffaf7] px-4">
      <h2 className="text-2xl font-semibold mb-6 mt-4">@{user?.username}</h2>

      {/* Card */}
      <div className="w-full max-w-lg bg-white border border-[#eadbcf] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-5 text-[#3a2c20]">
          Account Details
        </h3>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-[#d4bba4] rounded-lg p-2 focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none"
            />
            <button
              onClick={handleEmailChange}
              disabled={loading}
              className="bg-[#8b5e3c] hover:bg-[#70492c] text-white text-sm px-4 py-1 rounded-lg"
            >
              Save
            </button>
            {user?.emailVerified ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={16} />
                <span>Verified</span>
              </div>
            ) : (
              <button
                onClick={() => sendOtp("email")}
                className="bg-[#fceee2] text-[#8b5e3c] text-sm px-3 py-1 rounded-lg hover:bg-[#f9e1cb]"
              >
                Verify Email
              </button>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">Phone</label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 border border-[#d4bba4] rounded-lg p-2 focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none"
            />
            <button
              onClick={handlePhoneChange}
              disabled={loading}
              className="bg-[#8b5e3c] hover:bg-[#70492c] text-white text-sm px-4 py-1 rounded-lg"
            >
              Save
            </button>
            {user?.phoneVerified ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={16} />
                <span>Verified</span>
              </div>
            ) : (
              <button
                onClick={() => sendOtp("phone")}
                className="bg-[#fceee2] text-[#8b5e3c] text-sm px-3 py-1 rounded-lg hover:bg-[#f9e1cb]"
              >
                Verify Phone
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={() => setPasswordModal(true)}
          className="bg-[#8b5e3c] hover:bg-[#70492c] text-white px-6 py-2 rounded-lg shadow text-sm"
        >
          Change Password
        </button>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg border border-red-300 text-sm"
        >
          Delete Account
        </button>
      </div>

      {/* Timestamps */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Last Updated:{" "}
          {new Date(user?.updatedAt).toLocaleDateString() || "N/A"}
        </p>
        <p>Joined On: {new Date(user?.createdAt).toLocaleDateString() || "N/A"}</p>
      </div>

      {/* OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Verify {otpModal === "email" ? "Email" : "Phone"}
            </h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOtpModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#8b5e3c] text-white hover:bg-[#70492c]"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <input
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-3 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-[#d4bba4] rounded-lg p-2 mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPasswordModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#8b5e3c] text-white hover:bg-[#70492c]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
