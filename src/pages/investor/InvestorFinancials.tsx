import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const revenueChartData = [
  { month: "Oct", revenue: 6800, expenses: 1200 },
  { month: "Nov", revenue: 7100, expenses: 980 },
  { month: "Dec", revenue: 6950, expenses: 1450 },
  { month: "Jan", revenue: 7200, expenses: 1100 },
  { month: "Feb", revenue: 7400, expenses: 1080 },
  { month: "Mar", revenue: 7400, expenses: 1480 },
];

const profitData = [
  { month: "Oct", profit: 5600 },
  { month: "Nov", profit: 6120 },
  { month: "Dec", profit: 5500 },
  { month: "Jan", profit: 6100 },
  { month: "Feb", profit: 6320 },
  { month: "Mar", profit: 5920 },
];

const sampleTransactions = [
  { date: "Mar 15, 2026", property: "4512 Oak Ave", category: "Rent", description: "Rent — Unit 2B, J. Williams", amount: 1150, type: "Income", status: "Paid" },
  { date: "Mar 14, 2026", property: "4512 Oak Ave", category: "Rent", description: "Rent — Unit 3A, K. Brown", amount: 1200, type: "Income", status: "Paid" },
  { date: "Mar 13, 2026", property: "4512 Oak Ave", category: "Maintenance", description: "HVAC repair — Unit 1B", amount: 480, type: "Expense", status: "Paid" },
  { date: "Mar 12, 2026", property: "1823 Maple Dr", category: "Rent", description: "Rent — Unit 1A, R. Davis", amount: 1400, type: "Income", status: "Paid" },
  { date: "Mar 10, 2026", property: "1823 Maple Dr", category: "Maintenance", description: "Plumbing repair", amount: 325, type: "Expense", status: "Paid" },
  { date: "Mar 5, 2026", property: "4512 Oak Ave", category: "Management Fee", description: "Monthly management fee (8%)", amount: 592, type: "Expense", status: "Paid" },
  { date: "Mar 3, 2026", property: "4512 Oak Ave", category: "Rent", description: "Rent — Unit 4C, T. Jackson", amount: 1050, type: "Income", status: "Paid" },
  { date: "Mar 1, 2026", property: "4512 Oak Ave", category: "Payout", description: "Owner payout — February", amount: 5920, type: "Income", status: "Paid" },
  { date: "Feb 28, 2026", property: "1823 Maple Dr", category: "Insurance", description: "Renters insurance premium", amount: 175, type: "Expense", status: "Paid" },
  { date: "Feb 25, 2026", property: "4512 Oak Ave", category: "Utilities", description: "Common area utilities", amount: 210, type: "Expense", status: "Paid" },
];

const InvestorFinancials = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading financials...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const filteredTx = sampleTransactions.filter((tx) => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.property.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || tx.type === typeFilter;
    const matchProp = propertyFilter === "All" || tx.property.includes(propertyFilter);
    return matchSearch && matchType && matchProp;
  });

  const totalRevenue = sampleTransactions.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = sampleTransactions.filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Financials</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Revenue, expenses, and profit for your portfolio</p>
        </div>

        {/* Summary Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue (Mar)", value: `$7,400`, icon: <TrendingUp className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
            { label: "Total Expenses (Mar)", value: `$1,480`, icon: <TrendingDown className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-50" },
            { label: "Net Profit (Mar)", value: `$5,920`, icon: <DollarSign className="w-5 h-5" />, color: "text-[#d4738a]", bg: "bg-[#d4738a]/10" },
          ].map((card) => (
            <Card key={card.label} className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#9b8a8d] font-medium">{card.label}</p>
                  <div className={`p-1.5 rounded-lg ${card.bg}`}>
                    <span className={card.color}>{card.icon}</span>
                  </div>
                </div>
                <p className={`text-2xl font-bold font-serif ${card.color}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "YTD Revenue", value: "$21,650" },
            { label: "YTD Expenses", value: "$4,310" },
            { label: "YTD Profit", value: "$17,340" },
            { label: "Unpaid Balances", value: "$650" },
          ].map((card) => (
            <Card key={card.label} className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold font-serif text-[#2c2c2c]">{card.value}</p>
                <p className="text-xs text-[#9b8a8d] mt-1">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Revenue vs Expenses</CardTitle>
              <p className="text-xs text-[#9b8a8d]">Last 6 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4738a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4738a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid #f0e8ea" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#d4738a" strokeWidth={2} fill="url(#revGrad2)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad2)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Net Profit</CardTitle>
              <p className="text-xs text-[#9b8a8d]">Monthly net profit — last 6 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={profitData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b8a8d" }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid #f0e8ea" }} />
                  <Bar dataKey="profit" fill="#d4738a" radius={[4, 4, 0, 0]} name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Transactions</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9b8a8d]" />
                  <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs border-[#f0e8ea] w-44"
                  />
                </div>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="h-8 text-xs border border-[#f0e8ea] rounded-md px-2 bg-white text-[#6b5b5e] focus:outline-none focus:border-[#d4738a]"
                >
                  <option value="All">All Properties</option>
                  <option value="Oak">4512 Oak Ave</option>
                  <option value="Maple">1823 Maple Dr</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 text-xs border border-[#f0e8ea] rounded-md px-2 bg-white text-[#6b5b5e] focus:outline-none focus:border-[#d4738a]"
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8ea]">
                    {["Date", "Property", "Category", "Description", "Amount", "Type", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#9b8a8d] pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e8ea]">
                  {filteredTx.map((tx, i) => (
                    <tr key={i} className="hover:bg-[#faf8f8] transition-colors">
                      <td className="py-3 pr-4 text-xs text-[#9b8a8d] whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 pr-4 text-xs text-[#2c2c2c] whitespace-nowrap">{tx.property}</td>
                      <td className="py-3 pr-4 text-xs text-[#6b5b5e] whitespace-nowrap">{tx.category}</td>
                      <td className="py-3 pr-4 text-xs text-[#2c2c2c] max-w-[200px] truncate">{tx.description}</td>
                      <td className={`py-3 pr-4 text-xs font-semibold whitespace-nowrap ${tx.type === "Income" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "Income" ? "+" : "-"}${tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={`text-[10px] ${tx.type === "Income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge className="text-[10px] bg-blue-100 text-blue-700">{tx.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredTx.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-[#9b8a8d]">No transactions match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorFinancials;
