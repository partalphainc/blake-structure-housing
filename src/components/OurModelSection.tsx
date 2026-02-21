import { motion } from "framer-motion";
import { Home, Zap, FileText, Users, ShieldCheck, Search, CalendarCheck } from "lucide-react";

const features = [
  { icon: Home, title: "Private Room", desc: "Every resident receives a private room in a shared residential setting." },
  { icon: Zap, title: "Utilities Included", desc: "All utilities are included in the rental agreement." },
  { icon: CalendarCheck, title: "Flexible Agreements", desc: "Structured weekly or monthly agreements tailored to resident needs." },
  { icon: FileText, title: "Clear Guest Agreements", desc: "Transparent documentation and community standards for all parties." },
  { icon: Search, title: "Background & Income Review", desc: "Professional screening process for every applicant." },
  { icon: Users, title: "Community Standards", desc: "Enforced community guidelines to maintain a safe environment." },
  { icon: ShieldCheck, title: "KeyCheck Screening", desc: "Professional documentation and screening via KeyCheck." },
];

const OurModelSection = () => {
  return (
    <section id="model" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-lavender mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Private Room Housing Model</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors glow-primary group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurModelSection;
