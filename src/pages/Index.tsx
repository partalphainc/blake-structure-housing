import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import OurModelSection from "@/components/OurModelSection";
import ForOwnersSection from "@/components/ForOwnersSection";
import ForResidentsSection from "@/components/ForResidentsSection";
import SecondChanceSection from "@/components/SecondChanceSection";
import AvailableUnitsSection from "@/components/AvailableUnitsSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <OurModelSection />
      <ForOwnersSection />
      <ForResidentsSection />
      <SecondChanceSection />
      <AvailableUnitsSection />
      <WhyChooseUsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
