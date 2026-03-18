import { useState, useEffect } from "react";
import { Wallet, Download, CreditCard, CalendarDays, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const payoutHistory = [
  { date: "Mar 1, 2026", amount: 5920, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20260301", status: "Completed" },
  { date: "Feb 1, 2026", amount: 6320, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20260201", status: "Completed" },
  { date: "Jan 1, 2026", amount: 6100, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20260101", status: "Completed" },
  { date: "Dec 1, 2025", amount: 5500, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20251201", status: "Completed" },
  { date: "Nov 1, 2025", amount: 6120, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20251101", status: "Completed" },
  { date: "Oct 1, 2025", amount: 5600, property: "Portfolio", method: "Direct Deposit", ref: "PAY-20251001", status: "Completed" },
];

const InvestorPayouts = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
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
        <p className="text-[#9b8a8d] text-sm">Loading payouts...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleDownload = (label: string) => {
    toast({ title: "Download Coming Soon", description: `${label} download will be available soon. Contact management for your latest statements.` });
  };

  const ytdTotal = payoutHistory.filter(p => p.date.includes("2026")).reduce((s, p) => s + p.amount, 0);

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Payouts</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Your payout schedule, history, and statements</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-[#f0e8ea] bg-gradient-to-br from-[#d4738a]/5 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#9b8a8d]">Next Payout</p>
                <div className="p-1.5 rounded-lg bg-[#d4738a]/10">
                  <Wallet className="w-4 h-4 text-[#d4738a]" />
                </div>
              </div>
              <p className="text-2xl font-bold font-serif text-[#2c2c2c]">$5,920</p>
              <p className="text-xs text-[#9b8a8d] mt-1">March 28, 2026</p>
              <Badge className="mt-2 bg-[#d4738a]/10 text-[#d4738a] border-[#d4738a]/20 text-[10px]">Scheduled</Badge>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#9b8a8d]">Last Payout</p>
                <div className="p-1.5 rounded-lg bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold font-serif text-[#2c2c2c]">$5,920</p>
              <p className="text-xs text-[#9b8a8d] mt-1">March 1, 2026</p>
              <Badge className="mt-2 bg-green-100 text-green-700 text-[10px]">Completed</Badge>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#9b8a8d]">YTD Payouts</p>
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold font-serif text-[#2c2c2c]">${ytdTotal.toLocaleString()}</p>
              <p className="text-xs text-[#9b8a8d] mt-1">Jan – Mar 2026</p>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#9b8a8d]">Payout Method</p>
                <div className="p-1.5 rounded-lg bg-purple-50">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <p className="text-base font-bold text-[#2c2c2c]">Direct Deposit</p>
              <p className="text-xs text-[#9b8a8d] mt-1">Bank on file</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout History Table */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c]">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8ea]">
                    {["Date", "Amount", "Property", "Method", "Reference #", "Status", "Receipt"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#9b8a8d] pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e8ea]">
                  {payoutHistory.map((payout, i) => (
                    <tr key={i} className="hover:bg-[#faf8f8] transition-colors">
                      <td className="py-3 pr-4 text-xs text-[#9b8a8d] whitespace-nowrap">{payout.date}</td>
                      <td className="py-3 pr-4 text-sm font-bold text-green-600 whitespace-nowrap">${payout.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-xs text-[#2c2c2c]">{payout.property}</td>
                      <td className="py-3 pr-4 text-xs text-[#6b5b5e]">{payout.method}</td>
                      <td className="py-3 pr-4 text-xs text-[#9b8a8d] font-mono">{payout.ref}</td>
                      <td className="py-3 pr-4">
                        <Badge className="bg-green-100 text-green-700 text-[10px]">{payout.status}</Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[#d4738a] hover:text-[#c4637a] hover:bg-[#faf0f2] text-xs"
                          onClick={() => handleDownload(`Payout receipt ${payout.ref}`)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statement Downloads */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c]">Statement Downloads</CardTitle>
            <p className="text-xs text-[#9b8a8d]">Download your financial statements and reports</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Monthly Statement — March 2026", desc: "Full income & expense breakdown" },
                { label: "YTD Summary — 2026", desc: "Year-to-date financial overview" },
                { label: "Expense Detail Report", desc: "All expenses by category" },
                { label: "Repair Cost Statement", desc: "Maintenance and repair costs" },
              ].map((stmt) => (
                <div key={stmt.label} className="flex items-center justify-between p-4 border border-[#f0e8ea] rounded-xl hover:border-[#d4738a]/30 transition-colors bg-[#faf8f8]">
                  <div>
                    <p className="text-sm font-semibold text-[#2c2c2c]">{stmt.label}</p>
                    <p className="text-xs text-[#9b8a8d] mt-0.5">{stmt.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-xs h-8 flex-shrink-0 ml-3"
                    onClick={() => handleDownload(stmt.label)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Preferences */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c]">Payout Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 p-4 bg-[#faf0f2] rounded-xl border border-[#d4738a]/10">
              <div className="p-2 rounded-lg bg-[#d4738a]/10 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[#d4738a]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2c2c2c]">Update Banking Details or Payout Method</p>
                <p className="text-xs text-[#6b5b5e] mt-1">
                  To update your banking details, payout preferences, or schedule, please contact C. Blake Management directly.
                  We ensure all banking information is handled securely.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <a href="tel:6362066037" className="text-xs text-[#d4738a] hover:underline font-medium">(636) 206-6037</a>
                  <a href="mailto:management@cblakeent.com" className="text-xs text-[#d4738a] hover:underline font-medium">management@cblakeent.com</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorPayouts;
