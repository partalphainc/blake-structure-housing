import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const AdminProperties = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", property_type: "residential", total_units: "1" });

  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addProperty = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("properties").insert({
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        property_type: form.property_type,
        total_units: parseInt(form.total_units) || 1,
        owner_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setOpen(false);
      setForm({ name: "", address: "", city: "", state: "", zip: "", property_type: "residential", total_units: "1" });
      toast({ title: "Property added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Properties</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Plus className="w-4 h-4 mr-2" />Add Property</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addProperty.mutate(); }} className="space-y-3">
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
              <Button type="submit" variant="cta" className="w-full" disabled={addProperty.isPending}>
                {addProperty.isPending ? "Adding..." : "Add Property"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {properties?.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{p.address}, {p.city} {p.state} {p.zip}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Type: {p.property_type}</span>
                <span>Units: {p.total_units}</span>
                <span>Status: {p.status}</span>
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
