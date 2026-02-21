import { useEffect, useState } from "react";
import { Building2, BarChart3, FileText, Users, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const navItems = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const InvestorTenants = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
        supabase.from("properties").select("id, name, units(id, unit_name)").eq("owner_id", user.id),
      ]);
      setProfile(profileRes.data);

      const props = propsRes.data || [];
      const unitIds: string[] = [];
      const unitMap: Record<string, { unitName: string; propName: string }> = {};

      for (const p of props) {
        for (const u of (p.units || [])) {
          unitIds.push(u.id);
          unitMap[u.id] = { unitName: u.unit_name, propName: p.name };
        }
      }

      if (unitIds.length > 0) {
        const { data } = await supabase
          .from("leases")
          .select("*")
          .in("unit_id", unitIds)
          .order("start_date", { ascending: false });

        setLeases((data || []).map((l: any) => ({ ...l, ...unitMap[l.unit_id] })));
      }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Investor Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Tenant Overview</h1>
        <p className="text-muted-foreground text-sm">Active and past leases across your properties.</p>

        <Card>
          <CardContent className="p-0">
            {leases.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No tenant data available yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leases.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">{l.propName || "—"}</TableCell>
                      <TableCell className="text-sm">{l.unitName || "—"}</TableCell>
                      <TableCell className="text-sm">${Number(l.rent_amount).toFixed(0)}/{l.payment_frequency === "weekly" ? "wk" : "mo"}</TableCell>
                      <TableCell className="text-sm">{new Date(l.start_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{l.end_date ? new Date(l.end_date).toLocaleDateString() : "Ongoing"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${l.status === "active" ? "border-green-500/30 text-green-400" : ""}`}>{l.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default InvestorTenants;
