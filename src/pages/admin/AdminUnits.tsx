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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { unit_name: "", property_id: "", unit_type: "private_room", rate_monthly: "", rate_weekly: "", deposit: "" };

const AdminUnits = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const saveUnit = useMutation({
    mutationFn: async () => {
      const payload = {
        unit_name: form.unit_name,
        property_id: form.property_id,
        unit_type: form.unit_type,
        rate_monthly: form.rate_monthly ? parseFloat(form.rate_monthly) : null,
        rate_weekly: form.rate_weekly ? parseFloat(form.rate_weekly) : null,
        deposit: form.deposit ? parseFloat(form.deposit) : null,
      };
      if (editingId) {
        const { error } = await supabase.from("units").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("units").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? "Unit updated" : "Unit added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      toast({ title: "Unit deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      unit_name: u.unit_name,
      property_id: u.property_id,
      unit_type: u.unit_type || "private_room",
      rate_monthly: u.rate_monthly ? String(u.rate_monthly) : "",
      rate_weekly: u.rate_weekly ? String(u.rate_weekly) : "",
      deposit: u.deposit ? String(u.deposit) : "",
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Units</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Unit" : "Add Unit"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveUnit.mutate(); }} className="space-y-3">
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
              <Button type="submit" variant="cta" className="w-full" disabled={saveUnit.isPending}>
                {saveUnit.isPending ? "Saving..." : editingId ? "Update Unit" : "Add Unit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {units?.map((u: any) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{u.unit_name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{u.unit_name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this unit. Active leases on this unit may be affected.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUnit.mutate(u.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{u.properties?.name || "Unknown property"}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Type: {u.unit_type}</span>
                {u.rate_monthly && <span>${u.rate_monthly}/mo</span>}
                {u.rate_weekly && <span>${u.rate_weekly}/wk</span>}
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
