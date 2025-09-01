import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function EnterpriseSection() {
  const navigate = useNavigate();

  return (
    <div className="w-full py-20 px-6 text-center text-offWhite">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}>
        <h2 className="text-4xl font-bold mb-4">Enterprise</h2>
        <p className="text-lg mb-2">Need more than personal storage?</p>
        <p className="text-xl font-semibold mb-8">
          Our enterprise solutions scale with your organisation — secure, collaborative, and built for teams.
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-6">
        <motion.button
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
          onClick={() => navigate("/demo-registration")}
          className="px-6 py-3 bg-softBeige border-softBeige border-2 text-mutedBlue font-bold rounded-xl shadow-lg hover:bg-transparent hover:text-softBeige transition hover:cursor-pointer"
        >
          Book a Demo
        </motion.button>

        <motion.button
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
          onClick={() => (window.location.href = "mailto:sales@yourdomain.com")}
          className="px-6 py-3 bg-softBeige border-softBeige border-2 text-mutedBlue font-bold rounded-xl shadow-lg hover:bg-transparent hover:text-softBeige transition hover:cursor-pointer"
        >
          Contact Sales
        </motion.button>
      </div>
    </div>
  );
}
