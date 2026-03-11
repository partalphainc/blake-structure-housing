import { useEffect, useState } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentDashboard = () => {
  const { user, loading, signOut } = useAuth("resident");
  const [profile, setProfile] = useState<any>(null);
  const [lease, setLease] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [openRequests, setOpenRequests] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, leaseRes, paymentsRes, requestsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("leases").select("*").eq("tenant_id", user.id).eq("status", "active").maybeSingle(),
        supabase.from("payments").select("*").eq("tenant_id", user.id).order("payment_date", { ascending: false }).limit(5),
        supabase.from("maintenance_requests").select("id").eq("tenant_id", user.id).neq("status", "resolved"),
      ]);
      setProfile(profileRes.data);
      setLease(leaseRes.data);
      setRecentPayments(paymentsRes.data || []);
      setOpenRequests(requestsRes.data?.length || 0);
    };
    fetchData();
  }, [user]);

  const getPaymentStanding = () => {
    if (!lease) return null;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const dueDay = (lease as any).due_day || 1;
    const lateFeeGrace = Number((lease as any).late_fee_days || 5);

    const paidThisMonth = recentPayments.some(
      (p) => p.payment_date?.startsWith(currentMonth) && p.status === "recorded"
    );

    if (paidThisMonth) return "current";

    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    const graceCutoff = new Date(dueDate);
    graceCutoff.setDate(graceCutoff.getDate() + lateFeeGrace);

    if (now > graceCutoff) return "late";

    const dueSoonCutoff = new Date(dueDate);
    dueSoonCutoff.setDate(dueSoonCutoff.getDate() - 5);
    if (now >= dueSoonCutoff) return "due-soon";

    return "current";
  };

  const standing = getPaymentStanding();

  const standingStyles: Record<string, string> = {
    current: "border-green-300 bg-green-50",
    late: "border-red-300 bg-red-50",
    "due-soon": "border-yellow-300 bg-yellow-50",
  };

  const standingLabel: Record<string, string> = {
    current: "Paid / Current",
    late: "Past Due",
    "due-soon": "Due Soon",
  };

  const standingBadgeClass: Record<string, string> = {
    current: "border-green-300 text-green-700",
    late: "border-red-300 text-red-700",
    "due-soon": "border-yellow-300 text-yellow-700",
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email} userId={user?.id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
          <p className="text-muted-foreground text-sm mt-1">Your housing dashboard at a glance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={standing ? standingStyles[standing] : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Rent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lease ? (
                <>
                  <p className="text-2xl font-bold">${Number(lease.rent_amount).toFixed(0)}<span className="text-sm text-muted-foreground font-normal">/{lease.payment_frequency === "weekly" ? "wk" : "mo"}</span></p>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-xs ${standing ? standingBadgeClass[standing] : "border-primary/30 text-primary"}`}
                  >
                    {standing ? standingLabel[standing] : "Active Agreement"}
                  </Badge>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No active agreement found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Open Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{openRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">maintenance requests pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Recent Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments[0] ? (
                <>
                  <p className="text-2xl font-bold">${Number(recentPayments[0].amount).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(recentPayments[0].payment_date).toLocaleDateString()}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent payments table */}
        {recentPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">${Number(p.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{p.payment_method || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</p>
                      <Badge variant="outline" className="text-xs">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </PortalLayout>
  );
};

export default ResidentDashboard;
