import { motion } from "framer-motion";
import { Home, Sofa, Building, Shield, Zap, CalendarDays, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const offerings = [
  { icon: Home, title: "Private Rooms", desc: "Never shared bedrooms — every resident gets a private room." },
  { icon: Sofa, title: "Furnished Units", desc: "Move-in ready units for traveling professionals." },
  { icon: Building, title: "Unfurnished Units", desc: "Traditional unfurnished residential units available." },
  { icon: Shield, title: "Insurance Replacement", desc: "Structured housing for insurance placement needs." },
  { icon: Zap, title: "Utilities Included", desc: "All utilities included in designated housing models." },
  { icon: CalendarDays, title: "Flexible Terms", desc: "Weekly and monthly structured agreements." },
  { icon: DollarSign, title: "Second-Chance Evaluations", desc: "Structured evaluations based on income, stability, and references." },
];

const criteria = [
  "Current income",
  "Stability",
  "References",
  "Commitment to community standards",
];

const ForResidentsSection = () => {
  return (
    <section id="residents" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">For Residents</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Your Path to <span className="text-gradient">Structured Housing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This is structured housing — not casual renting. We provide professional, documented
            housing solutions for individuals building their future.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {offerings.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <o.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{o.title}</h3>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Evaluation criteria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10 p-6 rounded-xl bg-card border border-border"
        >
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">We Evaluate Applicants Based On</h4>
          <div className="grid grid-cols-2 gap-3">
            {criteria.map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <a href="#units">View Available Units</a>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <a href="#contact">Apply Now</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForResidentsSection;
