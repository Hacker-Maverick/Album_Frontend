import { motion } from 'motion/react';
import { useScroll, useTransform } from "motion/react";

import pic2 from '../assets/2.jpg';
import pic3 from '../assets/3.jpg';
import pic4 from '../assets/4.jpg';
import pic5 from '../assets/5.jpg';
import pic6 from '../assets/6.jpg';
import pic7 from '../assets/7.jpg';
import pic8 from '../assets/8.jpg';
import pic9 from '../assets/9.jpg';
import pic10 from '../assets/10.jpg';

export default function CircularGrid() {
  const { scrollYProgress } = useScroll();

  // Grow to 2x
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.2], [1,2.2,2.5]);

  // Move upward (in vw for consistency)
  const y = useTransform(scrollYProgress, [0,0.025, 0.2], ["0vh", "1vh", "40vh"]);

  // Fade out
  const opacity = useTransform(scrollYProgress, [0.15, 0.2], [1, 0]);

  return (
    <motion.div
      className="relative"
      style={{
        scale,
        y,
        opacity,
        width: "0px", // let children position themselves
        height: "0px",
      }}
    >
      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[2vw] left-[-6vw]" style={{ width: "6vw", height: "6vw" }}>
        <img src={pic2} alt="pic2" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[-2vw] left-[-4vw]" style={{ width: "4vw", height: "4vw" }}>
        <img src={pic3} alt="pic3" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[8vw] left-[-8vw]" style={{ width: "8vw", height: "8vw" }}>
        <img src={pic4} alt="pic4" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[8vw] left-[4vw]" style={{ width: "6vw", height: "6vw" }}>
        <img src={pic5} alt="pic5" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[8vw] left-[0vw]" style={{ width: "4vw", height: "4vw" }}>
        <img src={pic6} alt="pic6" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[12vw] left-[0vw]" style={{ width: "4vw", height: "4vw" }}>
        <img src={pic7} alt="pic7" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[4vw] left-[8vw]" style={{ width: "4vw", height: "4vw" }}>
        <img src={pic8} alt="pic8" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[4vw] left-[-10vw]" style={{ width: "4vw", height: "4vw" }}>
        <img src={pic10} alt="pic10" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div className="m-1 overflow-hidden absolute border-2 border-transparent top-[0vw] left-[0vw]" style={{ width: "8vw", height: "8vw" }}>
        <img src={pic9} alt="pic9" className="w-full h-full object-cover" />
      </motion.div>
    </motion.div>
  );
}