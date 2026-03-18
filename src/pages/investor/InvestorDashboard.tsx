import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Home, TrendingUp, DollarSign, Wallet, AlertTriangle,
  CheckCircle2, Clock, Wrench, BarChart3, Bot, FileBarChart,
  MessageSquare, ChevronRight, ArrowUpRight, CalendarDays
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const revenueData = [
  { month: "Oct", revenue: 6800, expenses: 1200 },
  { month: "Nov", revenue: 7100, expenses: 980 },
  { month: "Dec", revenue: 6950, expenses: 1450 },
  { month: "Jan", revenue: 7200, expenses: 1100 },
  { month: "Feb", revenue: 7400, expenses: 1080 },
  { month: "Mar", revenue: 7400, expenses: 1480 },
];

const occupancyData = [
  { month: "Oct", rate: 80 },
  { month: "Nov", rate: 83 },
  { month: "Dec", rate: 83 },
  { month: "Jan", rate: 83 },
  { month: "Feb", rate: 83 },
  { month: "Mar", rate: 83 },
];

const sampleActivity = [
  { icon: <DollarSign className="w-4 h-4 text-green-500" />, text: "Rent payment received from J. Williams — Unit 2B", date: "Mar 15, 2026", bg: "bg-green-50" },
  { icon: <Wrench className="w-4 h-4 text-amber-500" />, text: "HVAC repair completed at 4512 Oak Ave", date: "Mar 13, 2026", bg: "bg-amber-50" },
  { icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, text: "Quarterly inspection completed — 1823 Maple Dr", date: "Mar 10, 2026", bg: "bg-blue-50" },
  { icon: <DollarSign className="w-4 h-4 text-green-500" />, text: "Payout of $5,920 processed to your account", date: "Mar 1, 2026", bg: "bg-green-50" },
  { icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, text: "New maintenance request — plumbing, Unit 1A", date: "Feb 28, 2026", bg: "bg-orange-50" },
  { icon: <CheckCircle2 className="w-4 h-4 text-[#d4738a]" />, text: "Lease renewal signed — M. Thompson, Unit 3C", date: "Feb 25, 2026", bg: "bg-pink-50" },
];

const sampleLeases = [
  { tenant: "J. Williams", unit: "Unit 2B — 4512 Oak Ave", end: "Apr 30, 2026", daysLeft: 44, status: "Ending Soon" },
  { tenant: "R. Davis", unit: "Unit 1A — 1823 Maple Dr", end: "May 31, 2026", daysLeft: 75, status: "Active" },
  { tenant: "M. Thompson", unit: "Unit 3C — 4512 Oak Ave", end: "Aug 31, 2026", daysLeft: 167, status: "Renewed" },
];

const InvestorDashboard = () => {
  const { user, loading, signOut } = useAuth("investor");
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [activeLeases, setActiveLeases] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("properties").select("*, units(*)").eq("owner_id", user.id),
      ]);
      setProfile(profileRes.data);
      const props = propsRes.data || [];
      setProperties(props);

      let units = 0, leases = 0, revenue = 0;
      for (const prop of props) {
        const propUnits = prop.units || [];
        units += propUnits.length;
        for (const unit of propUnits) {
          const { data: ul } = await supabase
            .from("leases").select("rent_amount").eq("unit_id", unit.id).eq("status", "active");
          if (ul) { leases += ul.length; revenue += ul.reduce((s: number, l: any) => s + Number(l.rent_amount), 0); }
        }
      }
      setTotalUnits(units);
      setActiveLeases(leases);
      setMonthlyRevenue(revenue);
      setDataLoaded(true);
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading your portfolio...</p>
      </div>
    </div>
  );

  // Use sample data if DB returns empty
  const displayProperties = properties.length > 0 ? properties.length : 2;
  const displayUnits = totalUnits > 0 ? totalUnits : 6;
  const displayOccupied = activeLeases > 0 ? activeLeases : 5;
  const displayRevenue = monthlyRevenue > 0 ? monthlyRevenue : 7400;
  const occupancyRate = Math.round((displayOccupied / displayUnits) * 100);
  const netProfit = Math.round(displayRevenue * 0.8);
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#d4738a] to-[#b85c74] rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">Welcome back, {userName.split(" ")[0]}.</h1>
              <p className="text-white/80 mt-1 text-sm">Your portfolio is performing well. Here's your overview.</p>
              <p className="text-white/60 text-xs mt-2 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {today}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/investor/payouts")}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur text-xs h-8"
                size="sm"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Next Payout: Mar 28
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Properties", value: displayProperties, icon: <Building2 className="w-5 h-5" />,
              sub: "Active portfolio", color: "text-[#d4738a]", bg: "bg-[#d4738a]/10"
            },
            {
              label: "Occupied Units", value: `${displayOccupied} / ${displayUnits}`, icon: <Home className="w-5 h-5" />,
              sub: `${displayUnits - displayOccupied} vacant`, color: "text-blue-500", bg: "bg-blue-50"
            },
            {
              label: "Occupancy Rate", value: `${occupancyRate}%`, icon: <TrendingUp className="w-5 h-5" />,
              sub: null, color: "text-[#d4738a]", bg: "bg-[#d4738a]/10", progress: occupancyRate
            },
            {
              label: "Monthly Gross Revenue", value: `$${displayRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />,
              sub: "+8% vs last month", color: "text-green-500", bg: "bg-green-50"
            },
            {
              label: "Monthly Net Profit", value: `$${netProfit.toLocaleString()}`, icon: <ArrowUpRight className="w-5 h-5" />,
              sub: "After all expenses", color: "text-green-500", bg: "bg-green-50"
            },
            {
              label: "Outstanding Rent", value: "$650", icon: <AlertTriangle className="w-5 h-5" />,
              sub: "1 unit past due", color: "text-amber-500", bg: "bg-amber-50"
            },
            {
              label: "Upcoming Payout", value: "$5,920", icon: <Wallet className="w-5 h-5" />,
              sub: "Due Mar 28, 2026", color: "text-[#d4738a]", bg: "bg-[#d4738a]/10"
            },
            {
              label: "Portfolio ROI", value: "8.4%", icon: <BarChart3 className="w-5 h-5" />,
              sub: "Annual return", color: "text-purple-500", bg: "bg-purple-50"
            },
          ].map((kpi, i) => (
            <Card key={i} className="border border-[#f0e8ea] shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-[#9b8a8d] font-medium leading-tight">{kpi.label}</p>
                  <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                    <span className={kpi.color}>{kpi.icon}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#2c2c2c] font-serif">{kpi.value}</p>
                {kpi.progress !== undefined && (
                  <div className="w-full bg-[#f0e8ea] rounded-full h-1.5 mt-2">
                    <div className="bg-[#d4738a] rounded-full h-1.5 transition-all" style={{ width: `${kpi.progress}%` }} />
                  </div>
                )}
                {kpi.sub && <p className="text-xs text-[#b8a4a8] mt-1.5">{kpi.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Panel */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#d4738a]" />
              Portfolio Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs py-1 px-3">
                Late Rent — Unit 1A ($650)
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs py-1 px-3">
                Lease Ending — J. Williams Apr 30
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs py-1 px-3">
                Maintenance Open — Plumbing (Unit 1A)
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs py-1 px-3">
                Payout Scheduled — Mar 28 $5,920
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Monthly Revenue Trend</CardTitle>
              <p className="text-xs text-[#9b8a8d]">Gross revenue vs expenses — last 6 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4738a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4738a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid #f0e8ea" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#d4738a" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#9b8a8d" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Occupancy Trend</CardTitle>
              <p className="text-xs text-[#9b8a8d]">Monthly occupancy rate — last 6 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={occupancyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9b8a8d" }} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 8, border: "1px solid #f0e8ea" }} />
                  <Bar dataKey="rate" fill="#d4738a" radius={[4, 4, 0, 0]} name="Occupancy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-[#2c2c2c]">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleActivity.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${item.bg}`}>
                    <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2c2c2c] leading-snug">{item.text}</p>
                      <p className="text-xs text-[#9b8a8d] mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-[#2c2c2c]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { label: "View Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
                  { label: "Download Statement", href: "/investor/payouts", icon: <Wallet className="w-4 h-4" /> },
                  { label: "Request Inspection", href: "/investor/inspections", icon: <CheckCircle2 className="w-4 h-4" /> },
                  { label: "Message Mgmt", href: "/investor/messages", icon: <MessageSquare className="w-4 h-4" /> },
                  { label: "View Maintenance", href: "/investor/maintenance", icon: <Wrench className="w-4 h-4" /> },
                  { label: "Ask AI", href: "/investor/ai-assistant", icon: <Bot className="w-4 h-4" /> },
                ].map((a) => (
                  <Button
                    key={a.href}
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1.5 h-auto py-3 border-[#f0e8ea] hover:border-[#d4738a]/30 hover:bg-[#faf0f2] text-[#6b5b5e] hover:text-[#d4738a] text-xs"
                    onClick={() => navigate(a.href)}
                  >
                    <span className="text-[#d4738a]">{a.icon}</span>
                    {a.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Maintenance Summary */}
            <Card className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-serif text-[#2c2c2c] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#d4738a]" /> Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Open", count: 2, color: "text-red-500 bg-red-50" },
                  { label: "In Progress", count: 1, color: "text-amber-500 bg-amber-50" },
                  { label: "Completed", count: 3, color: "text-green-500 bg-green-50" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#6b5b5e]">{s.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.count}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[#f0e8ea]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9b8a8d]">Cost this month</span>
                    <span className="text-xs font-bold text-[#2c2c2c]">$1,480</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom row: Payout Card + AI Box + Lease Expirations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Payout */}
          <Card className="border border-[#f0e8ea] bg-gradient-to-br from-white to-[#fdf5f7] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#d4738a]" /> Upcoming Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-[#2c2c2c] font-serif">$5,920</p>
                  <p className="text-xs text-[#9b8a8d] mt-1">Net payout after management fee</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9b8a8d] text-xs">Date</span>
                  <span className="text-[#2c2c2c] font-semibold text-xs">March 28, 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9b8a8d] text-xs">Status</span>
                  <Badge className="bg-[#d4738a]/10 text-[#d4738a] border-[#d4738a]/20 text-xs">Scheduled</Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#d4738a] hover:bg-[#c4637a] text-white text-xs mt-1"
                  onClick={() => navigate("/investor/payouts")}
                >
                  View Payout History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Prompt Box */}
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#d4738a]" /> AI Assistant
              </CardTitle>
              <p className="text-xs text-[#9b8a8d]">Ask anything about your portfolio</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "How much did I make last month?",
                  "Do I have any late tenants?",
                  "When is my next payout?",
                  "Which lease is ending soon?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => navigate("/investor/ai-assistant")}
                    className="text-xs bg-[#faf0f2] text-[#d4738a] border border-[#f0e8ea] hover:border-[#d4738a]/30 rounded-full px-3 py-1.5 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <Button
                className="w-full mt-4 bg-[#d4738a] hover:bg-[#c4637a] text-white text-xs"
                size="sm"
                onClick={() => navigate("/investor/ai-assistant")}
              >
                Open AI Assistant
              </Button>
            </CardContent>
          </Card>

          {/* Lease Expirations */}
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#d4738a]" /> Lease Expirations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleLeases.map((lease, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#faf8f8]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2c2c2c]">{lease.tenant}</p>
                    <p className="text-xs text-[#9b8a8d]">{lease.unit}</p>
                    <p className="text-xs text-[#9b8a8d]">Ends {lease.end}</p>
                  </div>
                  <Badge
                    className={`text-[10px] flex-shrink-0 ${
                      lease.status === "Ending Soon" ? "bg-amber-100 text-amber-700" :
                      lease.status === "Renewed" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}
                  >
                    {lease.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default InvestorDashboard;
