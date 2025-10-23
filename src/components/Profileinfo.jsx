// src/components/profile/ProfileInfoLogic.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileInfoDisplay from "./Profileinfo2";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfileInfoLogic() {
  const user = useSelector((s) => s.user.user);
  const token = useSelector((s) => s.user.token);

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const notify = (msg) => alert(msg);

  // --- EMAIL CHANGE ---
  const handleEmailChange = async () => {
    if (!email.trim()) return notify("Please enter a valid email");
    if (!window.confirm("Are you sure you want to change your email?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/email/change`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) notify("Email updated successfully. Please verify it.");
      else notify(data.error || "Failed to update email");
    } catch {
      notify("Server error");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  // --- PHONE CHANGE ---
  const handlePhoneChange = async () => {
    if (!/^\d{10}$/.test(phone))
      return notify("Enter a valid 10-digit phone number");
    if (!window.confirm("Are you sure you want to change your phone number?"))
      return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/phone/change`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) notify("Phone updated successfully. Please verify it.");
      else notify(data.error || "Failed to update phone");
    } catch {
      notify("Server error");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  // --- DELETE ACCOUNT ---
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible."
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Your account has been deleted successfully.");
        window.location.href = "/";
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // --- PASSWORD CHANGE (via modal) ---
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword)
      return notify("Please fill both password fields");
    if (newPassword.length < 6)
      return notify("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setPasswordModal(false);
      } else alert(data.error || "Failed to change password");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // --- OTP HANDLING ---
  const sendOtp = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === "email" ? "/email/send" : "/mobile/send";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "OTP sent successfully");
        setOtpModal(type);
      } else alert(data.error || "Failed to send OTP");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) return alert("Enter OTP first");
    setLoading(true);
    try {
      const endpoint =
        otpModal === "email" ? "/email/verify" : "/mobile/verify";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verification successful");
        setOtpModal(null);
      } else alert(data.error || "Invalid OTP");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <ProfileInfoDisplay
      user={user}
      email={email}
      phone={phone}
      setEmail={setEmail}
      setPhone={setPhone}
      loading={loading}
      otpModal={otpModal}
      setOtpModal={setOtpModal}
      otp={otp}
      setOtp={setOtp}
      passwordModal={passwordModal}
      setPasswordModal={setPasswordModal}
      oldPassword={oldPassword}
      newPassword={newPassword}
      setOldPassword={setOldPassword}
      setNewPassword={setNewPassword}
      handleEmailChange={handleEmailChange}
      handlePhoneChange={handlePhoneChange}
      handleDeleteAccount={handleDeleteAccount}
      handleChangePassword={handleChangePassword}
      sendOtp={sendOtp}
      verifyOtp={verifyOtp}
    />
  );
}
