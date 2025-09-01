import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
export default function PlanCards() {

    const navigate = useNavigate();

    const handleClick = (plan) => {
        navigate("/signup", { state: { plan } });
    };
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
            highlight: true, // highlight main plan
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
        <div className=" py-10 px-6">
            <motion.h2 className="text-3xl font-bold text-center text-white mb-2"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}>
                Choose Your Plan
            </motion.h2>
            <motion.h3 className="text-center text-lg text-offWhite mb-12"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}>
                Because the best memories deserve the best care.
            </motion.h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                {plans.map((plan, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.2 } }}
                        key={i}
                        className={`rounded-2xl shadow-lg p-6 flex flex-col items-center justify-between transition transform hover:scale-105 ${plan.highlight
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-800"
                            }`}
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">{plan.name}</h3>
                            <p className="text-3xl font-bold mt-2">{plan.storage}</p>
                            <p className="text-sm opacity-80">{plan.duration}</p>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex items-center gap-2">
                                    ✅ {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleClick(plan)}
                            className={`mt-6 px-5 py-2 rounded-xl font-semibold transition cursor-pointer ${plan.highlight
                                ? "bg-white text-indigo-600 hover:bg-gray-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            {plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
