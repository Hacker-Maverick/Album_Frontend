import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function PlanCards() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      storage: "2 GB",
      duration: "Lifetime",
      features: ["Secure storage", "Easy uploads", "Access anywhere"],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Basic",
      storage: "25 GB",
      duration: "6 Months",
      features: ["Secure storage", "Priority support", "Access anywhere"],
      cta: "Choose Basic",
      highlight: false,
    },
    {
      name: "Standard",
      storage: "100 GB",
      duration: "1 Year",
      features: ["Secure storage", "Access anywhere", "Priority support"],
      cta: "Go Standard",
      highlight: true,
    },
    {
      name: "Premium",
      storage: "250 GB",
      duration: "2 Years",
      features: ["Secure storage", "Access anywhere", "Premium support"],
      cta: "Unlock Premium",
      highlight: false,
    },
  ];

  return (
    <section
      id="plansection"
      className="py-20 px-4 bg-softBeige"
    >
      <motion.h2 className="text-4xl font-bold text-center mb-2 text-gray-800">
        Our Plans
      </motion.h2>

      <motion.h3 className="text-center text-lg text-gray-500 mb-12">
        Because the best memories deserve the best care.
      </motion.h3>

      <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            className={`rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 transition transform hover:scale-105 ${
              plan.highlight
                ? "border-[#a0522d] bg-[#f5efea]"
                : "border-[#ededed] bg-white"
            }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.15 } }}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">{plan.storage}</p>
              <p className="text-sm opacity-70 mb-2">{plan.duration}</p>
            </div>
            <ul className="mt-2 mb-6 space-y-2 text-gray-600">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup", { state: { plan } })}
              className={`mt-auto px-6 py-2 rounded-xl font-semibold transition cursor-pointer ${
                plan.highlight
                  ? "bg-[#a0522d] text-white hover:bg-[#855435]"
                  : "bg-white border border-[#a0522d] text-[#a0522d] hover:bg-[#eee6df]"
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
