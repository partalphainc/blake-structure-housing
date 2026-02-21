import { motion } from "framer-motion";
import { Shield, Home, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Home, title: "Private Room Living", desc: "Your own private room — never shared bedrooms." },
  { icon: Shield, title: "Stable Environment", desc: "Community standards enforced for safety and comfort." },
  { icon: FileText, title: "Clear Agreements", desc: "Transparent weekly or monthly terms. No hidden fees." },
  { icon: Users, title: "Supportive Community", desc: "Live alongside professionals and individuals building their future." },
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
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-pink mb-3">For Residents</p>
          <h2 className="text-3xl md:text-4xl font-bold">Your Path to Stable Housing</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <b.icon size={22} className="text-accent-pink mb-3" />
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <a href="#units">View Available Units</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForResidentsSection;
