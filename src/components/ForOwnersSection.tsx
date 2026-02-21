import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Home, Megaphone, FileSignature, ClipboardCheck, Camera, Users } from "lucide-react";

const services = [
  { icon: Search, label: "Professional Tenant Screening" },
  { icon: Home, label: "Private Room Housing Conversion Strategy" },
  { icon: Megaphone, label: "Marketing Across Multiple Platforms" },
  { icon: FileSignature, label: "Lease Signing & Move-In Coordination" },
  { icon: ClipboardCheck, label: "Property Inspections" },
  { icon: Camera, label: "Optional Professional Photography" },
  { icon: Users, label: "Community-Focused Resident Placement" },
];

const ForOwnersSection = () => {
  return (
    <section id="owners" className="section-padding">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">For Property Owners</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Partner With C. Blake Enterprise
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We specialize in optimizing underperforming residential properties into structured
              private-room housing models. Let us handle the management while you grow your portfolio.
            </p>
            <Button variant="hero" size="lg" asChild>
              <a href="#contact">Schedule Owner Consultation</a>
            </Button>
          </motion.div>

          <div className="space-y-4">
            {services.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
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
