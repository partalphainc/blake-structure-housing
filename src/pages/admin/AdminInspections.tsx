import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardList } from "lucide-react";

const TYPE_OPTIONS = ["move-in", "move-out", "routine", "maintenance"];
const TYPE_COLORS: Record<string, string> = {
  "move-in": "bg-green-100 text-green-800",
  "move-out": "bg-red-100 text-red-800",
  "routine": "bg-blue-100 text-blue-800",
  "maintenance": "bg-orange-100 text-orange-800",
};

const emptyForm = { unit_id: "", property_id: "", type: "routine", inspection_date: new Date().toISOString().slice(0, 10), inspector_name: "", findings: "", notes: "" };

const AdminInspections = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: units } = useQuery({
    queryKey: ["units-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("units").select("id, unit_name, property_id, properties(id, name)").is("deleted_at", null);
      return data || [];
    },
  });

  const { data: inspections } = useQuery({
    queryKey: ["admin-inspections"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("inspections")
        .select("*, units(unit_name, properties(name))")
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addInspection = useMutation({
    mutationFn: async () => {
      const selectedUnit = units?.find((u: any) => u.id === form.unit_id);
      const { error } = await (supabase as any).from("inspections").insert({
        ...form,
        property_id: (selectedUnit as any)?.properties?.id || form.property_id,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inspections"] });
      setOpen(false);
      setForm(emptyForm);
      toast({ title: "Inspection logged" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6" /> Inspections</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(emptyForm); }}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Plus className="w-4 h-4 mr-2" />Log Inspection</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Log Inspection</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addInspection.mutate(); }} className="space-y-3">
              <div>
                <Label>Unit</Label>
                <Select value={form.unit_id} onValueChange={(v) => setForm({ ...form, unit_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units?.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.unit_name} — {(u as any).properties?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("-", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" required value={form.inspection_date} onChange={(e) => setForm({ ...form, inspection_date: e.target.value })} /></div>
              </div>
              <div><Label>Inspector Name</Label><Input required value={form.inspector_name} onChange={(e) => setForm({ ...form, inspector_name: e.target.value })} /></div>
              <div><Label>Findings</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} placeholder="What was found during inspection..." rows={3} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} /></div>
              <Button type="submit" variant="cta" className="w-full" disabled={addInspection.isPending}>{addInspection.isPending ? "Saving..." : "Log Inspection"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {inspections?.map((insp: any) => (
          <Card key={insp.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{insp.units?.unit_name} — {insp.units?.properties?.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(insp.inspection_date).toLocaleDateString()} · {insp.inspector_name}
                  </p>
                </div>
                <Badge className={`text-xs ${TYPE_COLORS[insp.type] || "bg-gray-100 text-gray-800"}`}>{insp.type?.replace("-", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {insp.findings && <p className="text-sm mb-1"><span className="font-medium">Findings:</span> {insp.findings}</p>}
              {insp.notes && <p className="text-sm text-muted-foreground">{insp.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {(!inspections || inspections.length === 0) && <p className="text-muted-foreground text-sm">No inspections logged yet.</p>}
      </div>
    </PortalLayout>
  );
};

export default AdminInspections;
