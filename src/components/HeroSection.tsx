import { motion } from "framer-motion";
import { Phone, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import cblakeLogo from "@/assets/cblake-logo.png";
import walkthroughVideo from "@/assets/unit-walkthrough.mp4";

const HeroSection = () => {
  const openDestinyChat = () => {
    window.dispatchEvent(new CustomEvent("openDestinyChat"));
  };

  const startDestinyCall = () => {
    window.dispatchEvent(new CustomEvent("startDestinyCall"));
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background video faded */}
      <div className="absolute inset-0">
        <video
          src={walkthroughVideo}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      {/* Abstract bg glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-magenta/6 blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center glow-pink">
            <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-20 h-20 object-contain" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight tracking-tight mb-6">
            Structured Housing.{" "}
            <span className="text-gradient">Strategic Returns.</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed mb-4 max-w-3xl mx-auto">
            Professionally managed properties built to perform.
          </p>

          <div className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 max-w-3xl mx-auto space-y-4">
            <p>
              Designed for traveling nurses and physicians,
              government and contract professionals,
              corporate travelers, relocation placements,
              and insurance-based housing placements.
            </p>
            <p>
              We also serve second-chance applicants —
              those rebuilding credit, rental history, or stability —
              including veterans, individuals on fixed incomes,
              and those who may not yet qualify for a traditional lease
              but are ready for structure, accountability, and a fresh start.
            </p>
            <p>
              Whether short-term, contract-based, or traditional —
              we provide structured housing with standards in place.
            </p>
            <p className="font-semibold text-foreground">
              Stability for residents.{" "}
              <span className="text-gradient">Strategy for owners.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 mt-10">
            <Button variant="hero" size="lg" asChild>
              <a href="#units">Find Housing</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="tel:+16362066037">Partner With Us</a>
            </Button>
          </div>
        </motion.div>

        {/* Contact strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center"
        >
          <button
            onClick={startDestinyCall}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="relative inline-flex items-center justify-center w-7 h-7 ring-pulse">
              <Phone size={16} className="text-primary" />
            </span>
            <span className="text-sm">Speak With a Housing Representative</span>
          </button>
          <a
            href="tel:+16362066037"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="relative inline-flex items-center justify-center w-7 h-7 ring-pulse">
              <Phone size={16} className="text-accent-lavender" />
            </span>
            <span className="text-sm">Speak With an Investment Advisor</span>
          </a>
          <button
            onClick={openDestinyChat}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="relative inline-flex items-center justify-center w-7 h-7 ring-pulse">
              <Bot size={16} className="text-primary" />
            </span>
            <span className="text-sm">Chat With Our AI Leasing Rep</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 separator-pink" />
    </section>
  );
};

export default HeroSection;
