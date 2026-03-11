import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const STATUS_FILTER_OPTIONS = ["all", "recorded", "pending", "late"];

const AdminPayments = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    lease_id: "",
    tenant_id: "",
    amount: "",
    payment_date: "",
    due_date: "",
    payment_method: "cash",
    late_fee: "0",
    notes: "",
    status: "recorded",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: leases } = useQuery({
    queryKey: ["admin-leases-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("leases")
        .select("id, tenant_id, rent_amount, units(unit_name)")
        .eq("status", "active");
      return data || [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, leases(units(unit_name), rent_amount)")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Summary stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthPayments = payments?.filter((p: any) => p.payment_date?.startsWith(currentMonth)) || [];
  const totalCollected = thisMonthPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const totalLateFees = thisMonthPayments.reduce((sum: number, p: any) => sum + Number((p as any).late_fee || 0), 0);
  const lateCount = payments?.filter((p: any) => p.status === "late").length || 0;

  const isOverdue = (p: any) => {
    if (!p.due_date || p.status === "recorded") return false;
    return new Date(p.due_date) < new Date();
  };

  const filteredPayments = payments?.filter((p: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "late") return p.status === "late" || isOverdue(p);
    return p.status === statusFilter;
  });

  const recordPayment = useMutation({
    mutationFn: async () => {
      let receipt_url: string | null = null;

      if (receiptFile) {
        const ext = receiptFile.name.split(".").pop();
        const path = `${form.tenant_id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("receipts").upload(path, receiptFile);
        if (uploadError) throw uploadError;
        const { data: signedData, error: signedError } = await supabase.storage
          .from("receipts")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signedError) throw signedError;
        receipt_url = signedData.signedUrl;
      }

      const { error } = await supabase.from("payments").insert({
        lease_id: form.lease_id,
        tenant_id: form.tenant_id,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date,
        due_date: form.due_date || null,
        payment_method: form.payment_method,
        notes: form.notes || null,
        status: form.status,
        recorded_by: user!.id,
        receipt_url,
        ...(parseFloat(form.late_fee) > 0 ? { late_fee: parseFloat(form.late_fee) } : {}),
      } as any);
      if (error) throw error;

      await (supabase as any).from("activity_log").insert({
        actor_type: "admin",
        actor_id: user!.id,
        action: "Recorded payment",
        entity_type: "payment",
        metadata: { amount: form.amount, tenant_id: form.tenant_id, late_fee: form.late_fee },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      setOpen(false);
      setForm({ lease_id: "", tenant_id: "", amount: "", payment_date: "", due_date: "", payment_method: "cash", late_fee: "0", notes: "", status: "recorded" });
      setReceiptFile(null);
      toast({ title: "Payment recorded" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("payments").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleLeaseSelect = (leaseId: string) => {
    const lease = leases?.find((l: any) => l.id === leaseId);
    setForm({ ...form, lease_id: leaseId, tenant_id: lease?.tenant_id || "", amount: String(lease?.rent_amount || "") });
  };

  const getStatusBadge = (p: any) => {
    if (p.status === "late" || isOverdue(p)) {
      return <Badge className="bg-red-100 text-red-800 text-xs">Late</Badge>;
    }
    if (p.status === "recorded") {
      return <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{p.status || "pending"}</Badge>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Collected This Month", value: `$${totalCollected.toLocaleString()}`, icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
          { label: "Late Fees This Month", value: `$${totalLateFees.toLocaleString()}`, icon: <AlertTriangle className="w-4 h-4 text-yellow-600" /> },
          { label: "Late Payments", value: lateCount, icon: <Clock className="w-4 h-4 text-red-600" /> },
          { label: "Total Records", value: payments?.length || 0, icon: <DollarSign className="w-4 h-4 text-primary" /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {s.icon}
              </div>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-bold">Payments</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="cta" size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); recordPayment.mutate(); }} className="space-y-3">
                <div>
                  <Label>Lease</Label>
                  <Select value={form.lease_id} onValueChange={handleLeaseSelect}>
                    <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
                    <SelectContent>
                      {leases?.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.units?.unit_name} – ${l.rent_amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Amount ($)</Label>
                    <Input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div>
                    <Label>Late Fee ($)</Label>
                    <Input type="number" step="0.01" min="0" value={form.late_fee} onChange={(e) => setForm({ ...form, late_fee: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Payment Date</Label>
                    <Input type="date" required value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Method</Label>
                    <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="money_order">Money Order</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recorded">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
                </div>

                <div>
                  <Label>Receipt (optional)</Label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                </div>

                <Button type="submit" variant="cta" className="w-full" disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment List */}
      <div className="grid gap-3">
        {filteredPayments?.map((p: any) => {
          const overdue = isOverdue(p);
          const lateFee = Number((p as any).late_fee || 0);
          return (
            <Card key={p.id} className={overdue || p.status === "late" ? "border-red-200" : ""}>
              <CardContent className="py-3 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.leases?.units?.unit_name || "—"}</span>
                      {getStatusBadge(p)}
                      {lateFee > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">+${lateFee} late fee</Badge>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">${Number(p.amount).toFixed(2)}</span>
                      <span>Paid: {p.payment_date}</span>
                      {p.due_date && <span>Due: {p.due_date}</span>}
                      <span className="capitalize">{p.payment_method?.replace("_", " ")}</span>
                      {p.receipt_url && (
                        <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-primary underline">
                          Receipt
                        </a>
                      )}
                    </div>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                  </div>

                  {/* Quick status update */}
                  {p.status !== "recorded" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "recorded" })}
                    >
                      Mark Paid
                    </Button>
                  )}
                  {p.status === "recorded" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-red-600 border-red-200"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "late" })}
                    >
                      Mark Late
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredPayments?.length === 0 && (
          <p className="text-muted-foreground text-sm">No payments match the selected filter.</p>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminPayments;
