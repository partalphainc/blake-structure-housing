import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, CalendarDays } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Get In Touch</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Talk Housing</h2>
          <p className="text-muted-foreground mb-10">
            Our housing representatives are available to discuss availability, partnerships,
            and property management services.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
          {[
            { icon: Phone, label: "Phone", value: "(000) 000-0000" },
            { icon: Mail, label: "Email", value: "info@cblakeenterprise.com" },
            { icon: Clock, label: "Hours", value: "Mon–Fri 9AM–6PM" },
            { icon: CalendarDays, label: "Consult", value: "By Appointment" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center p-6 rounded-xl bg-card border border-border"
            >
              <item.icon size={24} className="text-primary mx-auto mb-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Schedule a Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
