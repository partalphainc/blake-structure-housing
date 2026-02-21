import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DollarSign, Anchor, UserCheck, BookOpen } from "lucide-react";

const criteria = [
  { icon: DollarSign, label: "Current Income" },
  { icon: Anchor, label: "Stability" },
  { icon: UserCheck, label: "References" },
  { icon: BookOpen, label: "Commitment to Community Guidelines" },
];

const SecondChanceSection = () => {
  return (
    <section id="second-chance" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-pink mb-3">Second Chance</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Second Chance Housing With Structure
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            We understand that life happens. C. Blake Enterprise evaluates applicants based on
            real-world factors — not just a credit score.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
          {criteria.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border text-center"
            >
              <c.icon size={24} className="text-accent-lavender" />
              <span className="text-sm font-medium">{c.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            We do not guarantee approval. We evaluate responsibly and case-by-case.
          </p>
          <Button variant="hero" size="lg" asChild>
            <a href="#contact">Apply Now</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SecondChanceSection;
