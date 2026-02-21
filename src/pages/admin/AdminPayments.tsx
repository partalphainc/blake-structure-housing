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
import { Plus } from "lucide-react";

const AdminPayments = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ lease_id: "", tenant_id: "", amount: "", payment_date: "", payment_method: "cash", notes: "" });

  const { data: leases } = useQuery({
    queryKey: ["admin-leases-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("leases").select("id, tenant_id, rent_amount, units(unit_name)").eq("status", "active");
      return data || [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, leases(units(unit_name))").order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const recordPayment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert({
        lease_id: form.lease_id,
        tenant_id: form.tenant_id,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        notes: form.notes || null,
        recorded_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      setOpen(false);
      setForm({ lease_id: "", tenant_id: "", amount: "", payment_date: "", payment_method: "cash", notes: "" });
      toast({ title: "Payment recorded" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleLeaseSelect = (leaseId: string) => {
    const lease = leases?.find((l: any) => l.id === leaseId);
    setForm({ ...form, lease_id: leaseId, tenant_id: lease?.tenant_id || "", amount: String(lease?.rent_amount || "") });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Payments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Plus className="w-4 h-4 mr-2" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); recordPayment.mutate(); }} className="space-y-3">
              <div>
                <Label>Lease</Label>
                <Select value={form.lease_id} onValueChange={handleLeaseSelect}>
                  <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
                  <SelectContent>
                    {leases?.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.units?.unit_name} – ${l.rent_amount}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Amount</Label><Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" required value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></div>
              </div>
              <div><Label>Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" variant="cta" className="w-full" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {payments?.map((p: any) => (
          <Card key={p.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{p.leases?.units?.unit_name || "—"}</CardTitle>
              <Badge>{p.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">${p.amount}</span>
                <span>{p.payment_date}</span>
                <span>{p.payment_method}</span>
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {payments?.length === 0 && <p className="text-muted-foreground text-sm">No payments recorded yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminPayments;
