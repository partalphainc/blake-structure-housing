import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onClose: () => void;
}

const HousingApplicationForm = ({ onClose }: Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preference, setPreference] = useState("");
  const [heardAbout, setHeardAbout] = useState("");
  const [evicted, setEvicted] = useState("");
  const [felony, setFelony] = useState("");
  const [bankruptcy, setBankruptcy] = useState("");
  const [noSmoking, setNoSmoking] = useState("");
  const [noPets, setNoPets] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: "Agreement Required", description: "You must agree to the authorization statement.", variant: "destructive" });
      return;
    }
    if (!smsConsent) {
      toast({ title: "SMS Consent Required", description: "You must agree to receive text messages to submit.", variant: "destructive" });
      return;
    }
    const now = Date.now();
    if (now - lastSubmitTime < 60000) {
      toast({ title: "Please wait", description: "You can submit another application in 1 minute.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setLastSubmitTime(now);
    const form = e.currentTarget;
    const val = (id: string) => (form.querySelector(`#${id}`) as HTMLInputElement)?.value || "";

    const formData = {
      name: val("app-name"),
      phone: val("app-phone"),
      email: val("app-email"),
      dob: val("app-dob"),
      ssn: val("app-ssn"),
      preference,
      heard_about: heardAbout,
      income_sources: val("app-income-sources"),
      monthly_income: val("app-monthly-income"),
      employer: val("app-employer"),
      position: val("app-position"),
      employment_start: val("app-emp-start"),
      employment_end: val("app-emp-end"),
      supervisor_name: val("app-supervisor"),
      supervisor_phone: val("app-supervisor-phone"),
      address: val("app-address"),
      evicted,
      evicted_details: val("app-evicted-details"),
      felony,
      felony_details: val("app-felony-details"),
      bankruptcy,
      bankruptcy_details: val("app-bankruptcy-details"),
      no_smoking: noSmoking,
      no_pets: noPets,
      recent_address: val("app-recent-address"),
      recent_stay_length: val("app-recent-stay"),
      recent_landlord_name: val("app-landlord-name"),
      recent_landlord_phone: val("app-landlord-phone"),
      emergency_name: val("app-emergency-name"),
      emergency_phone: val("app-emergency-phone"),
      emergency_address: val("app-emergency-address"),
      emergency_relationship: val("app-emergency-relationship"),
      esignature: val("app-esignature"),
      sms_consent: smsConsent ? "yes" : "no",
      message: val("app-message"),
      timestamp: new Date().toISOString(),
      source: "cblake-website-application",
    };
    try {
      await fetch("https://hooks.zapier.com/hooks/catch/25749233/ucvla5n/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.error("Zapier webhook error:", err);
    }
    toast({ title: "Application Submitted", description: "A housing representative will contact you shortly." });
    onClose();
    setIsSubmitting(false);
  };

  const sectionTitle = (text: string) => (
    <h4 className="font-serif font-bold text-base pt-4 pb-1 border-b border-border mb-2">{text}</h4>
  );

  const yesNoSelect = (label: string, value: string, onChange: (v: string) => void, id: string) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      {/* Personal Info */}
      {sectionTitle("Personal Information")}
      <div>
        <Label htmlFor="app-name">Full Name *</Label>
        <Input id="app-name" required placeholder="Your full name" />
      </div>
      <div>
        <Label htmlFor="app-phone">Phone *</Label>
        <Input id="app-phone" required type="tel" placeholder="(555) 123-4567" />
      </div>
      <div>
        <Label htmlFor="app-email">Email *</Label>
        <Input id="app-email" required type="email" placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="app-dob">Date of Birth *</Label>
        <Input id="app-dob" required type="date" />
      </div>
      <div>
        <Label htmlFor="app-ssn">Social Security Number *</Label>
        <Input id="app-ssn" required placeholder="XXX-XX-XXXX" type="password" autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="app-address">Address *</Label>
        <Input id="app-address" required placeholder="Your current address" />
      </div>
      <div>
        <Label>Housing Preference</Label>
        <Select value={preference} onValueChange={setPreference}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
        <Label>How did you hear about us?</Label>
        <Select value={heardAbout} onValueChange={setHeardAbout}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Search</SelectItem>
            <SelectItem value="social-media">Social Media</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="partner-org">Partner Organization</SelectItem>
            <SelectItem value="flyer">Flyer / Print</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employment */}
      {sectionTitle("Employment & Income")}
      <div>
        <Label htmlFor="app-income-sources">Sources of Income *</Label>
        <Input id="app-income-sources" required placeholder="Employment, SSI, etc." />
      </div>
      <div>
        <Label htmlFor="app-monthly-income">Monthly Income *</Label>
        <Input id="app-monthly-income" required type="number" placeholder="$0.00" min="0" step="0.01" />
      </div>
      <div>
        <Label htmlFor="app-employer">Employer</Label>
        <Input id="app-employer" placeholder="Employer name" />
      </div>
      <div>
        <Label htmlFor="app-position">Position</Label>
        <Input id="app-position" placeholder="Your position/title" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="app-emp-start">Start Date</Label>
          <Input id="app-emp-start" type="date" />
        </div>
        <div>
          <Label htmlFor="app-emp-end">End Date</Label>
          <Input id="app-emp-end" type="date" />
        </div>
      </div>
      <div>
        <Label htmlFor="app-supervisor">Supervisor Name</Label>
        <Input id="app-supervisor" placeholder="Supervisor's name" />
      </div>
      <div>
        <Label htmlFor="app-supervisor-phone">Supervisor Phone</Label>
        <Input id="app-supervisor-phone" type="tel" placeholder="(555) 123-4567" />
      </div>

      {/* Background Questions */}
      {sectionTitle("Background Questions")}
      {yesNoSelect("Have you ever been evicted?", evicted, setEvicted, "app-evicted")}
      {evicted === "yes" && (
        <div>
          <Label htmlFor="app-evicted-details">If yes, when and why?</Label>
          <Textarea id="app-evicted-details" placeholder="Please explain..." />
        </div>
      )}
      {yesNoSelect("Have you ever been convicted of a felony?", felony, setFelony, "app-felony")}
      {felony === "yes" && (
        <div>
          <Label htmlFor="app-felony-details">If yes, when and why?</Label>
          <Textarea id="app-felony-details" placeholder="Please explain..." />
        </div>
      )}
      {yesNoSelect("Have you ever filed for bankruptcy?", bankruptcy, setBankruptcy, "app-bankruptcy")}
      {bankruptcy === "yes" && (
        <div>
          <Label htmlFor="app-bankruptcy-details">If yes, when?</Label>
          <Input id="app-bankruptcy-details" placeholder="Date or timeframe" />
        </div>
      )}
      {yesNoSelect("Do you understand that smoking of tobacco products is NOT ALLOWED at the premises?", noSmoking, setNoSmoking, "app-no-smoking")}
      {yesNoSelect("Do you understand that we have a NO PETS policy?", noPets, setNoPets, "app-no-pets")}

      {/* Recent History */}
      {sectionTitle("Recent History")}
      <div>
        <Label htmlFor="app-recent-address">Address</Label>
        <Input id="app-recent-address" placeholder="Previous address" />
      </div>
      <div>
        <Label htmlFor="app-recent-stay">Length of Stay</Label>
        <Input id="app-recent-stay" placeholder="e.g. 2 years" />
      </div>
      <div>
        <Label htmlFor="app-landlord-name">Landlord's Name</Label>
        <Input id="app-landlord-name" placeholder="Landlord's full name" />
      </div>
      <div>
        <Label htmlFor="app-landlord-phone">Landlord's Phone Number</Label>
        <Input id="app-landlord-phone" type="tel" placeholder="(555) 123-4567" />
      </div>

      {/* Emergency Contact */}
      {sectionTitle("Emergency Contact")}
      <div>
        <Label htmlFor="app-emergency-name">Name *</Label>
        <Input id="app-emergency-name" required placeholder="Emergency contact name" />
      </div>
      <div>
        <Label htmlFor="app-emergency-phone">Phone Number *</Label>
        <Input id="app-emergency-phone" required type="tel" placeholder="(555) 123-4567" />
      </div>
      <div>
        <Label htmlFor="app-emergency-address">Complete Address *</Label>
        <Input id="app-emergency-address" required placeholder="Full address" />
      </div>
      <div>
        <Label htmlFor="app-emergency-relationship">Relationship *</Label>
        <Input id="app-emergency-relationship" required placeholder="e.g. Mother, Spouse" />
      </div>

      {/* Upload ID */}
      {sectionTitle("Identification")}
      <div>
        <Label htmlFor="app-upload-id">Upload ID *</Label>
        <Input id="app-upload-id" required type="file" accept="image/*,.pdf" className="cursor-pointer" />
      </div>

      {/* Additional Info */}
      <div>
        <Label htmlFor="app-message">Additional Info</Label>
        <Textarea id="app-message" placeholder="Tell us about your housing needs..." />
      </div>

      {/* Agreement */}
      {sectionTitle("Authorization & Agreement")}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="app-agreement"
          checked={agreed}
          onCheckedChange={(c) => setAgreed(c === true)}
          className="mt-1 shrink-0"
          required
        />
        <label htmlFor="app-agreement" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          I believe that the statements I have made are true and correct. I hereby authorize the verification of information I provided, communication with any and all names listed on this application and for the issuer of this form to conduct a background check to obtain additional information on credit history, criminal history and all Unlawful Detainers. I understand that any discrepancy or lack of information may result in the rejection of this application. I understand that this is an application for a home or apartment and does not constitute a rental or lease agreement in whole or in part. I further understand that there is a non-refundable fee to cover the cost of processing my application and I am not entitled to a refund.
        </label>
      </div>

      {/* E-Signature */}
      <div>
        <Label htmlFor="app-esignature">Electronic Signature *</Label>
        <p className="text-xs text-muted-foreground mb-1">
          By entering your complete name in the provided field, you acknowledge and agree that it is the legal equivalent of personally signing this document.
        </p>
        <Input id="app-esignature" required placeholder="Type your full legal name" />
      </div>

      {/* SMS Consent */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="app-sms-consent"
          checked={smsConsent}
          onCheckedChange={(c) => setSmsConsent(c === true)}
          className="mt-1 shrink-0"
          required
        />
        <label htmlFor="app-sms-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          I agree to receive recurring automated text messages from Part Alpha Incorporation at the phone number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out. *
        </label>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
};

export default HousingApplicationForm;
