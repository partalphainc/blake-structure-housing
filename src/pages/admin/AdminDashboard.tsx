import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, FileText, Wrench, DollarSign, LayoutDashboard, UserCheck, Briefcase, ClipboardList, Bell, Store, ClipboardCheck, BarChart3 } from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Applications", href: "/admin/applications", icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: "Tenants", href: "/admin/tenants", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Investors", href: "/admin/investors", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Properties", href: "/admin/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Units", href: "/admin/units", icon: <Building2 className="w-4 h-4" /> },
  { label: "Agreements", href: "/admin/leases", icon: <FileText className="w-4 h-4" /> },
  { label: "Payments", href: "/admin/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Accounting", href: "/admin/accounting", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-4 h-4" /> },
  { label: "Maintenance", href: "/admin/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Vendors", href: "/admin/vendors", icon: <Store className="w-4 h-4" /> },
  { label: "Inspections", href: "/admin/inspections", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Documents", href: "/admin/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Activity Log", href: "/admin/activity", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
];

export { adminNav };

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth("admin");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!user,
    queryFn: async () => {
      const [properties, units, leases, payments, maintenance, applications] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("units").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("leases").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("payments").select("amount").eq("status", "recorded"),
        supabase.from("maintenance_requests").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        (supabase as any).from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const totalRevenue = payments.data?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      return {
        properties: properties.count || 0,
        units: units.count || 0,
        activeAgreements: leases.count || 0,
        totalRevenue,
        openMaintenance: maintenance.count || 0,
        pendingApplications: applications.count || 0,
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
          { label: "Active Agreements", value: stats?.activeAgreements ?? "–", icon: <FileText className="w-5 h-5 text-primary" /> },
          { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-primary" /> },
          { label: "Open Maintenance", value: stats?.openMaintenance ?? "–", icon: <Wrench className="w-5 h-5 text-primary" /> },
          { label: "Pending Applications", value: stats?.pendingApplications ?? "–", icon: <ClipboardCheck className="w-5 h-5 text-primary" /> },
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
