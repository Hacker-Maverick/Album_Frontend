import {HashLink} from 'react-router-hash-link';
import {motion} from "motion/react"

export default function Footer() {
  return (
    <footer className="w-full text-offWhite">
      {/* Top Section */}
      <motion.div className="bg-gradient-to-b from-gray-800 to-gray-700 py-5 text-center"
                initial={{ opacity: 0 }}
        whileInView={{ opacity: 1,  transition: { duration: 0.75 } }}>
        <p className="text-sm">© {new Date().getFullYear()} My Album — All Rights Reserved</p>
      </motion.div>

      {/* Bottom Section */}
      <motion.div className="bg-gradient-to-b from-gray-800 to-gray-700 py-5 px-6 grid grid-cols-1 md:grid-cols-2 gap-8"
              initial={{ opacity: 0}}
        whileInView={{ opacity: 1,  transition: { duration: 0.75 } }}>
        
        {/* Quick Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><HashLink smooth to="#plansection" className="hover:underline">Plans</HashLink></li>
            <li><HashLink smooth to="#whyussection" className="hover:underline">Why Us</HashLink></li>
            <li><HashLink smooth to="#enterprisesection" className="hover:underline">Enterprise</HashLink></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-2">
            <li>
              <a href="mailto:support@myalbum.com" className="hover:underline">
                support@myalbum.com
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline">Terms & Conditions</a>
            </li>
            <li>
              <a href="/privacy" className="hover:underline">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </motion.div>
    </footer>
  );
}
