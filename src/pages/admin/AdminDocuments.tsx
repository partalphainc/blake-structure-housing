import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload } from "lucide-react";

const AdminDocuments = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", owner_type: "tenant", owner_id: "", visible_to_tenant: false, visible_to_investor: false, notes: "" });
  const [file, setFile] = useState<File | null>(null);

  const { data: documents } = useQuery({
    queryKey: ["admin-documents"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Get owners based on owner_type
  const { data: owners } = useQuery({
    queryKey: ["admin-doc-owners", form.owner_type],
    enabled: !!user,
    queryFn: async () => {
      if (form.owner_type === "tenant" || form.owner_type === "investor") {
        const role = form.owner_type === "tenant" ? "resident" : "investor";
        const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", role);
        if (!roles?.length) return [];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", roles.map((r) => r.user_id));
        return profiles || [];
      }
      if (form.owner_type === "property") {
        const { data } = await supabase.from("properties").select("id, name");
        return data?.map((p) => ({ user_id: p.id, full_name: p.name })) || [];
      }
      return [];
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const ext = file.name.split(".").pop();
      const path = `${form.owner_type}/${form.owner_id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("resident-documents").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: signedData, error: signedError } = await supabase.storage
        .from("resident-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
      if (signedError) throw signedError;

      const { error } = await supabase.from("documents").insert({
        file_name: form.name || file.name,
        file_url: urlData.publicUrl,
        owner_type: form.owner_type,
        owner_id: form.owner_id,
        category: form.category || null,
        visible_to_tenant: form.visible_to_tenant,
        visible_to_investor: form.visible_to_investor,
        uploaded_by: user!.id,
        notes: form.notes || null,
      });
      if (error) throw error;

      // Log activity
      await (supabase as any).from("activity_log").insert({
        actor_type: "admin",
        actor_id: user!.id,
        action: "Uploaded document",
        entity_type: "document",
        metadata: { file_name: form.name || file.name, owner_type: form.owner_type },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      setOpen(false);
      setForm({ name: "", category: "", owner_type: "tenant", owner_id: "", visible_to_tenant: false, visible_to_investor: false, notes: "" });
      setFile(null);
      toast({ title: "Document uploaded" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Documents</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" size="sm"><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); uploadDocument.mutate(); }} className="space-y-3">
              <div><Label>Document Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Lease, ID, Income" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Owner Type</Label>
                  <Select value={form.owner_type} onValueChange={(v) => setForm({ ...form, owner_type: v, owner_id: "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Owner</Label>
                  <Select value={form.owner_id} onValueChange={(v) => setForm({ ...form, owner_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {owners?.map((o: any) => <SelectItem key={o.user_id} value={o.user_id}>{o.full_name || o.user_id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>File</Label>
                <Input type="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.visible_to_tenant} onCheckedChange={(v) => setForm({ ...form, visible_to_tenant: v })} />
                  <Label>Visible to Tenant</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.visible_to_investor} onCheckedChange={(v) => setForm({ ...form, visible_to_investor: v })} />
                  <Label>Visible to Investor</Label>
                </div>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" variant="cta" className="w-full" disabled={uploadDocument.isPending}>
                {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents?.map((d: any) => (
            <TableRow key={d.id}>
              <TableCell><a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary underline">{d.file_name}</a></TableCell>
              <TableCell><Badge variant="outline">{d.owner_type}</Badge></TableCell>
              <TableCell>{d.category || "—"}</TableCell>
              <TableCell className="text-xs">
                {d.visible_to_tenant && <Badge className="mr-1">Tenant</Badge>}
                {d.visible_to_investor && <Badge className="mr-1">Investor</Badge>}
                {!d.visible_to_tenant && !d.visible_to_investor && <span className="text-muted-foreground">Admin only</span>}
              </TableCell>
              <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {!documents?.length && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No documents yet</TableCell></TableRow>}
        </TableBody>
      </Table>
    </PortalLayout>
  );
};

export default AdminDocuments;
