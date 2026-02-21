import { motion } from "framer-motion";
import { Phone, BarChart3, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
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
          {/* Circular accent */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-primary/40 flex items-center justify-center glow-pink">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-magenta" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight tracking-tight mb-6">
            Structured Housing.{" "}
            <span className="text-gradient">Strategic Returns.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
            Private room housing. Furnished and unfurnished units. Second-chance structure.
            Insurance placement solutions. Professionally managed assets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button variant="hero" size="lg" asChild>
              <a href="#residents">Find Housing</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="#investors">Partner With Us</a>
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
          <a href="tel:+10000000000" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={18} className="text-primary" />
            <span className="text-sm">Speak With a Housing Representative</span>
          </a>
          <a href="#investors" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <BarChart3 size={18} className="text-accent-lavender" />
            <span className="text-sm">Speak With an Investment Advisor</span>
          </a>
          <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Bot size={18} className="text-primary" />
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
