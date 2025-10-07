import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function EnterpriseSection() {
  const navigate = useNavigate();

  return (
    <section
      id="enterprisesection"
      className="w-full py-20 px-6 text-center text-[#4e443f] bg-[#f5f0eb]"
    >
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      >
        <h2 className="text-4xl font-bold mb-4">Enterprise</h2>
        <p className="text-lg mb-2">Need more than personal storage?</p>
        <p className="text-xl font-semibold">
          Our enterprise solutions scale with your organisation — secure,
          collaborative, and built for teams.
        </p>
      </motion.div>
      <div className="flex justify-center gap-6">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
          onClick={() => navigate("/demo-registration")}
          className="px-6 py-3 bg-[#f9ede8] border-[#e9dac8] border-2 text-[#7a5a3c] font-bold rounded-xl shadow hover:bg-transparent hover:text-[#a0522d] transition"
        >
          Book a Demo
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
          onClick={() => (window.location.href = "mailto:sales@yourdomain.com")}
          className="px-6 py-3 bg-[#f9ede8] border-[#e9dac8] border-2 text-[#7a5a3c] font-bold rounded-xl shadow hover:bg-transparent hover:text-[#a0522d] transition"
        >
          Contact Sales
        </motion.button>
      </div>
    </section>
  );
}
