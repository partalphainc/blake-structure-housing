import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Sofa, Building, Shield, Briefcase, RefreshCw, Zap, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const housingModels = [
  { icon: Home, title: "Private Room Housing", desc: "Private rooms in a shared residential setting — never shared bedrooms. Every resident gets their own secure, private space." },
  { icon: Sofa, title: "Furnished Corporate Units", desc: "Move-in ready furnished units for corporate and traveling professionals." },
  { icon: Building, title: "Unfurnished Second-Chance Units", desc: "Structured residential units for residents rebuilding stability through our second-chance program with documented agreements." },
  { icon: Shield, title: "Insurance Replacement Housing", desc: "Placement solutions for insurance-displaced residents with structured housing models." },
  { icon: Briefcase, title: "Traveling Professional Units", desc: "Short and mid-term housing for mobile professionals with flexible terms." },
  { icon: RefreshCw, title: "Second-Chance Structured Placements", desc: "Evaluated placements based on income, stability, and references for individuals rebuilding their future." },
  { icon: Zap, title: "Utilities Included", desc: "All utilities included in designated housing models — no surprise bills." },
  { icon: CalendarDays, title: "Flexible Terms", desc: "Weekly and monthly structured agreements to fit your situation." },
];

const evaluationPoints = [
  "Confirmed income or active contract placement",
  "Stability and consistency",
  "Rental history and references (when applicable)",
  "Alignment with structured housing standards",
  "Ability to live responsibly in a shared environment",
];

const ForResidentsSection = () => {
  const [showApplication, setShowApplication] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleOpen = () => setShowApplication(true);
    window.addEventListener("openApplication", handleOpen);
    return () => window.removeEventListener("openApplication", handleOpen);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: "Application Submitted", description: "A housing representative will contact you shortly." });
    setShowApplication(false);
  };

  return (
    <section id="residents" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">For Residents</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Your Path to <span className="text-gradient">Structured Housing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This is structured housing — not casual renting. We provide professional, documented
            housing solutions for individuals building their future.
          </p>
        </motion.div>

        {/* Mobile: compact tappable chips; Desktop: full cards */}
        {isMobile ? (
          <div className="flex flex-wrap gap-2 justify-center mb-12 mt-4">
            <TooltipProvider delayDuration={0}>
              {housingModels.map((o, i) => (
                <Tooltip key={o.title}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === i ? null : i)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-medium transition-colors hover:border-primary/40"
                    >
                      <o.icon size={16} className="text-primary shrink-0" />
                      <span>{o.title}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[260px] text-center">
                    <p className="text-xs">{o.desc}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            {expandedMobile !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="w-full mt-2 p-4 rounded-xl bg-card border border-primary/20 text-center"
              >
                <p className="font-semibold mb-1">{housingModels[expandedMobile].title}</p>
                <p className="text-sm text-muted-foreground">{housingModels[expandedMobile].desc}</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {housingModels.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="relative p-6 rounded-xl bg-card border border-border overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <o.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{o.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Evaluation criteria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10 p-6 rounded-xl bg-card border border-border text-center"
        >
          <h4 className="font-serif font-bold text-lg mb-2">How We Evaluate Applicants</h4>
          <p className="text-sm text-muted-foreground mb-4">We don't guess. We verify.</p>
          <ul className="space-y-2 mb-4">
            {evaluationPoints.map((point) => (
              <li key={point} className="flex items-center justify-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="text-sm text-muted-foreground space-y-1 border-t border-border pt-4">
            <p>Structure matters here.</p>
            <p>Accountability matters here.</p>
            <p>And opportunity does too.</p>
            <p className="font-semibold text-foreground mt-2">That's C. Blake Enterprise.</p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <a href="#units">View Available Units</a>
          </Button>
          <Button variant="heroOutline" size="lg" onClick={() => setShowApplication(true)}>
            Apply Now
          </Button>
        </div>

        {/* Application Dialog */}
        <Dialog open={showApplication} onOpenChange={setShowApplication}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Housing Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required placeholder="Your full name" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required type="tel" placeholder="(555) 123-4567" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" required type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="preference">Housing Preference</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private-room">Private Room</SelectItem>
                    <SelectItem value="furnished">Furnished Unit</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished Unit</SelectItem>
                    <SelectItem value="insurance">Insurance Replacement</SelectItem>
                    <SelectItem value="second-chance">Second-Chance Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Additional Info</Label>
                <Textarea id="message" placeholder="Tell us about your housing needs..." />
              </div>
              <Button type="submit" variant="hero" className="w-full">Submit Application</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ForResidentsSection;
