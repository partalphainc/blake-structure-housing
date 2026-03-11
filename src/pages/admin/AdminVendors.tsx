import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, Mail, Store, Pencil, Trash2 } from "lucide-react";

const TRADE_OPTIONS = ["Plumbing", "Electrical", "HVAC", "Cleaning", "Landscaping", "Painting", "General Maintenance", "Locksmith", "Pest Control", "Other"];

const emptyForm = { name: "", trade: "", phone: "", email: "", address: "", notes: "", status: "active" };

const AdminVendors = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vendors").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const saveVendor = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await (supabase as any).from("vendors").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("vendors").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? "Vendor updated" : "Vendor added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("vendors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast({ title: "Vendor removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (v: any) => {
    setEditingId(v.id);
    setForm({ name: v.name, trade: v.trade, phone: v.phone || "", email: v.email || "", address: v.address || "", notes: v.notes || "", status: v.status || "active" });
    setOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><Store className="w-6 h-6" /> Vendors</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              <Plus className="w-4 h-4 mr-2" />Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveVendor.mutate(); }} className="space-y-3">
              <div><Label>Business Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Trade / Service</Label>
                <Select value={form.trade} onValueChange={(v) => setForm({ ...form, trade: v })}>
                  <SelectTrigger><SelectValue placeholder="Select trade" /></SelectTrigger>
                  <SelectContent>{TRADE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" variant="cta" className="w-full" disabled={saveVendor.isPending}>
                {saveVendor.isPending ? "Saving..." : editingId ? "Update Vendor" : "Add Vendor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {vendors?.map((v: any) => (
          <Card key={v.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{v.name}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">{v.trade}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(v)}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteVendor.mutate(v.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                {v.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {v.phone}</p>}
                {v.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {v.email}</p>}
                {v.address && <p>{v.address}</p>}
                {v.notes && <p className="italic">{v.notes}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!vendors || vendors.length === 0) && <p className="text-muted-foreground text-sm">No vendors added yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminVendors;
