import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Droplets, CalendarDays, ChevronLeft, ChevronRight, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
    rate: "$225/week",
    deposit: "$100 move-in deposit",
    amenities: "Furnished, WiFi, Kitchen Access",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Furnished", "2nd Chance"],
    images: privateRoomImages,
    webhookUrl: "https://hooks.zapier.com/hooks/catch/25749233/ucxxg26/",
  },
  {
    title: "Private Room – Furnished",
    location: "U City, Missouri",
    rate: "$225/week",
    deposit: "$100 move-in deposit",
    amenities: "Furnished, WiFi, Shared Living",
    utilities: "All Utilities Included",
    minStay: "30 days minimum",
    tags: ["Private Room", "Furnished", "2nd Chance"],
    images: privateRoomImages,
    webhookUrl: "https://hooks.zapier.com/hooks/catch/25749233/ucx7hdp/",
  },
  {
    title: "2 Bed 1.5 Bath Townhome – Unfurnished",
    location: "St. Louis Area, Missouri",
    rate: "$1,700/month",
    deposit: "$1,700 move-in deposit",
    amenities: "Unfurnished Townhome",
    utilities: "Utilities Not Included - Must Be in Tenant Name",
    minStay: "Available Now",
    tags: ["Full Unit", "Unfurnished", "2nd Chance"],
    images: unfurnishedUnitImages,
    webhookUrl: "https://hooks.zapier.com/hooks/catch/25749233/ucxxg26/",
  },
  {
    title: "2 Bed 1 Bath Full Unit – Unfurnished",
    location: "St. Louis Area, Missouri",
    rate: "$1,625/month",
    deposit: "$1,625 move-in deposit",
    amenities: "Unfurnished Full Unit",
    utilities: "Utilities Not Included - Must Be in Tenant Name",
    minStay: "Available Now",
    tags: ["Full Unit", "Unfurnished", "2nd Chance"],
    images: unfurnishedUnitImages,
    webhookUrl: "https://hooks.zapier.com/hooks/catch/25749233/ucxxg26/",
  },
  {
    title: "2 Bed 1 Bath Full Unit – Furnished",
    location: "St. Louis Area, Missouri",
    rate: "$2,600/month",
    deposit: "Ideal for traveling nurses, doctors, and corporate stays",
    amenities: "Furnished, WiFi, Washer and Dryer",
    utilities: "All Utilities Included",
    minStay: "90 days minimum",
    tags: ["Full Unit", "Furnished"],
    images: furnishedUnitImages,
    webhookUrl: "https://hooks.zapier.com/hooks/catch/25749233/ucxxg26/",
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

const FILTERS = ["All", "Private Rooms", "Furnished", "Unfurnished", "2nd Chance"] as const;
type Filter = typeof FILTERS[number];

const AvailableUnitsSection = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedWebhook, setSelectedWebhook] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const visibleUnits = useMemo(() => {
    if (filter === "All") return units;
    if (filter === "Private Rooms") return units.filter((u) => u.tags.includes("Private Room"));
    return units.filter((u) => u.tags.includes(filter));
  }, [filter]);

  const openApplication = () => window.dispatchEvent(new CustomEvent("openApplication"));

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await fetch(selectedWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          name, phone, email, unit: selectedUnit,
          timestamp: new Date().toISOString(),
          source: "cblake-website",
        }),
      });
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

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-white/70 border-white/20 hover:border-primary/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className={`grid ${isMobile ? "grid-cols-1" : "md:grid-cols-2"} gap-6`}>
          {visibleUnits.map((u, i) => (
            <div
              key={`${u.title}-${u.location}-${i}`}
              className="p-6 rounded-xl bg-[hsl(0,0%,10%)] border border-white/10 hover:border-primary/30 transition-all"
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

              <h3 className="font-serif font-bold text-lg mb-1 flex items-center gap-2 text-white">
                <Home size={16} className="text-primary" />
                {u.title}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-primary" />
                <span className="text-sm text-white/60">{u.location}</span>
              </div>

              {/* On mobile: pricing details scroll-reveal */}
              {isMobile ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2 text-sm text-white/70 mb-4"
                >
                  <div className="flex items-start gap-2">
                    <DollarSign size={14} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-white font-semibold">{u.rate}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Droplets size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{u.utilities}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign size={14} className="text-primary/50 shrink-0 mt-0.5" />
                    <span>{u.deposit}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{u.minStay}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-2 text-sm text-white/70 mb-4">
                  <div className="flex items-start gap-2">
                    <DollarSign size={14} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-white font-semibold">{u.rate}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign size={14} className="text-primary/50 shrink-0 mt-0.5" />
                    <span>{u.deposit}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Droplets size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{u.utilities}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{u.minStay}</span>
                  </div>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="cta" size="sm" onClick={openApplication}>
                  Apply Now
                </Button>
                <Button variant="heroOutline" size="sm" className="text-white border-white/30 hover:text-white" asChild>
                  <a href="sms:+16362514272" className="flex items-center gap-1.5">
                    <Phone size={14} />
                    Call / Text
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5" onClick={() => { setSelectedUnit(`${u.title} — ${u.location}`); setSelectedWebhook(u.webhookUrl); setInquiryOpen(true); }}>
                  Inquire
                </Button>
              </div>
            </div>
          ))}
        </div>

        {visibleUnits.length === 0 && (
          <p className="text-center text-white/60 mt-8">No units match this filter right now.</p>
        )}
      </div>
    </section>
    </>
  );
};

export default AvailableUnitsSection;

export default AvailableUnitsSection;