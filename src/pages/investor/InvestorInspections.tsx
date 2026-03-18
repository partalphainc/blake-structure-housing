import { useEffect, useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleInspections = [
  {
    id: "i1",
    property: "4512 Oak Avenue",
    type: "Quarterly",
    scheduledDate: "Mar 10, 2026",
    completedDate: "Mar 10, 2026",
    status: "Completed",
    inspector: "D. Blake",
    report: "Report #INS-2026-0310",
    notes: "All units in good condition. Minor wear in Unit 2B bathroom — noted for routine maintenance. HVAC filters replaced. Smoke detectors tested and functional.",
    findings: [
      { room: "Unit 1B — Kitchen", condition: "Good", notes: "Clean, appliances functional" },
      { room: "Unit 2B — Bathroom", condition: "Fair", notes: "Caulking showing wear, scheduled for replacement" },
      { room: "Unit 3C — Living Room", condition: "Excellent", notes: "No issues found" },
      { room: "Common Areas", condition: "Good", notes: "Hallways and entry clean" },
    ],
  },
  {
    id: "i2",
    property: "1823 Maple Drive",
    type: "Routine",
    scheduledDate: "Feb 22, 2026",
    completedDate: "Feb 22, 2026",
    status: "Completed",
    inspector: "D. Blake",
    report: "Report #INS-2026-0222",
    notes: "Property in excellent condition overall. Tenant maintaining unit well. No outstanding concerns.",
    findings: [
      { room: "Unit 1A — Full Property", condition: "Excellent", notes: "Tenant maintaining unit very well" },
      { room: "Exterior", condition: "Good", notes: "Lawn maintained, no damage noted" },
    ],
  },
  {
    id: "i3",
    property: "4512 Oak Avenue",
    type: "Annual",
    scheduledDate: "Apr 15, 2026",
    completedDate: null,
    status: "Scheduled",
    inspector: "TBD",
    report: null,
    notes: null,
    findings: [],
  },
  {
    id: "i4",
    property: "4512 Oak Avenue",
    type: "Move-In",
    scheduledDate: "May 1, 2025",
    completedDate: "May 1, 2025",
    status: "Completed",
    inspector: "D. Blake",
    report: "Report #INS-2025-0501",
    notes: "Move-in inspection completed for Unit 2B. All items documented. Tenant signed inspection report.",
    findings: [
      { room: "Bedroom", condition: "Excellent", notes: "Freshly painted, carpet cleaned" },
      { room: "Kitchen", condition: "Excellent", notes: "New appliances, all functional" },
      { room: "Bathroom", condition: "Excellent", notes: "Deep cleaned, no issues" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-600",
};

const conditionStyles: Record<string, string> = {
  Excellent: "text-green-600",
  Good: "text-blue-600",
  Fair: "text-amber-600",
  Poor: "text-red-600",
};

const InvestorInspections = () => {
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
        <p className="text-[#9b8a8d] text-sm">Loading inspections...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";
  const completed = sampleInspections.filter(i => i.status === "Completed").length;
  const scheduled = sampleInspections.filter(i => i.status === "Scheduled").length;

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Inspections</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">All property inspections, reports, and condition notes</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Inspections", value: sampleInspections.length, color: "text-[#d4738a]" },
            { label: "Completed", value: completed, color: "text-green-500" },
            { label: "Scheduled", value: scheduled, color: "text-blue-500" },
            { label: "Inspector", value: "D. Blake", color: "text-[#2c2c2c]" },
          ].map((stat) => (
            <Card key={stat.label} className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[#9b8a8d] mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#d4738a]" />
              Inspection Log
            </CardTitle>
            <p className="text-xs text-[#9b8a8d]">Click any row to expand the full report</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8ea]">
                    {["Property", "Type", "Scheduled", "Completed", "Status", "Inspector", "Report"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#9b8a8d] py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sampleInspections.map((insp) => (
                    <>
                      <tr
                        key={insp.id}
                        className="border-b border-[#f0e8ea] hover:bg-[#faf8f8] cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(expandedRow === insp.id ? null : insp.id)}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-[#2c2c2c] whitespace-nowrap">{insp.property}</td>
                        <td className="py-3 px-4 text-xs text-[#6b5b5e]">{insp.type}</td>
                        <td className="py-3 px-4 text-xs text-[#9b8a8d] whitespace-nowrap">{insp.scheduledDate}</td>
                        <td className="py-3 px-4 text-xs text-[#9b8a8d] whitespace-nowrap">{insp.completedDate || "—"}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-[10px] ${statusStyles[insp.status]}`}>{insp.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#6b5b5e]">{insp.inspector}</td>
                        <td className="py-3 px-4 text-xs text-[#9b8a8d]">{insp.report || "Pending"}</td>
                        <td className="py-3 px-4">
                          {expandedRow === insp.id
                            ? <ChevronUp className="w-4 h-4 text-[#9b8a8d]" />
                            : <ChevronDown className="w-4 h-4 text-[#9b8a8d]" />}
                        </td>
                      </tr>
                      {expandedRow === insp.id && (
                        <tr key={`${insp.id}-detail`} className="bg-[#faf8f8] border-b border-[#f0e8ea]">
                          <td colSpan={8} className="px-6 py-5">
                            {insp.notes ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-semibold text-[#9b8a8d] uppercase tracking-wide mb-2">Inspector Notes</p>
                                  <p className="text-sm text-[#2c2c2c]">{insp.notes}</p>
                                </div>
                                {insp.findings.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-[#9b8a8d] uppercase tracking-wide mb-2">Room-by-Room Findings</p>
                                    <div className="space-y-2">
                                      {insp.findings.map((f, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-[#f0e8ea]">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-[#2c2c2c]">{f.room}</p>
                                            <p className="text-xs text-[#9b8a8d]">{f.notes}</p>
                                          </div>
                                          <span className={`text-xs font-semibold flex-shrink-0 ${conditionStyles[f.condition]}`}>{f.condition}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-[#9b8a8d]">This inspection is scheduled and has not yet been completed.</p>
                            )}
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

export default InvestorInspections;
