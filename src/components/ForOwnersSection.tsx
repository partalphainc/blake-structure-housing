import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Search, Home, Megaphone, FileSignature, ClipboardCheck, Camera, Users, TrendingUp, Sofa, FileText, MessageSquare } from "lucide-react";

const allServices = [
  { icon: Home, label: "Converting underperforming properties into structured private-room housing" },
  { icon: Sofa, label: "Furnished unit setup for corporate and insurance placement" },
  { icon: TrendingUp, label: "Revenue optimization strategies" },
  { icon: Search, label: "Professional tenant screening (KeyCheck)" },
  { icon: Megaphone, label: "Marketing across multiple platforms" },
  { icon: FileSignature, label: "Lease coordination & documentation" },
  { icon: ClipboardCheck, label: "Property inspections" },
  { icon: Camera, label: "Optional professional photography" },
  { icon: Users, label: "Community-focused resident placement" },
  { icon: FileText, label: "Documentation-driven model" },
  { icon: ClipboardCheck, label: "Structured agreements" },
  { icon: Search, label: "Screening protocols" },
  { icon: TrendingUp, label: "Revenue strategy optimization" },
  { icon: Users, label: "Community standards enforcement" },
  { icon: MessageSquare, label: "Transparent communication" },
];

const ForOwnersSection = () => {
  return (
    <section id="investors" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">For Investors & Property Owners</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
              Built With Structure.{" "}
              <span className="text-gradient">Managed With Discipline.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We specialize in transforming standard residential properties into structured
              income-generating assets through documentation, systems, and disciplined placement models.
              C. Blake Enterprise is a strategic operator — not a property listing service.
              We build revenue infrastructure for residential assets.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our approach combines professional tenant screening, structured lease agreements,
              and ongoing property management to maximize occupancy and minimize risk.
              Every property in our portfolio is managed with the same discipline and attention
              to detail — from marketing and placement to inspections and community standards enforcement.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Whether you own a single property or a multi-unit portfolio, we provide
              the systems, documentation, and operational infrastructure to turn your asset
              into a consistent, high-performing revenue stream. Our model is built on
              transparency, accountability, and results — so you always know exactly
              how your investment is performing.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              From furnished corporate units and insurance placements to second-chance housing
              and traveling professional accommodations — we identify the highest-value use
              for every unit and execute with precision. That's the C. Blake difference.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We don't just manage properties — we build systems that protect your investment
              long-term. Every decision, from tenant selection to maintenance scheduling,
              is driven by data, documentation, and a commitment to preserving asset value.
              Our partners trust us because we treat every property like it's our own —
              with discipline, transparency, and a relentless focus on performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="#contact">Schedule Owner Consultation</a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="tel:+16362066037" className="flex items-center gap-2">
                  <span className="relative inline-flex items-center justify-center w-5 h-5 ring-pulse">
                    <Phone size={14} />
                  </span>
                  Speak With an Advisor
                </a>
              </Button>
            </div>
          </motion.div>

          <div className="space-y-3">
            {allServices.map((s, i) => (
              <motion.div
                key={`${s.label}-${i}`}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForOwnersSection;
