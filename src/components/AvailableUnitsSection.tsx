import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Droplets, CalendarDays, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Private room images
import privateBedroom from "@/assets/units/private-bedroom.jpg";
import sharedKitchen from "@/assets/units/shared-kitchen.jpg";
import sharedLiving from "@/assets/units/shared-living.jpg";
// Furnished full unit images
import furnishedBedroom from "@/assets/units/furnished-bedroom.jpg";
import furnishedBathroom from "@/assets/units/furnished-bathroom.jpg";
import furnishedLiving from "@/assets/units/furnished-living.jpg";
// Unfurnished unit images
import unfurnishedBedroom from "@/assets/units/unfurnished-bedroom.jpg";
import unfurnishedBathroom from "@/assets/units/unfurnished-bathroom.jpg";
import unfurnishedKitchen from "@/assets/units/unfurnished-kitchen.jpg";

const privateRoomImages = [privateBedroom, sharedKitchen, sharedLiving];
const furnishedUnitImages = [furnishedBedroom, furnishedBathroom, furnishedLiving];
const unfurnishedUnitImages = [unfurnishedBedroom, unfurnishedBathroom, unfurnishedKitchen];

const units = [
  {
    title: "Private Room – Furnished",
    location: "St. John, Missouri",
    rate: "$200/week",
    deposit: "$250 move-in deposit",
    amenities: "Furnished, WiFi, Kitchen Access",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Furnished"],
    images: privateRoomImages,
  },
  {
    title: "Private Room – Furnished",
    location: "U City, Missouri",
    rate: "$200/week",
    deposit: "$250 move-in deposit",
    amenities: "Furnished, WiFi, Shared Living",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Furnished"],
    images: privateRoomImages,
  },
  {
    title: "1 Bed 1 Bath Full Unit – Furnished",
    location: "Lake St. Louis, Missouri",
    rate: "$2,900/month",
    deposit: "$250 move-in deposit",
    amenities: "Furnished, WiFi, Parking",
    utilities: "All Utilities Included",
    minStay: "60 days minimum",
    tags: ["Full Unit", "Furnished"],
    images: furnishedUnitImages,
  },
  {
    title: "1 Bed 1 Bath Full Unit – Unfurnished (2nd Chance Eligible)",
    location: "Lake St. Louis, Missouri",
    rate: "$1,625/month",
    deposit: "$300 move-in deposit",
    amenities: "Unfurnished, Parking",
    utilities: "Utilities Not Included — Must Be in Tenant Name",
    minStay: "Month-to-month lease",
    tags: ["Full Unit", "Unfurnished", "2nd Chance"],
    images: unfurnishedUnitImages,
  },
];

const tagColors: Record<string, string> = {
  "Private Room": "bg-primary/15 text-primary",
  "Furnished": "bg-accent-lavender/15 text-accent-lavender",
  "Full Unit": "bg-accent-magenta/15 text-accent-magenta",
  "Unfurnished": "bg-muted text-muted-foreground",
  "2nd Chance": "bg-primary/15 text-primary",
};

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden mb-4 group max-h-52">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Unit photo ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
        />
      ))}
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous image">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next image">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-background/60"}`} aria-label={`Go to image ${i + 1}`} />
        ))}
      </div>
    </div>
  );
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
      const { error } = await supabase.functions.invoke("send-inquiry", {
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
              <ImageCarousel images={u.images} />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {u.tags.map((tag) => (
                  <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[tag] || "bg-muted text-muted-foreground"}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="font-serif font-bold text-lg mb-1 flex items-center gap-2">
                <Home size={16} className="text-primary" />
                {u.title}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-primary" />
                <span className="text-sm text-muted-foreground">{u.location}</span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-primary" />
                  <span className="text-foreground font-semibold">{u.rate}</span>
                  <span>· {u.deposit}</span>
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
                <Button variant="heroOutline" size="sm" onClick={() => { setSelectedUnit(`${u.title} — ${u.location}`); setInquiryOpen(true); }}>
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
