import { useEffect, useState } from "react";
import {
  FileBarChart, BarChart3, Home, DollarSign, Wrench, TrendingUp,
  CalendarDays, FileText, Award, Download, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const reports = [
  {
    icon: <FileBarChart className="w-6 h-6" />,
    title: "Monthly Portfolio Summary",
    description: "Complete overview of income, expenses, and occupancy for the current month",
    color: "text-[#d4738a]",
    bg: "bg-[#d4738a]/10",
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: "Property Performance Report",
    description: "Individual property metrics — rent collected, vacancy, ROI per property",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Rent Roll Report",
    description: "List of all active leases, rent amounts, tenants, and payment status",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Expense Report",
    description: "Categorized breakdown of all expenses including maintenance, fees, and utilities",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Maintenance Cost Report",
    description: "All repair and maintenance costs by property, vendor, and category",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Occupancy Report",
    description: "Occupancy rates, vacancy trends, and unit turnover history",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: <CalendarDays className="w-6 h-6" />,
    title: "Lease Expiration Report",
    description: "All leases expiring in the next 30, 60, and 90 days with renewal status",
    color: "text-blue-400",
    bg: "bg-blue-50",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Year-to-Date Summary",
    description: "YTD revenue, expenses, profit, payouts, and portfolio metrics",
    color: "text-[#d4738a]",
    bg: "bg-[#d4738a]/10",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Annual Owner Summary",
    description: "Full-year financial summary including tax-relevant information",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

const InvestorReports = () => {
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
        <p className="text-[#9b8a8d] text-sm">Loading reports...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleReport = (title: string, action: "View" | "Download") => {
    toast({
      title: `${action} Report`,
      description: "Report generation coming soon. Contact management for your latest reports.",
    });
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Reports</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Access and download your portfolio reports and statements</p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#d4738a]/10 to-[#d4738a]/5 border border-[#d4738a]/20 rounded-xl p-4 flex items-start gap-3">
          <FileBarChart className="w-5 h-5 text-[#d4738a] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#2c2c2c]">Reports Available on Request</p>
            <p className="text-xs text-[#6b5b5e] mt-1">
              All reports are generated and delivered by C. Blake Management. Contact us at{" "}
              <a href="mailto:management@cblakeent.com" className="text-[#d4738a] hover:underline">management@cblakeent.com</a>{" "}
              or <a href="tel:6362066037" className="text-[#d4738a] hover:underline">(636) 206-6037</a> to request a specific report.
            </p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <Card key={report.title} className="border border-[#f0e8ea] bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-xl ${report.bg} flex items-center justify-center mb-4`}>
                  <span className={report.color}>{report.icon}</span>
                </div>
                <h3 className="font-serif font-bold text-[#2c2c2c] text-base mb-2 leading-snug">{report.title}</h3>
                <p className="text-xs text-[#9b8a8d] mb-5 leading-relaxed">{report.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#f0e8ea] text-[#6b5b5e] hover:border-[#d4738a]/30 hover:text-[#d4738a] hover:bg-[#faf0f2] text-xs h-8"
                    onClick={() => handleReport(report.title, "View")}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#d4738a] hover:bg-[#c4637a] text-white text-xs h-8"
                    onClick={() => handleReport(report.title, "Download")}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
};

export default InvestorReports;
