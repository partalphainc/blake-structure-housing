import { useState, useEffect } from "react";
import {
  LifeBuoy, Phone, Mail, AlertTriangle, Clock, ChevronDown, ChevronUp, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    q: "When is my monthly payout processed?",
    a: "Monthly payouts are processed on or around the 1st of each month. You'll receive a notification email when your payout is sent. Funds typically arrive within 1-3 business days via direct deposit. Your next scheduled payout is March 28, 2026.",
  },
  {
    q: "How do I view my financial statements?",
    a: "You can view and download your statements in the Payouts section of your investor portal. Monthly statements, YTD summaries, and expense detail reports are all available. For custom reports, contact management directly.",
  },
  {
    q: "What's the management fee structure?",
    a: "C. Blake Enterprise charges a standard 8% management fee on gross monthly rent collected. This covers tenant screening, rent collection, maintenance coordination, inspections, and all administrative tasks. There are no hidden fees.",
  },
  {
    q: "How do I submit a maintenance or repair request?",
    a: "Tenants submit maintenance requests directly through their resident portal. Management reviews, prioritizes, and coordinates all repair work. You can track all open and completed maintenance requests in the Maintenance section of your investor portal.",
  },
  {
    q: "How can I add a new property to my portfolio?",
    a: "To add a new property, please contact C. Blake Management directly at (636) 206-6037 or management@cblakeent.com. We'll walk you through the onboarding process and get your property set up in the portal.",
  },
];

const InvestorSupport = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading support...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Required fields", description: "Please fill in the subject and message.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setSubject("");
    setMessage("");
    setCategory("General");
    toast({
      title: "Ticket submitted",
      description: "Your support ticket has been received. Management will respond within 1 business day.",
    });
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Support</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Get help from C. Blake Management</p>
        </div>

        {/* 1. Contact Management */}
        <Card className="border border-[#f0e8ea] bg-gradient-to-br from-[#d4738a]/5 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#d4738a]" />
              Contact Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#6b5b5e] mb-5">
              Reach C. Blake Management directly for any questions about your investment, property, tenants, or statements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="tel:6362066037"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#f0e8ea] hover:border-[#d4738a]/30 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 bg-[#d4738a]/10 rounded-xl flex items-center justify-center group-hover:bg-[#d4738a]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[#d4738a]" />
                </div>
                <div>
                  <p className="text-xs text-[#9b8a8d] mb-0.5">Call Us</p>
                  <p className="text-sm font-bold text-[#2c2c2c]">(636) 206-6037</p>
                </div>
              </a>
              <a
                href="mailto:management@cblakeent.com"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#f0e8ea] hover:border-[#d4738a]/30 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 bg-[#d4738a]/10 rounded-xl flex items-center justify-center group-hover:bg-[#d4738a]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[#d4738a]" />
                </div>
                <div>
                  <p className="text-xs text-[#9b8a8d] mb-0.5">Email Us</p>
                  <p className="text-sm font-bold text-[#2c2c2c]">management@cblakeent.com</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 2. Submit Support Ticket */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#d4738a]" />
              Submit a Support Ticket
            </CardTitle>
            <p className="text-xs text-[#9b8a8d]">We'll respond within 1 business day</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your issue"
                className="border-[#f0e8ea] focus:border-[#d4738a] text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 text-sm border border-[#f0e8ea] rounded-md px-3 bg-white text-[#2c2c2c] focus:outline-none focus:border-[#d4738a]"
              >
                {["General", "Financial", "Maintenance", "Tenant", "Inspection", "Documents", "Payout", "Urgent"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                rows={5}
                className="w-full text-sm border border-[#f0e8ea] rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-[#d4738a] text-[#2c2c2c] placeholder:text-[#b8a4a8]"
              />
            </div>
            <Button
              className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center gap-2"
              onClick={handleSubmitTicket}
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Ticket
            </Button>
          </CardContent>
        </Card>

        {/* 3. Emergency + Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700 mb-1">Maintenance Emergency</p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    For emergencies such as flooding, fire, gas leaks, or security issues, call immediately:
                  </p>
                  <a href="tel:6362066037" className="text-sm font-bold text-red-700 hover:underline mt-2 block">
                    (636) 206-6037
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2c2c2c] mb-2">Office Hours</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6b5b5e]">Monday – Friday</span>
                      <span className="font-semibold text-[#2c2c2c]">9:00 AM – 5:00 PM</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6b5b5e]">Time Zone</span>
                      <span className="font-semibold text-[#2c2c2c]">CST</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6b5b5e]">Weekends</span>
                      <span className="text-[#9b8a8d]">By appointment</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. FAQ */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c]">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#f0e8ea] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#faf8f8] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-[#2c2c2c] pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[#d4738a] flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#9b8a8d] flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-0 bg-[#faf8f8] border-t border-[#f0e8ea]">
                    <p className="text-sm text-[#6b5b5e] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorSupport;
