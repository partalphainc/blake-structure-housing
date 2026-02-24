import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ForResidentsSection from "@/components/ForResidentsSection";
import ForOwnersSection from "@/components/ForOwnersSection";
import AvailableUnitsSection from "@/components/AvailableUnitsSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import DestinyChat from "@/components/DestinyChat";

const sectionFade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 1, ease: "easeOut" as const },
};

const SectionDivider = () => (
  <div className="separator-pink my-0" />
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <SectionDivider />
      <motion.div {...sectionFade}>
        <ForResidentsSection />
      </motion.div>
      <SectionDivider />
      <motion.div {...sectionFade}>
        <ForOwnersSection />
      </motion.div>
      <SectionDivider />
      <motion.div {...sectionFade}>
        <AvailableUnitsSection />
      </motion.div>
      <SectionDivider />
      <motion.div {...sectionFade}>
        <ReviewsSection />
      </motion.div>
      <SectionDivider />
      <motion.div {...sectionFade}>
        <ContactSection />
      </motion.div>
      <Footer />
      <DestinyChat />
    </div>
  );
};

export default Index;
