import Navbar from "../components/Homenav.jsx";
import HeroSection from "../components/herosection.jsx";
import PlanCards from "../components/plancards.jsx";
import WhyUs from "../components/whyus.jsx";
import EnterpriseSection from "../components/enterprise.jsx";
import Footer from "../components/homefooter.jsx";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection
        onTryFree={() => {
          const plans = document.getElementById("plansection");
          if (plans) plans.scrollIntoView({ behavior: "smooth" });
        }}
        onSeePlans={() => {
          const plans = document.getElementById("plansection");
          if (plans) plans.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <PlanCards />
      <WhyUs />
      <EnterpriseSection />
      <Footer />
    </>
  );
}
