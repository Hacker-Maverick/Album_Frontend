import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion } from "motion/react"

function Navbar() {

  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/login");
  }

  return (
    <motion.nav className="w-full fixed top-0 left-0 z-50 bg-transparent px-8 py-4 flex items-center justify-between"
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 , transition: { duration: 1 } }}>
      {/* Left: Name/Logo */}
      <div className="text-2xl font-bold text-offWhite drop-shadow-lg">
        My Album
      </div>

      {/* Right: 4 Buttons */}
      <div className="space-x-4">
        <HashLink className="text-softBeige hover:text-dustyRose cursor-pointer drop-shadow-lg" smooth to="#plansection">Plans</HashLink>
        <HashLink className="text-softBeige hover:text-dustyRose cursor-pointer drop-shadow-lg" smooth to="#whyussection">Why us</HashLink>
        <HashLink className="text-softBeige hover:text-dustyRose cursor-pointer drop-shadow-lg" smooth to="#enterprisesection">Enterprise</HashLink>
        <button className="text-softBeige hover:text-dustyRose cursor-pointer drop-shadow-lg" onClick={goToLogin}>Login</button>
      </div>
    </motion.nav>
  );
}

export default Navbar;
