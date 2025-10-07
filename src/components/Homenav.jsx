import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion } from "motion/react";

function Navbar() {
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <motion.nav
      className="w-full fixed top-0 left-0 z-50 px-8 py-4 flex items-center justify-between bg-transparent"
      style={{
        boxShadow: "0 2px 8px rgba(160,82,45,0.06)",
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 1 } }}
    >
      <span
        className="font-bold text-2xl tracking-wide"
        style={{ color: "#a0522d", letterSpacing: "1.2px" }}
      >
        Albumify
      </span>
      <div className="flex space-x-2 md:space-x-6 items-center">
        <HashLink
          className="rounded-xl px-4 py-2  text-white drop-shadow-2xl font-medium hover:bg-[#f1e5da] hover:text-[#7a5a3c] transition"
          smooth
          to="#plansection"
        >
          Plans
        </HashLink>
        <HashLink
          className="rounded-xl px-4 py-2  text-white drop-shadow-2xl font-medium hover:bg-[#f1e5da] hover:text-[#7a5a3c] transition"
          smooth
          to="#whyussection"
        >
          Why us
        </HashLink>
        <HashLink
          className="rounded-xl px-4 py-2  text-white drop-shadow-2xl font-medium hover:bg-[#f1e5da] hover:text-[#7a5a3c] transition"
          smooth
          to="#enterprisesection"
        >
          Enterprise
        </HashLink>
        <button
          className="rounded-xl px-5 py-2 bg-[#a0522d] text-white font-semibold shadow hover:bg-[#875837] transition"
          onClick={goToLogin}
        >
          Login
        </button>
      </div>
    </motion.nav>
  );
}

export default Navbar;
