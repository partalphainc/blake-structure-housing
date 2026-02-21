import { useEffect, useState } from "react";
import { Building2, BarChart3, FileText, Users, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const navItems = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const InvestorFinancials = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
        supabase.from("properties").select("id").eq("owner_id", user.id),
      ]);
      setProfile(profileRes.data);

      const propIds = (propsRes.data || []).map((p: any) => p.id);
      if (propIds.length > 0) {
        const { data } = await supabase
          .from("investor_reports")
          .select("*, properties(name)")
          .in("property_id", propIds)
          .order("report_month", { ascending: false });
        setReports(data || []);
      }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Investor Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Financial Reports</h1>
        <p className="text-muted-foreground text-sm">Monthly performance reports for your properties.</p>

        <Card>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No financial reports available yet. Reports are generated monthly by management.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Occupancy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{new Date(r.report_month).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</TableCell>
                      <TableCell className="text-sm font-medium">{(r as any).properties?.name || "—"}</TableCell>
                      <TableCell className="text-sm text-green-400">${Number(r.total_revenue).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-red-400">${Number(r.total_expenses).toLocaleString()}</TableCell>
                      <TableCell className="text-sm font-medium">${(Number(r.total_revenue) - Number(r.total_expenses)).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{Number(r.occupancy_rate).toFixed(0)}%</TableCell>
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

export default InvestorFinancials;
