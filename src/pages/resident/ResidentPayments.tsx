import { useEffect, useState } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard, Bell, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentPayments = () => {
  const { user, loading, signOut } = useAuth("resident");
  const [payments, setPayments] = useState<any[]>([]);
  const [lease, setLease] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("payments")
        .select("*")
        .eq("tenant_id", user.id)
        .order("payment_date", { ascending: false }),
      supabase
        .from("leases")
        .select("*, units(unit_name, properties(name))")
        .eq("tenant_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
      (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]).then(([paymentsRes, leaseRes, profileRes, notifRes]) => {
      setPayments(paymentsRes.data || []);
      setLease(leaseRes.data);
      setProfile(profileRes.data);
      setNotifications(notifRes.data || []);
    });
  }, [user]);

  const markNotificationRead = async (id: string) => {
    await (supabase as any).from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNextDueDate = (): string => {
    if (!lease) return "—";
    const dueDay = (lease as any).due_day || 1;
    const freq = lease.payment_frequency || "monthly";
    const now = new Date();

    if (freq === "monthly") {
      const due = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (due < now) due.setMonth(due.getMonth() + 1);
      return due.toLocaleDateString();
    }
    if (freq === "weekly") {
      const due = new Date(now);
      due.setDate(due.getDate() + (7 - due.getDay()));
      return due.toLocaleDateString();
    }
    return "—";
  };

  const getBalanceDue = (): { amount: number; isLate: boolean } => {
    if (!lease) return { amount: 0, isLate: false };

    const rentAmount = Number(lease.rent_amount || 0);
    const lateFeeAmt = Number((lease as any).late_fee_amount || 0);
    const lateFeeGrace = Number((lease as any).late_fee_days || 5);
    const dueDay = (lease as any).due_day || 1;

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    const graceCutoff = new Date(dueDate);
    graceCutoff.setDate(graceCutoff.getDate() + lateFeeGrace);

    const currentMonth = now.toISOString().slice(0, 7);
    const paidThisMonth = payments.some(
      (p) => p.payment_date?.startsWith(currentMonth) && p.status === "recorded"
    );

    if (paidThisMonth) return { amount: 0, isLate: false };

    const isLate = now > graceCutoff && lateFeeAmt > 0;
    const total = rentAmount + (isLate ? lateFeeAmt : 0);
    return { amount: total, isLate };
  };

  const balance = getBalanceDue();
  const nextDue = getNextDueDate();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-5">
        {/* Unread Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <Bell className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Current Lease Summary */}
        {lease && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className={balance.amount > 0 ? (balance.isLate ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50") : "border-green-200 bg-green-50"}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Balance Due</p>
                  {balance.amount === 0
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-2xl font-bold">
                  {balance.amount === 0 ? "Paid" : `$${balance.amount.toFixed(2)}`}
                </p>
                {balance.isLate && (
                  <p className="text-xs text-red-600 mt-1">Includes late fee</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold">${Number(lease.rent_amount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">{lease.payment_frequency || "monthly"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Next Due Date</p>
                <p className="text-xl font-bold">{nextDue}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lease.units?.unit_name} · {lease.units?.properties?.name}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pay Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Payment History</h1>
            <p className="text-muted-foreground text-sm mt-1">All recorded payments for your account.</p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <a
              href="https://enroll.zellepay.com/qr-codes?data=ewogICJ0b2tlbiI6ICJEZXN0aW55QENibGFrZUVudC5jb20iLAogICJhY3Rpb24iOiAicGF5bWVudCIsCiAgIm5hbWUiOiAiQy4gQmxha2UgRW50ZXJwcmlzZSIKfQ=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <CreditCard className="w-4 h-4 mr-1" /> Pay via Zelle
            </a>
          </Button>
        </div>

        {/* Payment History Table */}
        <Card>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No payments recorded yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const lateFee = Number((p as any).late_fee || 0);
                    const isLate = p.status === "late";
                    return (
                      <TableRow key={p.id} className={isLate ? "bg-red-50" : ""}>
                        <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${Number(p.amount).toFixed(2)}</TableCell>
                        <TableCell className="text-sm">
                          {lateFee > 0 ? (
                            <span className="text-red-600">+${lateFee.toFixed(2)}</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-sm capitalize">{p.payment_method?.replace("_", " ") || "—"}</TableCell>
                        <TableCell className="text-sm">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${isLate ? "border-red-300 text-red-700" : p.status === "recorded" ? "border-green-300 text-green-700" : ""}`}
                          >
                            {p.status === "recorded" ? "Paid" : p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.notes || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default ResidentPayments;
