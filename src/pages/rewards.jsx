import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Copy } from "lucide-react";
import Usernav from "../components/Usernav";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreditsRewards() {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const credits = user?.credits || 0;
  const referralCode = user?.referalCode || "N/A";

  // Plans with prices and descriptions
  const plans = [
    { name: "Basic", creditsNeeded: 399, desc: "25GB, 6 months" },
    { name: "Standard", creditsNeeded: 799, desc: "100GB, 12 months", popular: true },
    { name: "Premium", creditsNeeded: 1499, desc: "250GB, 24 months" },
  ];

  const handleRedeem = async (planName) => {
    try {
      const res = await fetch(`${API_URL}/redeem-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to redeem plan");

      toast.success(data.message, { theme: "colored" });
    } catch (err) {
      toast.error(err.message, { theme: "colored" });
    }
  };

  const handleCopyReferral = () => {
    const shareLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(shareLink);
    toast.info("Referral link copied to clipboard!", { theme: "colored" });
  };

  const handleShareReferral = () => {
    const shareLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const message = `🎉 Join PhotoVault — a secure and private photo album app! 
Sign up using my referral link below and we’ll both get 20 credits to redeem amazing plans.

🔗 ${shareLink}

Redeem your credits later for storage upgrades or premium features!`;
    navigator.clipboard.writeText(message);
    toast.success("Referral message copied! Share it anywhere!", { theme: "colored" });
  };

  return (
    <>
    <Usernav />
    <div className="min-h-screen bg-[#fdf6ee] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-[#4a3627] mb-2">
          Credits & Rewards
        </h1>
        <p className="text-center text-[#6e5542] mb-8">
          Redeem your credits for plans and share with friends to earn more.
        </p>

        {/* Progress Section (Styled Exactly Like Reference) */}
<div className="bg-[#fff5ec] border border-[#ead7c4] rounded-xl p-6 mb-8 shadow-sm">
  {/* Header Row */}
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[#4a3627] font-semibold text-base">
      Your Progress Towards a Plan
    </h3>
  </div>

  {/* Label Row */}
  <div className="flex justify-between items-center mb-1">
    <p className="text-sm text-[#6e5542]">Current Credits</p>
    <p className="text-3xl font-bold text-[#7b4a28]">{credits}</p>
  </div>

  {/* Progress Bar */}
  <div className="relative h-3 w-full bg-[#e7d9ca] rounded-full overflow-hidden mb-2">
    <div
      className="absolute top-0 left-0 h-full bg-[#7b4a28] transition-all duration-500 rounded-full"
      style={{
        width: `${Math.min((credits / 1499) * 100, 100)}%`,
      }}
    ></div>

    {/* Milestone Marks */}
    <div className="absolute top-0 left-[26.6%] h-full w-[2px] bg-[#fff5ec] opacity-70"></div>
    <div className="absolute top-0 left-[53.3%] h-full w-[2px] bg-[#fff5ec] opacity-70"></div>
  </div>

  {/* Labels Below — Inline with size contrast */}
<div className="flex justify-between text-xs text-[#6e5542] mt-1 font-medium">
  <span>0</span>

  <div className="flex items-baseline gap-1">
    <span className="text-[12px] font-semibold text-[#4a3627]">Basic</span>
    <span className="text-[11px] opacity-80">399</span>
  </div>

  <div className="flex items-baseline gap-1">
    <span className="text-[12px] font-semibold text-[#4a3627]">Standard</span>
    <span className="text-[11px] opacity-80">799</span>
  </div>

  <div className="flex items-baseline gap-1">
    <span className="text-[12px] font-semibold text-[#4a3627]">Premium</span>
    <span className="text-[11px] opacity-80">1499</span>
  </div>
</div>

</div>


        {/* Referral Box */}
        <div className="bg-[#fff5ec] border border-[#ead7c4] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center mb-10 shadow-sm">
          <div>
            <p className="text-[#4a3627] font-semibold mb-1">Refer a Friend</p>
            <p className="text-[#6e5542] text-sm">
              Share your code and you'll both get <b>20 credits!</b>
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <input
              readOnly
              value={referralCode}
              className="border border-[#e2d5c7] bg-[#fdf6ee] px-3 py-2 rounded-md text-sm font-mono text-[#4a3627] w-28 text-center"
            />
            <button
              onClick={handleCopyReferral}
              className="px-3 py-2 bg-[#e6b197] text-white rounded-md hover:bg-[#de8d68] text-sm"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleShareReferral}
              className="px-4 py-2 bg-[#c97f5b] text-white rounded-md hover:bg-[#b36d4d] text-sm font-medium"
            >
              Refer Now
            </button>
          </div>
        </div>

        {/* Redeem Plans */}
        <h2 className="text-2xl font-semibold text-center text-[#4a3627] mb-6">
          Redeem Your Credits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const canRedeem = credits >= plan.creditsNeeded;
            return (
              <div
                key={plan.name}
                className={`rounded-xl border ${
                  plan.popular ? "border-[#c97f5b] border-2" : "border-[#e2d5c7]"
                } bg-[#fffaf5] p-6 text-center shadow-sm relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c97f5b] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-[#4a3627]">{plan.name}</h3>
                <p className="text-sm text-[#6e5542] mb-2">{plan.desc}</p>
                <p className="text-2xl font-bold text-[#4a3627] mb-4">
                  {plan.creditsNeeded} <span className="text-sm font-medium">credits</span>
                </p>
                <button
                  onClick={() => handleRedeem(plan.name)}
                  disabled={!canRedeem}
                  className={`w-full py-2 rounded-md font-medium transition ${
                    canRedeem
                      ? "bg-[#e6b197] hover:bg-[#de8d68] text-white"
                      : "bg-[#e2d5c7] text-[#a28b76] cursor-not-allowed"
                  }`}
                >
                  Redeem Now
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
