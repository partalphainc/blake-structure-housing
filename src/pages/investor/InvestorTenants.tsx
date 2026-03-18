import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const sampleTenants = [
  {
    id: "t1",
    name: "Jordan Williams",
    property: "4512 Oak Avenue",
    unit: "Unit 2B",
    leaseStart: "May 1, 2025",
    leaseEnd: "Apr 30, 2026",
    rent: 1150,
    paymentStatus: "On Time",
    balance: 0,
    renewal: "Pending",
  },
  {
    id: "t2",
    name: "Rachel Davis",
    property: "1823 Maple Drive",
    unit: "Unit 1A",
    leaseStart: "Jun 1, 2025",
    leaseEnd: "May 31, 2026",
    rent: 1400,
    paymentStatus: "Late",
    balance: 650,
    renewal: "Not Started",
  },
  {
    id: "t3",
    name: "Marcus Thompson",
    property: "4512 Oak Avenue",
    unit: "Unit 3C",
    leaseStart: "Sep 1, 2024",
    leaseEnd: "Aug 31, 2026",
    rent: 1200,
    paymentStatus: "On Time",
    balance: 0,
    renewal: "Renewed",
  },
];

const statusStyles: Record<string, string> = {
  "On Time": "bg-green-100 text-green-700",
  "Late": "bg-red-100 text-red-600",
  "Ending Soon": "bg-amber-100 text-amber-700",
  "Renewed": "bg-blue-100 text-blue-700",
};

const renewalStyles: Record<string, string> = {
  "Renewed": "bg-blue-100 text-blue-700",
  "Pending": "bg-amber-100 text-amber-700",
  "Not Started": "bg-gray-100 text-gray-600",
};

const InvestorTenants = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, propRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("properties").select("id").eq("owner_id", user.id),
      ]);
      setProfile(profileRes.data);

      const propIds = propRes.data?.map((p: any) => p.id) || [];
      if (propIds.length > 0) {
        const { data: leases } = await supabase
          .from("leases")
          .select("*, units(*, properties(*)), profiles(*)")
          .in("unit_id", propIds)
          .eq("status", "active");
        if (leases && leases.length > 0) {
          setTenants(leases);
        }
      }
      setFetching(false);
    };
    fetchData();
  }, [user]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading tenants...</p>
      </div>
    </div>
  );

  const displayTenants = tenants.length > 0 ? tenants : sampleTenants;
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const filtered = displayTenants.filter((t: any) => {
    const name = t.name || t.profiles?.full_name || "";
    return name.toLowerCase().includes(search.toLowerCase()) ||
      (t.property || t.units?.properties?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Tenants</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Lease status and payment health for all tenants</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tenants", value: displayTenants.length, color: "text-[#d4738a]" },
            { label: "On Time", value: displayTenants.filter((t: any) => t.paymentStatus === "On Time").length, color: "text-green-500" },
            { label: "Late", value: displayTenants.filter((t: any) => t.paymentStatus === "Late").length, color: "text-red-500" },
            { label: "Outstanding Balance", value: `$${displayTenants.reduce((s: number, t: any) => s + (t.balance || 0), 0).toLocaleString()}`, color: "text-amber-500" },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Tenant Roster</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9b8a8d]" />
                <Input
                  placeholder="Search tenants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs border-[#f0e8ea] w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#d4738a]/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-[#d4738a]/40" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#2c2c2c] mb-2">No Tenants Found</h3>
                <p className="text-[#9b8a8d] text-sm max-w-xs">No tenants match your search. Try a different term.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0e8ea]">
                      {["Tenant", "Property", "Unit", "Lease Start", "Lease End", "Rent", "Payment Status", "Balance", "Renewal"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-[#9b8a8d] pb-3 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8ea]">
                    {filtered.map((tenant: any, i) => {
                      const name = tenant.name || tenant.profiles?.full_name || "Unknown";
                      const property = tenant.property || tenant.units?.properties?.name || "—";
                      const unit = tenant.unit || tenant.units?.unit_number || "—";
                      const start = tenant.leaseStart || tenant.start_date || "—";
                      const end = tenant.leaseEnd || tenant.end_date || "—";
                      const rent = tenant.rent || tenant.rent_amount || 0;
                      const status = tenant.paymentStatus || "On Time";
                      const balance = tenant.balance || 0;
                      const renewal = tenant.renewal || "Not Started";

                      return (
                        <tr key={i} className="hover:bg-[#faf8f8] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4738a]/30 to-[#d4738a]/10 flex items-center justify-center text-[#d4738a] text-xs font-bold flex-shrink-0">
                                {name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium text-[#2c2c2c] whitespace-nowrap">{name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-xs text-[#6b5b5e] whitespace-nowrap">{property}</td>
                          <td className="py-3 pr-4 text-xs text-[#6b5b5e]">{unit}</td>
                          <td className="py-3 pr-4 text-xs text-[#9b8a8d] whitespace-nowrap">{start}</td>
                          <td className="py-3 pr-4 text-xs text-[#9b8a8d] whitespace-nowrap">{end}</td>
                          <td className="py-3 pr-4 text-sm font-semibold text-[#2c2c2c]">${Number(rent).toLocaleString()}</td>
                          <td className="py-3 pr-4">
                            <Badge className={`text-[10px] ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>{status}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-xs font-semibold text-[#2c2c2c]">
                            {balance > 0 ? <span className="text-red-500">${balance.toLocaleString()}</span> : <span className="text-green-500">$0</span>}
                          </td>
                          <td className="py-3">
                            <Badge className={`text-[10px] ${renewalStyles[renewal] || "bg-gray-100 text-gray-600"}`}>{renewal}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorTenants;
