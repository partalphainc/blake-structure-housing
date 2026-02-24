import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ForResidentsSection from "@/components/ForResidentsSection";
import ForOwnersSection from "@/components/ForOwnersSection";
import AvailableUnitsSection from "@/components/AvailableUnitsSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import DestinyChat from "@/components/DestinyChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <div className="section-fade-overlap">
        <ForResidentsSection />
      </div>
      <div className="section-fade-overlap">
        <ForOwnersSection />
      </div>
      <div className="section-fade-overlap bg-[hsl(0,0%,6%)] text-white">
        <AvailableUnitsSection />
      </div>
      <div className="section-fade-overlap">
        <ReviewsSection />
      </div>
      <div className="section-fade-overlap">
        <ContactSection />
      </div>
      <Footer />
      <DestinyChat />
    </div>
  );
};

export default Index;
