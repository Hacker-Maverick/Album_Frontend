import bg from '../assets/bg2.jpg';
import Typer from '../components/typer.jsx';
import Navbar from '../components/Homenav.jsx';
import CircularGrid from '../components/Photos.jsx';
import Plancards from '../components/plancards.jsx';
import WhyUs from '../components/whyus.jsx';
import EnterpriseSection from '../components/enterprise.jsx';
import Footer from '../components/homefooter.jsx';
import { motion, useScroll, useTransform } from "motion/react"
import { HashLink } from 'react-router-hash-link';
import { useNavigate } from 'react-router-dom';

export default function Home() {

    const { scrollYProgress } = useScroll()

     const navigate = useNavigate();
  const goToSignup = () => {
    navigate("/signup");
  }

    //Motion 
    const hero = useTransform(scrollYProgress, [0, 0.025], [1, 0])
    const ctaopacity = useTransform(scrollYProgress, [0, 0.03], [1, 0])
    const planopacity = useTransform(scrollYProgress, [0.25, 0.3], [0, 1])

    return (
        <div style={{ backgroundImage: `url(${bg})` }} className='bg-fixed bg-cover bg-center w-full bg-no-repeat text-white overflow-x-hidden'>
            <div>
                <Navbar />
            </div>
            <div id='herosection' className='flex justify-center text-center w-full h-[1000px]'>
                <div>
                    <motion.div className='mt-30 md:text-4xl sm:text-3xl text-2xl font-bold mx-10 drop-shadow-lg' style={{ opacity: hero }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                        Moments fade, Memories shouldn't
                    </motion.div>
                    <motion.div className='mt-10 sm:text-2xl text-xl font-semibold text-offWhite mx-10' style={{ opacity: hero }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                        Not just photos - your memories beautifully preserved and ready to relive anytime.
                    </motion.div>
                    <motion.div className=' sm:text-2xl text-xl font-semibold text-softBeige flex mt-5 mx-10' style={{ opacity: hero }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                        <div className='w-1/2 text-right'>Perfectly&nbsp;</div>
                        <div className='w-1/2 text-left'>
                            {<Typer />}
                        </div>
                    </motion.div>
                    <motion.div className='flex justify-center items-center mt-10 mb-[16vw]' initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                        <CircularGrid />
                    </motion.div>
                    <div className='flex justify-center items-center sticky top-0 '>
                        <motion.div className='text-center text-lg font-semibold text-offWhite mt-10 mx-10 max-w-[500px] rounded-full border-2 border-softBeige px-5 py-3 hover:bg-softBeige/20 cursor-pointer drop-shadow-lg w-[40vw]' style={{ opacity: ctaopacity }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }} onClick={goToSignup}>
                            Try for Free - don't lose what matters
                        </motion.div>
                        <HashLink smooth to="#plansection">
                            <motion.div className='text-center text-lg font-semibold text-offWhite mt-10 mx-10 max-w-[500px] rounded-full border-2 border-softBeige px-5 py-3 hover:bg-softBeige/20 cursor-pointer drop-shadow-lg w-[40vw]' style={{ opacity: ctaopacity }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                                See plans that fits your story
                            </motion.div>
                        </HashLink>
                    </div>
                </div>
            </div>
            <motion.div className='flex justify-center items-center' id='plansection' style={{ opacity: planopacity }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                <Plancards />
            </motion.div>
            <div id='whyussection'>
                <WhyUs />
            </div>
            <div id='enterprisesection'>
                <EnterpriseSection />
            </div>
            <Footer />
        </div>
    )
}
