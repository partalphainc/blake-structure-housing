import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ForResidentsSection from "@/components/ForResidentsSection";
import ForOwnersSection from "@/components/ForOwnersSection";
import AvailableUnitsSection from "@/components/AvailableUnitsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import DestinyChat from "@/components/DestinyChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ForResidentsSection />
      <ForOwnersSection />
      <AvailableUnitsSection />
      <ContactSection />
      <Footer />
      <DestinyChat />
    </div>
  );
};

export default Index;
