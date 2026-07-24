import { motion } from "framer-motion";
import { Home, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const TwoDoorSection = () => {
  return (
    <section className="section-padding bg-[hsl(0,0%,6%)] text-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Where To Next</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">Choose Your Path</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resident door */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/10 via-[hsl(0,0%,8%)] to-[hsl(0,0%,10%)] border border-primary/30 hover:border-primary/60 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-5">
              <Home size={22} className="text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">Looking for a Home?</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Private rooms, furnished units, and second-chance housing across the St. Louis area.
              All utilities included on most units, structured leases, and a real support team behind you.
            </p>
            <Button variant="cta" size="lg" onClick={() => scrollTo("units")} className="group/btn">
              Find a Home
              <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </motion.div>

          {/* Owner door */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative p-8 md:p-10 rounded-2xl bg-gradient-to-br from-accent-lavender/10 via-[hsl(0,0%,8%)] to-[hsl(0,0%,10%)] border border-white/15 hover:border-accent-lavender/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-accent-lavender/15 flex items-center justify-center mb-5">
              <Building2 size={22} className="text-accent-lavender" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">Own Property?</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Turn your property into managed income. Screening, leasing, marketing, and inspections —
              handled with documentation and discipline so you get consistent returns without the operational lift.
            </p>
            <Button
              variant="heroOutline"
              size="lg"
              onClick={() => scrollTo("investors")}
              className="text-white border-white/40 hover:text-white group/btn"
            >
              Partner With Us
              <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TwoDoorSection;
