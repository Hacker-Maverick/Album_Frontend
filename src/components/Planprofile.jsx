// src/components/Profile/ProfilePlan.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProfilePlan = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (!user?.plan) return null;

  const { plan, totalSpace, spaceUsed, valid_from, valid_till } = user.plan;

  // Convert bytes to GB (1 GB = 1024^3 bytes)
  const bytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);
  const usedGB = parseFloat(bytesToGB(spaceUsed));
  const totalGB = parseFloat(bytesToGB(totalSpace));
  const remainingGB = Math.max(totalGB - usedGB, 0).toFixed(2);
  const usagePercent = totalSpace
    ? Math.min((spaceUsed / totalSpace) * 100, 100).toFixed(1)
    : 0;

  // Format date into "DD Mon YYYY"
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date)) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePlanSelect = (selectedPlan) => {
    setShowModal(false);
    navigate("/payment", { state: { plan: selectedPlan } });
  };

  return (
    <div className="bg-[#fffaf7] flex flex-col items-center justify-center px-4 py-8">
      <h2 className="text-3xl font-bold text-[#70492c] mb-8 text-center">
        Your Plan Details
      </h2>

      {/* Plan Card */}
      <div className="bg-[#fceee2] border border-[#f3e3d6] rounded-2xl shadow-md w-full max-w-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between text-[#70492c] mb-4">
          <div>
            <p className="text-sm text-[#8b5e3c]">Plan Type</p>
            <p className="text-lg font-semibold">{plan}</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <p className="text-sm text-[#8b5e3c]">Total Space</p>
            <p className="text-lg font-semibold">{totalGB} GB</p>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="mt-4 mb-6">
          <p className="text-sm text-[#8b5e3c] mb-1">Space Used: {usedGB} GB</p>
          <div className="relative w-full h-3 bg-[#f7e6d8] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#8b5e3c] transition-all duration-700"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-right text-xs text-[#8b5e3c] mt-1">
            {remainingGB} GB remaining
          </p>
        </div>

        {/* Validity Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between text-[#70492c]">
          <div>
            <p className="text-sm text-[#8b5e3c]">Valid From</p>
            <p className="font-semibold">{formatDate(valid_from)}</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <p className="text-sm text-[#8b5e3c]">Valid Till</p>
            <p className="font-semibold">{formatDate(valid_till)}</p>
          </div>
        </div>
      </div>

      {/* Upgrade Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-6 bg-[#8b5e3c] text-white font-medium px-6 py-2 rounded-md hover:bg-[#70492c] transition"
      >
        Upgrade Plan
      </button>

      {/* Upgrade Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffaf7] rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#70492c] mb-4 text-center">
              Choose Your Plan
            </h3>

            <div className="space-y-4">
              {[
                { name: "Basic", space: "25 GB", duration: "6 months", price: "₹399" },
                { name: "Standard", space: "100 GB", duration: "1 year", price: "₹799" },
                { name: "Premium", space: "250 GB", duration: "2 years", price: "₹1499" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between bg-[#fceee2] border border-[#f3e3d6] rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => handlePlanSelect(p.name)}
                >
                  <div>
                    <p className="text-[#70492c] font-semibold">{p.name}</p>
                    <p className="text-sm text-[#8b5e3c]">
                      {p.space} • {p.duration}
                    </p>
                  </div>
                  <p className="font-bold text-[#70492c]">{p.price}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-[#8b5e3c] text-white py-2 rounded-md hover:bg-[#70492c] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePlan;
