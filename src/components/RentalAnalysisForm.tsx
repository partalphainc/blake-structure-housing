import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  property_address: z.string().trim().min(3, "Please enter a valid property address").max(500),
  full_name: z.string().trim().min(2, "Please enter your name").max(200),
  contact: z.string().trim().min(3, "Please enter a phone number or email").max(200),
});

const RentalAnalysisForm = () => {
  const [form, setForm] = useState({ property_address: "", full_name: "", contact: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("owner_leads").insert([parsed.data]);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-primary/30 shadow-lg shadow-primary/5"
    >
      {done ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-2xl font-serif font-bold mb-2">Thank you!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We received your request. A C. Blake Enterprise advisor will reach out shortly
            with your free rental analysis.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Owner Offer</p>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Get a Free Rental Analysis</h3>
          <p className="text-sm text-muted-foreground mb-6">
            No cost, no obligation. Find out what your property could earn.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ra-address">Property Address</Label>
              <Input
                id="ra-address"
                required
                maxLength={500}
                value={form.property_address}
                onChange={(e) => setForm({ ...form, property_address: e.target.value })}
                placeholder="123 Main St, City, State"
                className="mt-1"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ra-name">Your Name</Label>
                <Input
                  id="ra-name"
                  required
                  maxLength={200}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ra-contact">Phone or Email</Label>
                <Input
                  id="ra-contact"
                  required
                  maxLength={200}
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="(555) 555-5555 or you@email.com"
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Sending..." : "Get My Free Estimate"}
            </Button>
          </form>
        </>
      )}
    </motion.div>
  );
};

export default RentalAnalysisForm;
