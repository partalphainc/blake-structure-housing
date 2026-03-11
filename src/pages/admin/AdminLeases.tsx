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
import { Plus, FileText } from "lucide-react";

const PAYMENT_FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
];

const AdminLeases = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    tenant_id: "",
    unit_id: "",
    rent_amount: "",
    start_date: "",
    end_date: "",
    payment_frequency: "monthly",
    due_day: "1",
    late_fee_amount: "0",
    late_fee_days: "5",
    notes: "",
  });

  const { data: units } = useQuery({
    queryKey: ["admin-units-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("units").select("id, unit_name, properties(name)").is("deleted_at", null);
      return data || [];
    },
  });

  const { data: tenants } = useQuery({
    queryKey: ["admin-tenants-for-lease"],
    enabled: !!user,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "resident");
      if (!roles?.length) return [];
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      return profiles || [];
    },
  });

  const { data: leases } = useQuery({
    queryKey: ["admin-leases"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("*, units(unit_name, properties(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addLease = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leases").insert({
        tenant_id: form.tenant_id,
        unit_id: form.unit_id,
        rent_amount: parseFloat(form.rent_amount),
        start_date: form.start_date,
        end_date: form.end_date || null,
        payment_frequency: form.payment_frequency,
        status: "active",
        ...(form.due_day ? { due_day: parseInt(form.due_day) } : {}),
        ...(form.late_fee_amount ? { late_fee_amount: parseFloat(form.late_fee_amount) } : {}),
        ...(form.late_fee_days ? { late_fee_days: parseInt(form.late_fee_days) } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leases"] });
      setOpen(false);
      setForm({ tenant_id: "", unit_id: "", rent_amount: "", start_date: "", end_date: "", payment_frequency: "monthly", due_day: "1", late_fee_amount: "0", late_fee_days: "5", notes: "" });
      toast({ title: "Lease created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateLeaseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leases").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leases"] });
      toast({ title: "Lease status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const getTenantName = (tenantId: string) => {
    const t = tenants?.find((t: any) => t.user_id === tenantId);
    return t?.full_name || tenantId.slice(0, 8);
  };

  const isExpired = (lease: any) => {
    if (!lease.end_date) return false;
    return new Date(lease.end_date) < new Date();
  };

  const filteredLeases = leases?.filter((l: any) => {
    if (statusFilter === "all") return true;
    return l.status === statusFilter;
  });

  const getNextDueDate = (lease: any): string => {
    const dueDay = (lease as any).due_day || 1;
    const freq = lease.payment_frequency || "monthly";
    const now = new Date();

    if (freq === "monthly") {
      const due = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (due < now) due.setMonth(due.getMonth() + 1);
      return due.toLocaleDateString();
    }
    return "—";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" /> Leases
        </h1>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="active" className="text-xs">Active</SelectItem>
              <SelectItem value="expired" className="text-xs">Expired</SelectItem>
              <SelectItem value="terminated" className="text-xs">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="cta" size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Lease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Lease</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addLease.mutate(); }} className="space-y-3">
                <div>
                  <Label>Tenant</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm({ ...form, tenant_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                    <SelectContent>
                      {tenants?.map((t: any) => (
                        <SelectItem key={t.user_id} value={t.user_id}>
                          {t.full_name || t.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Unit</Label>
                  <Select value={form.unit_id} onValueChange={(v) => setForm({ ...form, unit_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent>
                      {units?.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.unit_name} – {u.properties?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Rent Amount ($)</Label>
                    <Input type="number" step="0.01" required value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })} />
                  </div>
                  <div>
                    <Label>Payment Frequency</Label>
                    <Select value={form.payment_frequency} onValueChange={(v) => setForm({ ...form, payment_frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_FREQUENCY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>

                <div className="border rounded-md p-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Late Fee Policy</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Due Day</Label>
                      <Input
                        type="number"
                        min="1"
                        max="28"
                        value={form.due_day}
                        onChange={(e) => setForm({ ...form, due_day: e.target.value })}
                        placeholder="1"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">of month</p>
                    </div>
                    <div>
                      <Label className="text-xs">Grace Period</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.late_fee_days}
                        onChange={(e) => setForm({ ...form, late_fee_days: e.target.value })}
                        placeholder="5"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">days</p>
                    </div>
                    <div>
                      <Label className="text-xs">Late Fee ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.late_fee_amount}
                        onChange={(e) => setForm({ ...form, late_fee_amount: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Internal Notes</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional..." />
                </div>

                <Button type="submit" variant="cta" className="w-full" disabled={addLease.isPending}>
                  {addLease.isPending ? "Creating..." : "Create Lease"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredLeases?.map((l: any) => {
          const expired = isExpired(l);
          const lateFeeAmt = (l as any).late_fee_amount || 0;
          const lateFeeGrace = (l as any).late_fee_days || 5;
          const dueDay = (l as any).due_day || 1;

          return (
            <Card key={l.id} className={expired && l.status === "active" ? "border-yellow-200" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {l.units?.unit_name} – {l.units?.properties?.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tenant: {getTenantName(l.tenant_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {expired && l.status === "active" && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Expired</Badge>
                    )}
                    <Badge variant={l.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                      {l.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                  <div>
                    <p className="font-medium text-foreground">${Number(l.rent_amount).toLocaleString()}</p>
                    <p className="capitalize">{l.payment_frequency || "monthly"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{l.start_date}</p>
                    <p>Start</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{l.end_date || "Month-to-Month"}</p>
                    <p>End</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getNextDueDate(l)}</p>
                    <p>Next Due</p>
                  </div>
                </div>

                {(lateFeeAmt > 0 || dueDay !== 1) && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mb-2">
                    Due on day <strong>{dueDay}</strong> · Grace period: <strong>{lateFeeGrace} days</strong>
                    {lateFeeAmt > 0 && <> · Late fee: <strong>${lateFeeAmt}</strong></>}
                  </div>
                )}

                {(l as any).notes && (
                  <p className="text-xs text-muted-foreground italic">{(l as any).notes}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {l.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateLeaseStatus.mutate({ id: l.id, status: "expired" })}
                      >
                        Mark Expired
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-red-600 border-red-200"
                        onClick={() => updateLeaseStatus.mutate({ id: l.id, status: "terminated" })}
                      >
                        Terminate
                      </Button>
                    </>
                  )}
                  {l.status !== "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => updateLeaseStatus.mutate({ id: l.id, status: "active" })}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredLeases?.length === 0 && (
          <p className="text-muted-foreground text-sm">No leases found.</p>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminLeases;
