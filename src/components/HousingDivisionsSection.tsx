import { motion } from "framer-motion";
import { Home, Sofa, Building, Shield, Briefcase, RefreshCw } from "lucide-react";

const divisions = [
  { icon: Home, title: "Private Room Housing", desc: "Structured private rooms in shared residential settings." },
  { icon: Sofa, title: "Furnished Corporate Units", desc: "Move-in ready units for corporate and traveling professionals." },
  { icon: Building, title: "Unfurnished Residential Units", desc: "Traditional unfurnished units with structured agreements." },
  { icon: Shield, title: "Insurance Replacement Housing", desc: "Placement solutions for insurance-displaced residents." },
  { icon: Briefcase, title: "Traveling Professional Units", desc: "Short and mid-term housing for mobile professionals." },
  { icon: RefreshCw, title: "Second-Chance Structured Placements", desc: "Evaluated placements for individuals rebuilding stability." },
];

const HousingDivisionsSection = () => {
  return (
    <section id="divisions" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Housing Divisions</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
            Our <span className="text-gradient">Housing Models</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer overflow-hidden"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <d.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HousingDivisionsSection;
