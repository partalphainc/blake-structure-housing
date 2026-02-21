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

const AdminLeases = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", unit_id: "", rent_amount: "", start_date: "", end_date: "" });

  const { data: units } = useQuery({
    queryKey: ["admin-units-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("units").select("id, unit_name, properties(name)");
      return data || [];
    },
  });

  const { data: leases } = useQuery({
    queryKey: ["admin-leases"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("leases").select("*, units(unit_name, properties(name))").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leases"] });
      setOpen(false);
      setForm({ tenant_id: "", unit_id: "", rent_amount: "", start_date: "", end_date: "" });
      toast({ title: "Lease created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Leases</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Plus className="w-4 h-4 mr-2" />Add Lease</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Lease</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addLease.mutate(); }} className="space-y-3">
              <div><Label>Tenant User ID</Label><Input required placeholder="UUID of the tenant" value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit_id} onValueChange={(v) => setForm({ ...form, unit_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units?.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.unit_name} – {u.properties?.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Rent Amount</Label><Input type="number" required value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Start Date</Label><Input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <Button type="submit" variant="cta" className="w-full" disabled={addLease.isPending}>
                {addLease.isPending ? "Creating..." : "Create Lease"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {leases?.map((l: any) => (
          <Card key={l.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{l.units?.unit_name} – {l.units?.properties?.name}</CardTitle>
              <Badge variant={l.status === "active" ? "default" : "secondary"}>{l.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Rent: ${l.rent_amount}</span>
                <span>From: {l.start_date}</span>
                {l.end_date && <span>To: {l.end_date}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {leases?.length === 0 && <p className="text-muted-foreground text-sm">No leases yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminLeases;
