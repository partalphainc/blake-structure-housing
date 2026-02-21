import { motion } from "framer-motion";
import { FileText, ClipboardCheck, Search, TrendingUp, Users, MessageSquare } from "lucide-react";

const pillars = [
  { icon: FileText, label: "Documentation-driven model" },
  { icon: ClipboardCheck, label: "Structured agreements" },
  { icon: Search, label: "Screening protocols" },
  { icon: TrendingUp, label: "Revenue strategy optimization" },
  { icon: Users, label: "Community standards enforcement" },
  { icon: MessageSquare, label: "Transparent communication" },
];

const PerformanceSection = () => {
  return (
    <section id="performance" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Investor Trust</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Built With Structure.{" "}
            <span className="text-gradient">Managed With Discipline.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon size={20} className="text-primary" />
              </div>
              <span className="font-medium">{p.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;
