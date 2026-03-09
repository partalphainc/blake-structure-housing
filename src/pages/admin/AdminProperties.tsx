import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { name: "", address: "", city: "", state: "", zip: "", property_type: "residential", total_units: "1", owner_id: "" };

const AdminProperties = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: investors } = useQuery({
    queryKey: ["investor-users"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "investor");
      if (error) throw error;
      const userIds = data.map((r) => r.user_id);
      if (userIds.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      if (pErr) throw pErr;
      return profiles || [];
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveProperty = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        property_type: form.property_type,
        total_units: parseInt(form.total_units) || 1,
        owner_id: form.owner_id || user!.id,
      };
      if (editingId) {
        const { error } = await supabase.from("properties").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? "Property updated" : "Property added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({ title: "Property deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      address: p.address,
      city: p.city || "",
      state: p.state || "",
      zip: p.zip || "",
      property_type: p.property_type || "residential",
      total_units: String(p.total_units || 1),
      owner_id: p.owner_id || "",
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const investorName = (ownerId: string) => {
    const inv = investors?.find((i) => i.user_id === ownerId);
    return inv?.full_name || null;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Properties</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Property</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Property" : "Add Property"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveProperty.mutate(); }} className="space-y-3">
              <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Address</Label><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                <div><Label>ZIP</Label><Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Type</Label><Input value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} /></div>
                <div><Label>Total Units</Label><Input type="number" min="1" value={form.total_units} onChange={(e) => setForm({ ...form, total_units: e.target.value })} /></div>
              </div>
              <div>
                <Label>Owner / Investor</Label>
                <Select value={form.owner_id} onValueChange={(v) => setForm({ ...form, owner_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an investor" /></SelectTrigger>
                  <SelectContent>
                    {investors?.map((inv) => (
                      <SelectItem key={inv.user_id} value={inv.user_id}>
                        {inv.full_name || inv.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="cta" className="w-full" disabled={saveProperty.isPending}>
                {saveProperty.isPending ? "Saving..." : editingId ? "Update Property" : "Add Property"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {properties?.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
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
                        <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this property and cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProperty.mutate(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{p.address}, {p.city} {p.state} {p.zip}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Type: {p.property_type}</span>
                <span>Units: {p.total_units}</span>
                <span>Status: {p.status}</span>
                {investorName(p.owner_id) && <span>Owner: {investorName(p.owner_id)}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {properties?.length === 0 && <p className="text-muted-foreground text-sm">No properties yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminProperties;