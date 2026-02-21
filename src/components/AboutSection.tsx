import { motion } from "framer-motion";
import { Users, Briefcase, RefreshCw, Globe, Heart, Shield } from "lucide-react";

const serveItems = [
  { icon: Users, label: "Property Owners" },
  { icon: Briefcase, label: "Working Professionals" },
  { icon: RefreshCw, label: "Individuals Rebuilding Credit" },
  { icon: Heart, label: "Second-Chance Applicants" },
  { icon: Globe, label: "Traveling Workers" },
  { icon: Shield, label: "Community Program Referrals" },
];

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-pink mb-3">About Us</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Who We Are</h2>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                C. Blake Enterprise is a residential property management company specializing in
                private rooms within shared housing environments. We do not offer shared bedrooms
                — every resident has a private room.
              </p>
              <p>
                We operate with structure, documentation, and professionalism while providing
                opportunities for individuals who may need second-chance housing options.
              </p>
              <p>
                Founded by Crystal Blake, C. Blake Enterprise was built on the belief that
                housing can be both structured and compassionate.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-accent-lavender mb-4">We Serve</p>
              <div className="grid grid-cols-2 gap-4">
                {serveItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-4 rounded-lg bg-card/60 border border-border"
                  >
                    <item.icon size={18} className="text-primary shrink-0" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
