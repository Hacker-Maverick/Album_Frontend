// src/pages/Payment.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {loadRazorpay} from "../utils/loadRazorpay.js";
import { fetchUser } from "../utils/fetchUser.js"

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
console.log(token)
  const plan = location.state?.plan || "Free";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect immediately if Free plan
    if (plan.toLowerCase() === "free") {
      fetchUser(data.token, dispatch)
      navigate("/dashboard");
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    // 1️⃣ Load Razorpay SDK
    const res = await loadRazorpay();
    if (!res) {
      setError("Razorpay SDK failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 2️⃣ Create order on backend
      const orderRes = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");
      const data = await orderRes.json();

      // 3️⃣ Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Albumify",
        description: `${plan} Subscription`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 4️⃣ Verify payment on backend
            const verifyRes = await fetch(`${API_URL}/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");
            const verifyData = await verifyRes.json();

            alert("✅ Payment successful! Plan activated.");
            fetchUser(data.token, dispatch)
            navigate("/dashboard");
          } catch (err) {
            console.error(err);
            setError(err.message);
          }
        },
        prefill: {
          email: "", // optional: you can prefill from Redux user state
        },
        theme: { color: "#a0522d" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#fdf6ee] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-[#4a3627] mb-4">
          Complete Payment
        </h2>
        <p className="mb-6">
          You selected the <strong>{plan}</strong> plan.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 bg-[#e6b197] text-white font-semibold rounded-md hover:bg-[#de8d68] transition"
        >
          {loading ? "Processing..." : `Pay & Activate ${plan} Plan`}
        </button>
      </div>
    </div>
  );
}
