import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, CalendarDays, Home, BarChart3 } from "lucide-react";

const ContactSection = () => {
  const startDestinyCall = () => {
    window.dispatchEvent(new CustomEvent("startDestinyCall"));
  };

  return (
    <section id="contact" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Get In Touch</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">Let's Talk Housing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our housing representatives are available to discuss availability, partnerships,
            and property management services.
          </p>
        </motion.div>

        {/* Split contact */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Residents */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Home size={20} className="text-primary" />
              </div>
              <h3 className="font-serif font-bold text-xl">Residents</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Housing inquiries</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Application questions</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unit availability</li>
            </ul>
            <Button variant="hero" size="default" onClick={startDestinyCall} className="flex items-center gap-2">
              <span className="relative inline-flex items-center justify-center w-5 h-5 ring-pulse">
                <Phone size={14} />
              </span>
              Contact Housing Team
            </Button>
          </motion.div>

          {/* Investors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-lavender/10 flex items-center justify-center">
                <BarChart3 size={20} className="text-accent-lavender" />
              </div>
              <h3 className="font-serif font-bold text-xl">Investors</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-lavender" /> Portfolio management</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-lavender" /> Property conversion</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-lavender" /> Insurance placement partnerships</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-lavender" /> Revenue optimization consultation</li>
            </ul>
            <Button variant="heroOutline" size="default" asChild>
              <a href="tel:+16362066037" className="flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center w-5 h-5 ring-pulse">
                  <Phone size={14} />
                </span>
                Contact Investment Team
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Contact info strip */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Phone, label: "Phone", value: "(636) 206-6037", href: "tel:+16362066037" },
            { icon: Mail, label: "Email", value: "Destiny@CBlakeEnt.com", href: "mailto:Destiny@CBlakeEnt.com" },
            { icon: Clock, label: "Hours", value: "Mon–Fri 9AM–6PM", href: null },
            { icon: CalendarDays, label: "Consult", value: "By Appointment", href: "#contact" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center p-5 rounded-xl bg-card border border-border"
            >
              {item.href ? (
                <a href={item.href} className="block hover:opacity-80 transition-opacity">
                  <item.icon size={22} className="text-primary mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </a>
              ) : (
                <>
                  <item.icon size={22} className="text-primary mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
