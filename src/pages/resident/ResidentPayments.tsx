import { useEffect, useState } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("payments").select("*").eq("tenant_id", user.id).order("payment_date", { ascending: false }),
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
    ]).then(([paymentsRes, profileRes]) => {
      setPayments(paymentsRes.data || []);
      setProfile(profileRes.data);
    });
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Payment History</h1>
        <p className="text-muted-foreground text-sm">All recorded payments for your account. Payments are managed externally (Zelle, cash, etc.) and recorded here for your records.</p>

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
                    <TableHead>Method</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{p.payment_method || "—"}</TableCell>
                      <TableCell className="text-sm">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.notes || "—"}</TableCell>
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

export default ResidentPayments;
