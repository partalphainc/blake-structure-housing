import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminTenants = () => {
  const { user, loading, signOut } = useAuth("admin");
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [deletingTenant, setDeletingTenant] = useState<any>(null);
  const [formData, setFormData] = useState({ full_name: "", phone: "", email: "", status: "active" });
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all users with 'resident' role
  const { data: tenants } = useQuery({
    queryKey: ["admin-tenants"],
    enabled: !!user,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "resident");
      if (!roles?.length) return [];
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return profiles || [];
    },
  });

  const selectedTenant = tenants?.find((t: any) => t.user_id === selectedTenantId);

  // Detail queries
  const { data: tenantPayments } = useQuery({
    queryKey: ["admin-tenant-payments", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*, leases(units(unit_name))").eq("tenant_id", selectedTenantId!).order("payment_date", { ascending: false });
      return data || [];
    },
  });

  const { data: tenantDocuments } = useQuery({
    queryKey: ["admin-tenant-documents", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("owner_type", "tenant").eq("owner_id", selectedTenantId!).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: tenantMaintenance } = useQuery({
    queryKey: ["admin-tenant-maintenance", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_requests").select("*").eq("tenant_id", selectedTenantId!).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: tenantLeases } = useQuery({
    queryKey: ["admin-tenant-leases", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const { data } = await supabase.from("leases").select("*, units(unit_name)").eq("tenant_id", selectedTenantId!);
      return data || [];
    },
  });

  const filtered = tenants?.filter((t: any) =>
    (t.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.phone || "").includes(search)
  );

  const handleAddTenant = async () => {
    setIsSaving(true);
    try {
      // Create user via admin signup — admin creates the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: "TempPass123!", // Temporary password, user resets via email
        options: { data: { full_name: formData.full_name, role: "resident" } },
      });
      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Update profile phone
        await supabase.from("profiles").update({ phone: formData.phone }).eq("user_id", signUpData.user.id);
      }

      toast({ title: "Tenant added", description: `${formData.full_name} has been added. They'll need to verify their email and reset their password.` });
      setAddOpen(false);
      setFormData({ full_name: "", phone: "", email: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTenant = async () => {
    if (!editingTenant) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: formData.full_name,
        phone: formData.phone,
      }).eq("user_id", editingTenant.user_id);
      if (error) throw error;
      toast({ title: "Tenant updated" });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;
    setIsSaving(true);
    try {
      // Remove role (effectively removes tenant access)
      const { error } = await supabase.from("user_roles").delete().eq("user_id", deletingTenant.user_id).eq("role", "resident");
      if (error) throw error;
      toast({ title: "Tenant removed", description: `${deletingTenant.full_name || "Tenant"} access has been revoked.` });
      setDeleteOpen(false);
      setDeletingTenant(null);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setFormData({ full_name: tenant.full_name || "", phone: tenant.phone || "", email: "", status: "active" });
    setEditOpen(true);
  };

  const openDelete = (tenant: any) => {
    setDeletingTenant(tenant);
    setDeleteOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  // Detail view
  if (selectedTenantId && selectedTenant) {
    return (
      <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedTenantId(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-2xl font-serif font-bold">{selectedTenant.full_name || "Unnamed Tenant"}</h1>
        </div>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <p><strong>Name:</strong> {selectedTenant.full_name || "—"}</p>
                <p><strong>Phone:</strong> {selectedTenant.phone || "—"}</p>
                <p><strong>User ID:</strong> <span className="text-xs text-muted-foreground">{selectedTenant.user_id}</span></p>
                {tenantLeases?.map((l: any) => (
                  <div key={l.id} className="border rounded p-3 mt-2">
                    <p className="font-medium">{l.units?.unit_name}</p>
                    <p className="text-sm text-muted-foreground">Rent: ${l.rent_amount} · Status: {l.status} · {l.start_date} → {l.end_date || "ongoing"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Unit</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {tenantPayments?.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.payment_date}</TableCell>
                    <TableCell>{p.leases?.units?.unit_name || "—"}</TableCell>
                    <TableCell>${p.amount}</TableCell>
                    <TableCell>{p.payment_method}</TableCell>
                    <TableCell><Badge>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {!tenantPayments?.length && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No payments</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="documents">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Uploaded</TableHead></TableRow></TableHeader>
              <TableBody>
                {tenantDocuments?.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell><a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary underline">{d.file_name}</a></TableCell>
                    <TableCell>{d.category || "—"}</TableCell>
                    <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!tenantDocuments?.length && <TableRow><TableCell colSpan={3} className="text-muted-foreground">No documents</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="maintenance">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
              <TableBody>
                {tenantMaintenance?.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.title}</TableCell>
                    <TableCell><Badge>{m.status}</Badge></TableCell>
                    <TableCell>{m.priority}</TableCell>
                    <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!tenantMaintenance?.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground">No requests</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </PortalLayout>
    );
  }

  // List view
  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      {/* Add Tenant Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>Create a new resident account. They will receive an email to verify and set their password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tenant@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="cta" onClick={handleAddTenant} disabled={isSaving || !formData.full_name || !formData.email}>
              {isSaving ? "Adding..." : "Add Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="cta" onClick={handleEditTenant} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingTenant?.full_name || "this tenant"}</strong>? This will revoke their resident portal access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTenant} disabled={isSaving}>
              {isSaving ? "Removing..." : "Remove Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-serif font-bold">Tenants</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tenants..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="cta" size="sm" onClick={() => { setFormData({ full_name: "", phone: "", email: "", status: "active" }); setAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Tenant
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered?.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium cursor-pointer" onClick={() => setSelectedTenantId(t.user_id)}>{t.full_name || "Unnamed"}</TableCell>
              <TableCell>{t.phone || "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTenantId(t.user_id)} title="View"><Search className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openDelete(t)} title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!filtered?.length && <TableRow><TableCell colSpan={3} className="text-muted-foreground">No tenants found</TableCell></TableRow>}
        </TableBody>
      </Table>
    </PortalLayout>
  );
};

export default AdminTenants;
