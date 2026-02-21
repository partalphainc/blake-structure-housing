import { motion } from "framer-motion";
import { FileText, Home, DollarSign, Users, Briefcase, Heart } from "lucide-react";

const reasons = [
  { icon: FileText, label: "Structured Documentation" },
  { icon: Home, label: "Private Rooms Only" },
  { icon: DollarSign, label: "Transparent Pricing" },
  { icon: Users, label: "Community Accountability" },
  { icon: Briefcase, label: "Professional Management" },
  { icon: Heart, label: "Real Housing Solutions" },
];

const WhyChooseUsSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-pink mb-3">Our Promise</p>
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose Us</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-lavender/10 flex items-center justify-center shrink-0">
                <r.icon size={20} className="text-accent-lavender" />
              </div>
              <span className="font-medium">{r.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
