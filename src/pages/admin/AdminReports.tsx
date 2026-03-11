import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, Building2, Users, DollarSign, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminReports = () => {
  const { user, loading, signOut } = useAuth("admin");

  const { data: report } = useQuery({
    queryKey: ["admin-full-report"],
    enabled: !!user,
    queryFn: async () => {
      const [properties, units, leases, payments, maintenance, tenants] = await Promise.all([
        supabase.from("properties").select("*").is("deleted_at", null),
        supabase.from("units").select("*, properties(name)").is("deleted_at", null),
        supabase.from("leases").select("*, units(unit_name, properties(name))"),
        supabase.from("payments").select("*").order("payment_date", { ascending: false }),
        supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id").eq("role", "resident"),
      ]);

      const allPayments = payments.data || [];
      const allLeases = leases.data || [];
      const allUnits = units.data || [];

      // Occupancy
      const occupiedUnits = allUnits.filter((u: any) => u.status === "occupied").length;
      const occupancyRate = allUnits.length > 0 ? Math.round((occupiedUnits / allUnits.length) * 100) : 0;

      // Revenue by month (last 6 months)
      const monthlyRevenue: Record<string, number> = {};
      allPayments.forEach((p: any) => {
        const month = p.payment_date?.slice(0, 7);
        if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(p.amount);
      });

      // Delinquency
      const activeLeases = allLeases.filter((l: any) => l.status === "active");
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      const delinquent = activeLeases.filter((l: any) => {
        const paidThisMonth = allPayments.some((p: any) => p.tenant_id === l.tenant_id && p.payment_date?.startsWith(currentMonth));
        const dueDay = (l as any).due_day || 1;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        return !paidThisMonth && now > dueDate;
      });

      return {
        totalProperties: (properties.data || []).length,
        totalUnits: allUnits.length,
        occupiedUnits,
        occupancyRate,
        totalTenants: (tenants.data || []).length,
        activeLeases: activeLeases.length,
        totalRevenue: allPayments.reduce((s: number, p: any) => s + Number(p.amount), 0),
        monthlyRevenue,
        delinquentCount: delinquent.length,
        delinquentLeases: delinquent,
        openMaintenance: (maintenance.data || []).filter((m: any) => m.status === "submitted").length,
        resolvedMaintenance: (maintenance.data || []).filter((m: any) => m.status === "resolved").length,
      };
    },
  });

  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  }).reverse();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Reports</h1>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-1" /> Print / Export
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Properties", value: report?.totalProperties ?? "–", icon: <Building2 className="w-4 h-4 text-primary" /> },
          { label: "Total Units", value: report?.totalUnits ?? "–", icon: <Building2 className="w-4 h-4 text-primary" /> },
          { label: "Occupancy Rate", value: `${report?.occupancyRate ?? 0}%`, icon: <Users className="w-4 h-4 text-primary" /> },
          { label: "Total Revenue", value: `$${(report?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-4 h-4 text-primary" /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent><p className="text-xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastSixMonths.map((month) => {
                const rev = report?.monthlyRevenue[month] || 0;
                const maxRev = Math.max(...lastSixMonths.map((m) => report?.monthlyRevenue[m] || 0), 1);
                const pct = Math.round((rev / maxRev) * 100);
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">{month}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">${rev.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delinquency Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Delinquency Report
              {(report?.delinquentCount ?? 0) > 0 && (
                <Badge className="bg-red-100 text-red-800 text-xs">{report?.delinquentCount} overdue</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(report?.delinquentCount ?? 0) === 0 ? (
              <p className="text-sm text-green-600">All tenants are current.</p>
            ) : (
              <div className="space-y-2">
                {report?.delinquentLeases?.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">{l.units?.unit_name} – {l.units?.properties?.name}</p>
                      <p className="text-xs text-muted-foreground">Due: ${Number(l.rent_amount).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Report */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="w-4 h-4" /> Maintenance Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{report?.openMaintenance ?? 0}</p>
                <p className="text-xs text-muted-foreground">Open requests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{report?.resolvedMaintenance ?? 0}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Report */}
        <Card>
          <CardHeader><CardTitle className="text-base">Occupancy Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-green-600">{report?.occupiedUnits ?? 0}</p>
                <p className="text-xs text-muted-foreground">Occupied units</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">{(report?.totalUnits ?? 0) - (report?.occupiedUnits ?? 0)}</p>
                <p className="text-xs text-muted-foreground">Vacant units</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{report?.occupancyRate ?? 0}%</p>
                <p className="text-xs text-muted-foreground">Occupancy rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AdminReports;
