import React, { useState } from "react";
import ProfileInfo from "../components/Profileinfo";
import ProfilePlan from "../components/Planprofile";
import UserNav from "../components/usernav";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Profile Info" },
    { id: "plan", label: "Plan & Storage" },
  ];

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-[#fffaf7] text-[#5c3a21] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6 text-center">
            My Profile
          </h1>

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-8 border-b border-[#d4bba4]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-[#8b5e3c] border-[#8b5e3c]"
                    : "text-gray-500 border-transparent hover:text-[#8b5e3c]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {activeTab === "info" && <ProfileInfo />}
            {activeTab === "plan" && <ProfilePlan />}
          </div>
        </div>
      </div>
    </>
  );
}
