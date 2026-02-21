import { motion } from "framer-motion";
import { Phone, Mail, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
      </div>

      <div className="container mx-auto relative z-10 px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Structured Housing.{" "}
            <span className="text-gradient">Real Second Chances.</span>{" "}
            Professional Management.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            We provide private room housing in shared residential settings while delivering
            professional property management solutions for owners and stable housing solutions
            for residents rebuilding their future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Button variant="hero" size="lg" asChild>
              <a href="#units">View Available Units</a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href="#owners">Partner With Us</a>
            </Button>
          </div>
        </motion.div>

        {/* Contact strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 sm:gap-10"
        >
          <a href="tel:+10000000000" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={18} className="text-accent-pink" />
            <span className="text-sm">Call a Housing Representative</span>
          </a>
          <a href="mailto:info@cblakeenterprise.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Mail size={18} className="text-accent-lavender" />
            <span className="text-sm">Email Us</span>
          </a>
          <a href="#contact" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <CalendarDays size={18} className="text-primary" />
            <span className="text-sm">Schedule a Consultation</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
