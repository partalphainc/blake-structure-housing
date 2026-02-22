import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Sofa, Building, Shield, Briefcase, RefreshCw, Zap, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

const criteria = [
  "Current income",
  "Stability",
  "References",
  "Commitment to community standards",
];

const ForResidentsSection = () => {
  const [showApplication, setShowApplication] = useState(false);
  const { toast } = useToast();

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
          className="text-center mb-14"
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {housingModels.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <o.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{o.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Evaluation criteria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10 p-6 rounded-xl bg-card border border-border"
        >
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">We Evaluate Applicants Based On</h4>
          <div className="grid grid-cols-2 gap-3">
            {criteria.map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{c}</span>
              </div>
            ))}
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
