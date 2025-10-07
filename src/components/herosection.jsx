import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import pic1 from "../assets/1.jpg";
import pic2 from "../assets/2.jpg";
import pic3 from "../assets/3.jpg";
import pic4 from "../assets/4.jpg";
import pic5 from "../assets/5.jpg";
import pic6 from "../assets/6.jpg";
import pic7 from "../assets/7.jpg";
import pic8 from "../assets/8.jpg";
import pic9 from "../assets/9.jpg";
import pic10 from "../assets/10.jpg";

const bannerImages = [
  pic1,
  pic2,
  pic3,
  pic4,
  pic5,
  pic6,
  pic7,
  pic8,
  pic9,
  pic10,
];

export default function HeroSection({ onTryFree, onSeePlans }) {
  const [curIndex, setCurIndex] = useState(0);
  const sliderRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="herosection"
      className="relative w-full h-[100vh] overflow-hidden flex items-center justify-center"
    >
      <div
        className="flex absolute inset-0 h-full transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${curIndex * 100}%)`,
        }}
        ref={sliderRef}
      >
        {bannerImages.map((img, idx) => (
          <div key={idx} className="w-full flex-shrink-0 h-full relative">
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover brightness-75"
              draggable="false"
            />
          </div>
        ))}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 text-offWhite drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
        >
          Moments fade, memories shouldn’t
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-10 text-softBeige drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.12 } }}
        >
          not just photos - your memories beautifully preserved and ready to relive anytime.
        </motion.p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <motion.button
            className="bg-softBeige text-[#7a5a3c] font-bold px-8 py-3 text-lg rounded-xl drop-shadow-lg hover:bg-dustyRose transition"
            onClick={onTryFree}
            whileTap={{ scale: 0.97 }}
          >
            Try for free – don’t lose what matters
          </motion.button>

          <motion.button
            className="bg-[#7a5a3c] text-white  font-bold px-8 py-3 text-lg rounded-xl drop-shadow-lg hover:bg-[#875837] transition"
            onClick={onSeePlans}
            whileTap={{ scale: 0.97 }}
          >
            See plans that fit your story
          </motion.button>
        </div>
      </div>
    </section>
  );
}
