import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, Wifi, Droplets, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const units = [
  {
    location: "Atlanta, GA — Zone A",
    rate: "$185/week",
    deposit: "$250 move-in deposit",
    amenities: "Furnished, WiFi, Kitchen Access",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
  },
  {
    location: "Atlanta, GA — Zone B",
    rate: "$175/week",
    deposit: "$200 move-in deposit",
    amenities: "Furnished, Shared Living, Laundry",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
  },
  {
    location: "Decatur, GA",
    rate: "$700/month",
    deposit: "$300 move-in deposit",
    amenities: "Furnished, WiFi, Parking",
    utilities: "All Utilities Included",
    minStay: "60 days minimum",
  },
  {
    location: "College Park, GA",
    rate: "$165/week",
    deposit: "$200 move-in deposit",
    amenities: "Furnished, Kitchen, Common Area",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
  },
];

const AvailableUnitsSection = () => {
  return (
    <section id="units" className="section-padding bg-gradient-brand">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-lavender mb-3">Availability</p>
          <h2 className="text-3xl md:text-4xl font-bold">Available Units</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {units.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-accent-lavender/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-accent-pink" />
                <h3 className="font-semibold text-lg">{u.location}</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-primary" />
                  <span className="text-foreground font-semibold">{u.rate}</span>
                  <span className="text-muted-foreground">· {u.deposit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi size={14} className="text-primary" />
                  <span>{u.amenities}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-primary" />
                  <span>{u.utilities}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-primary" />
                  <span>{u.minStay}</span>
                </div>
              </div>
              <div className="mt-5">
                <Button variant="heroOutline" size="sm" asChild>
                  <a href="#contact">Inquire</a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableUnitsSection;
