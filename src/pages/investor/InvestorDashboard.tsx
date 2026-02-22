import { useEffect, useState } from "react";
import { Building2, BarChart3, FileText, Users, LayoutDashboard, DollarSign } from "lucide-react";
import SupportChatWidget from "@/components/portal/SupportChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const InvestorDashboard = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [activeLeases, setActiveLeases] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

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

      let units = 0;
      let leases = 0;
      let revenue = 0;

      for (const prop of props) {
        const propUnits = prop.units || [];
        units += propUnits.length;

        for (const unit of propUnits) {
          const { data: unitLeases } = await supabase
            .from("leases")
            .select("rent_amount")
            .eq("unit_id", unit.id)
            .eq("status", "active");

          if (unitLeases) {
            leases += unitLeases.length;
            revenue += unitLeases.reduce((sum: number, l: any) => sum + Number(l.rent_amount), 0);
          }
        }
      }

      setTotalUnits(units);
      setActiveLeases(leases);
      setMonthlyRevenue(revenue);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  const occupancyRate = totalUnits > 0 ? Math.round((activeLeases / totalUnits) * 100) : 0;

  return (
    <PortalLayout title="Investor Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email} userId={user?.id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Investment Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your portfolio performance at a glance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{properties.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalUnits}</p>
              <p className="text-xs text-muted-foreground mt-1">{activeLeases} occupied</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{occupancyRate}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${occupancyRate}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Properties list */}
        <Card>
          <CardHeader><CardTitle className="text-base">Your Properties</CardTitle></CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties yet. Contact management to get started.</p>
            ) : (
              <div className="space-y-3">
                {properties.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.address}{p.city ? `, ${p.city}` : ""}{p.state ? `, ${p.state}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{p.units?.length || 0} units</Badge>
                      <Badge variant="outline" className={`text-xs ${p.status === "active" ? "border-green-500/30 text-green-400" : ""}`}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SupportChatWidget />
      </div>
    </PortalLayout>
  );
};

export default InvestorDashboard;
