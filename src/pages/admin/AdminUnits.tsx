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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const AdminUnits = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ unit_name: "", property_id: "", unit_type: "private_room", rate_monthly: "", rate_weekly: "", deposit: "" });

  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id, name");
      return data || [];
    },
  });

  const { data: units } = useQuery({
    queryKey: ["admin-units"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*, properties(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addUnit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("units").insert({
        unit_name: form.unit_name,
        property_id: form.property_id,
        unit_type: form.unit_type,
        rate_monthly: form.rate_monthly ? parseFloat(form.rate_monthly) : null,
        rate_weekly: form.rate_weekly ? parseFloat(form.rate_weekly) : null,
        deposit: form.deposit ? parseFloat(form.deposit) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      setOpen(false);
      setForm({ unit_name: "", property_id: "", unit_type: "private_room", rate_monthly: "", rate_weekly: "", deposit: "" });
      toast({ title: "Unit added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Units</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Plus className="w-4 h-4 mr-2" />Add Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addUnit.mutate(); }} className="space-y-3">
              <div><Label>Unit Name</Label><Input required value={form.unit_name} onChange={(e) => setForm({ ...form, unit_name: e.target.value })} /></div>
              <div>
                <Label>Property</Label>
                <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                  <SelectContent>
                    {properties?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Unit Type</Label><Input value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Monthly Rate</Label><Input type="number" value={form.rate_monthly} onChange={(e) => setForm({ ...form, rate_monthly: e.target.value })} /></div>
                <div><Label>Weekly Rate</Label><Input type="number" value={form.rate_weekly} onChange={(e) => setForm({ ...form, rate_weekly: e.target.value })} /></div>
                <div><Label>Deposit</Label><Input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
              </div>
              <Button type="submit" variant="cta" className="w-full" disabled={addUnit.isPending}>
                {addUnit.isPending ? "Adding..." : "Add Unit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {units?.map((u: any) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{u.unit_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{u.properties?.name || "Unknown property"}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Type: {u.unit_type}</span>
                {u.rate_monthly && <span>${u.rate_monthly}/mo</span>}
                <span>Status: {u.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {units?.length === 0 && <p className="text-muted-foreground text-sm">No units yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminUnits;
