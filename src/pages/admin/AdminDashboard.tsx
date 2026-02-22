import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Building2, Users, FileText, Wrench, DollarSign, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/admin/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Units", href: "/admin/units", icon: <Building2 className="w-4 h-4" /> },
  { label: "Leases", href: "/admin/leases", icon: <FileText className="w-4 h-4" /> },
  { label: "Payments", href: "/admin/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/admin/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
];

export { adminNav };

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth("admin");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!user,
    queryFn: async () => {
      const [properties, units, leases, payments, maintenance] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("units").select("id", { count: "exact", head: true }),
        supabase.from("leases").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("payments").select("amount").eq("status", "recorded"),
        supabase.from("maintenance_requests").select("id", { count: "exact", head: true }).eq("status", "submitted"),
      ]);
      const totalRevenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return {
        properties: properties.count || 0,
        units: units.count || 0,
        activeLeases: leases.count || 0,
        totalRevenue,
        openMaintenance: maintenance.count || 0,
      };
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <h1 className="text-2xl font-serif font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Properties", value: stats?.properties ?? "–", icon: <Building2 className="w-5 h-5 text-primary" /> },
          { label: "Units", value: stats?.units ?? "–", icon: <Building2 className="w-5 h-5 text-primary" /> },
          { label: "Active Leases", value: stats?.activeLeases ?? "–", icon: <FileText className="w-5 h-5 text-primary" /> },
          { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-primary" /> },
          { label: "Open Maintenance", value: stats?.openMaintenance ?? "–", icon: <Wrench className="w-5 h-5 text-primary" /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;
