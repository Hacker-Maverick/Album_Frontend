import sharepic from '../assets/share.jpg';
import organised from '../assets/organised.jpg';
import pricing from '../assets/price.jpg';
import { motion } from 'motion/react';

export default function WhyUs() {
  return (
    <section className="py-16 px-6 md:px-20">
      {/* Heading */}
      <motion.div className="text-center max-w-3xl mx-auto mb-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}>
        <h2 className="text-4xl font-bold  white drop-shadow-md">Why Us?</h2>
        <p className="text-lg offWhite mt-3 italic">
          Because one day, these photos will be all you have to look back on.
        </p>
      </motion.div>

      {/* Points */}
      <div className="space-y-16">
        {/* Point 1 */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <motion.div className="md:w-1/2 text-center md:text-right"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <h3 className="text-2xl font-semibold  white">📤 Hassle-free Sharing</h3>
            <p className="softBeige mt-3">
              Just tag the person you want to share your photos with — and done.
              No complicated links, no confusion. Simple and instant.
            </p>
          </motion.div>
          <motion.div className="md:w-1/2 flex justify-center md:justify-start mt-6 md:mt-0 h-[15vw] min-w-40 max-w-60 min-h-40 max-h-48 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <div className='rounded-3xl overflow-hidden h-40 w-40'>
              <img src={sharepic} alt="photo-sharing" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>

        {/* Point 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center md:items-start md:space-x-8 md:space-x-reverse">
          <motion.div className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <h3 className="text-2xl font-semibold  white">📂 Perfectly Organised</h3>
            <p className="softBeige mt-3">
              Create albums, sync your photos, and keep them beautifully organised
              without lifting a finger. Memories made simple.
            </p>
          </motion.div>
          <motion.div className="md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0  h-[15vw] min-w-40 max-w-60 min-h-40 max-h-48 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 }}}>
            <div className='rounded-3xl overflow-hidden w-40 h-40'>
              <img src={organised} alt="photo-sharing" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>

        {/* Point 3 */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <motion.div className="md:w-1/2 text-center md:text-right"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <h3 className="text-2xl font-semibold  white">💰 Pricing that makes sense</h3>
            <p className="softBeige mt-3">
              Enjoy generous free storage and affordable plans.
              Pay only for what you need — no hidden fees, no surprises.
            </p>
          </motion.div>
          <motion.div className="md:w-1/2 flex justify-center md:justify-start mt-6 md:mt-0 h-[15vw] min-w-40 max-w-60 min-h-40 max-h-48"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <div className='rounded-3xl overflow-hidden w-40 h-40 '>
              <img src={pricing} alt="photo-sharing" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
