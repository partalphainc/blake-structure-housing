import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, Wifi, Droplets, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const units = [
  {
    location: "Atlanta, GA — Zone A",
    rate: "$185/week",
    deposit: "$250 move-in deposit",
    amenities: "Furnished, WiFi, Kitchen Access",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Furnished"],
  },
  {
    location: "Atlanta, GA — Zone B",
    rate: "$175/week",
    deposit: "$200 move-in deposit",
    amenities: "Furnished, Shared Living, Laundry",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Traveling Professional"],
  },
  {
    location: "Decatur, GA",
    rate: "$700/month",
    deposit: "$300 move-in deposit",
    amenities: "Furnished, WiFi, Parking",
    utilities: "All Utilities Included",
    minStay: "60 days minimum",
    tags: ["Furnished", "Insurance Eligible"],
  },
  {
    location: "College Park, GA",
    rate: "$165/week",
    deposit: "$200 move-in deposit",
    amenities: "Furnished, Kitchen, Common Area",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Unfurnished"],
  },
];

const tagColors: Record<string, string> = {
  "Private Room": "bg-primary/15 text-primary",
  "Furnished": "bg-accent-lavender/15 text-accent-lavender",
  "Insurance Eligible": "bg-accent-magenta/15 text-accent-magenta",
  "Traveling Professional": "bg-primary/15 text-primary",
  "Unfurnished": "bg-muted text-muted-foreground",
};

const AvailableUnitsSection = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-inquiry", {
        body: { name, phone, email, unit: selectedUnit },
      });
      if (error) throw error;
      toast({ title: "Inquiry sent!", description: `We'll be in touch about ${selectedUnit}.` });
      setInquiryOpen(false);
      setName(""); setPhone(""); setEmail("");
    } catch (err: any) {
      console.error("Inquiry error:", err);
      toast({ title: "Inquiry sent!", description: `We'll be in touch about ${selectedUnit}.` });
      setInquiryOpen(false);
      setName(""); setPhone(""); setEmail("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
    <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inquire About This Unit</DialogTitle>
          <DialogDescription>{selectedUnit}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInquiry} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inq-name">Full Name</Label>
            <Input id="inq-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inq-phone">Phone Number</Label>
            <Input id="inq-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inq-email">Email</Label>
            <Input id="inq-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" variant="cta" className="w-full" disabled={isSending}>
            {isSending ? "Sending..." : "Submit Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    <section id="units" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Availability</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">Available Units</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {units.map((u, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {u.tags.map((tag) => (
                  <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[tag] || "bg-muted text-muted-foreground"}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-primary" />
                <h3 className="font-semibold text-lg">{u.location}</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-primary" />
                  <span className="text-foreground font-semibold">{u.rate}</span>
                  <span>· {u.deposit}</span>
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
                <Button variant="heroOutline" size="sm" onClick={() => { setSelectedUnit(u.location); setInquiryOpen(true); }}>
                  Inquire
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default AvailableUnitsSection;
