import { useState, useEffect } from "react";
import { Wrench, ChevronDown, ChevronUp, ImageIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleMaintenance = [
  {
    id: "m1",
    date: "Mar 14, 2026",
    property: "4512 Oak Avenue",
    issue: "HVAC not heating — Unit 1B",
    priority: "High",
    vendor: "Comfort Air Services",
    estCost: 450,
    actualCost: 480,
    status: "Completed",
    description: "Tenant reported heating unit stopped working. Vendor replaced faulty capacitor and cleaned filters. System fully operational.",
    timeline: [
      { event: "Request submitted", date: "Mar 12, 2026" },
      { event: "Vendor assigned", date: "Mar 13, 2026" },
      { event: "Work completed", date: "Mar 14, 2026" },
    ],
  },
  {
    id: "m2",
    date: "Mar 11, 2026",
    property: "1823 Maple Drive",
    issue: "Bathroom faucet leaking — Unit 1A",
    priority: "Medium",
    vendor: "St. Louis Plumbing Co.",
    estCost: 150,
    actualCost: 325,
    status: "Completed",
    description: "Slow drip from bathroom faucet. Vendor replaced cartridge and supply lines. No further leaks detected.",
    timeline: [
      { event: "Request submitted", date: "Mar 10, 2026" },
      { event: "Vendor assigned", date: "Mar 11, 2026" },
      { event: "Work completed", date: "Mar 11, 2026" },
    ],
  },
  {
    id: "m3",
    date: "Mar 17, 2026",
    property: "4512 Oak Avenue",
    issue: "Broken door lock — Unit 2B",
    priority: "High",
    vendor: "Pending Assignment",
    estCost: 200,
    actualCost: null,
    status: "Pending",
    description: "Tenant unable to lock front door from outside. Security concern — needs urgent attention.",
    timeline: [
      { event: "Request submitted", date: "Mar 17, 2026" },
    ],
  },
  {
    id: "m4",
    date: "Mar 16, 2026",
    property: "4512 Oak Avenue",
    issue: "Dishwasher not draining — Unit 3C",
    priority: "Medium",
    vendor: "Home Appliance Pros",
    estCost: 175,
    actualCost: null,
    status: "In Progress",
    description: "Standing water in dishwasher after cycle. Vendor inspecting drain pump and filter assembly.",
    timeline: [
      { event: "Request submitted", date: "Mar 15, 2026" },
      { event: "Vendor assigned", date: "Mar 16, 2026" },
    ],
  },
  {
    id: "m5",
    date: "Feb 28, 2026",
    property: "1823 Maple Drive",
    issue: "Garage door spring replacement",
    priority: "Low",
    vendor: "Metro Door & Gate",
    estCost: 300,
    actualCost: 285,
    status: "Completed",
    description: "Garage door spring broke. Vendor replaced both springs and lubricated tracks. Door fully operational.",
    timeline: [
      { event: "Request submitted", date: "Feb 26, 2026" },
      { event: "Vendor assigned", date: "Feb 27, 2026" },
      { event: "Work completed", date: "Feb 28, 2026" },
    ],
  },
];

const priorityStyles: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Assigned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-green-100 text-green-700",
};

const InvestorMaintenance = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading maintenance...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";
  const open = sampleMaintenance.filter(m => m.status === "Pending").length;
  const inProgress = sampleMaintenance.filter(m => m.status === "In Progress").length;
  const completed = sampleMaintenance.filter(m => m.status === "Completed").length;
  const totalCost = sampleMaintenance.reduce((s, m) => s + (m.actualCost || 0), 0);

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Maintenance</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Track all repair requests and vendor work across your portfolio</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open", value: open, color: "text-red-500", bg: "bg-red-50" },
            { label: "In Progress", value: inProgress, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Completed", value: completed, color: "text-green-500", bg: "bg-green-50" },
            { label: "Cost This Month", value: `$${totalCost.toLocaleString()}`, color: "text-[#d4738a]", bg: "bg-[#d4738a]/10" },
          ].map((card) => (
            <Card key={card.label} className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Wrench className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className={`text-2xl font-bold font-serif ${card.color}`}>{card.value}</p>
                <p className="text-xs text-[#9b8a8d] mt-1">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Maintenance Table */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c]">All Requests</CardTitle>
            <p className="text-xs text-[#9b8a8d]">Click any row to see full details</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8ea]">
                    {["Date", "Property", "Issue", "Priority", "Vendor", "Est. Cost", "Actual", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#9b8a8d] py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sampleMaintenance.map((item) => (
                    <>
                      <tr
                        key={item.id}
                        className="border-b border-[#f0e8ea] hover:bg-[#faf8f8] cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                      >
                        <td className="py-3 px-4 text-xs text-[#9b8a8d] whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-4 text-xs text-[#2c2c2c] whitespace-nowrap">{item.property}</td>
                        <td className="py-3 px-4 text-sm text-[#2c2c2c] max-w-[200px]">
                          <span className="line-clamp-1">{item.issue}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`text-[10px] ${priorityStyles[item.priority]}`}>{item.priority}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#6b5b5e] whitespace-nowrap">{item.vendor}</td>
                        <td className="py-3 px-4 text-xs text-[#6b5b5e]">${item.estCost}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-[#2c2c2c]">
                          {item.actualCost !== null ? `$${item.actualCost}` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`text-[10px] ${statusStyles[item.status]}`}>{item.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {expandedRow === item.id
                            ? <ChevronUp className="w-4 h-4 text-[#9b8a8d]" />
                            : <ChevronDown className="w-4 h-4 text-[#9b8a8d]" />}
                        </td>
                      </tr>
                      {expandedRow === item.id && (
                        <tr key={`${item.id}-detail`} className="bg-[#faf8f8] border-b border-[#f0e8ea]">
                          <td colSpan={9} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-2 space-y-4">
                                <div>
                                  <p className="text-xs font-semibold text-[#9b8a8d] uppercase tracking-wide mb-1">Description</p>
                                  <p className="text-sm text-[#2c2c2c]">{item.description}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-[#9b8a8d] uppercase tracking-wide mb-2">Timeline</p>
                                  <div className="space-y-2">
                                    {item.timeline.map((t, i) => (
                                      <div key={i} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === item.timeline.length - 1 ? "bg-[#d4738a]" : "bg-[#d4738a]/30"}`} />
                                        <span className="text-xs text-[#2c2c2c]">{t.event}</span>
                                        <span className="text-xs text-[#9b8a8d] ml-auto">{t.date}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-[#9b8a8d] uppercase tracking-wide mb-2">Photos</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Before", "After"].map((label) => (
                                      <div key={label} className="aspect-square bg-[#f0e8ea] rounded-lg flex flex-col items-center justify-center gap-1">
                                        <ImageIcon className="w-5 h-5 text-[#b8a4a8]" />
                                        <span className="text-[10px] text-[#9b8a8d]">{label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-[#f0e8ea]">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-3.5 h-3.5 text-[#d4738a]" />
                                    <span className="text-xs font-semibold text-[#2c2c2c]">Invoice</span>
                                  </div>
                                  <p className="text-xs text-[#9b8a8d]">{item.actualCost ? `$${item.actualCost} — Paid` : "Pending invoice"}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorMaintenance;
