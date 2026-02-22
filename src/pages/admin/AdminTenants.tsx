import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";

const AdminTenants = () => {
  const { user, loading, signOut } = useAuth("admin");
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

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

  const { data: tenantActivity } = useQuery({
    queryKey: ["admin-tenant-activity", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const { data } = await (supabase as any).from("activity_log").select("*").eq("actor_id", selectedTenantId!).order("created_at", { ascending: false }).limit(50);
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
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
          <TabsContent value="activity">
            <div className="space-y-2">
              {tenantActivity?.map((a: any) => (
                <div key={a.id} className="border rounded p-3 text-sm">
                  <span className="font-medium">{a.action}</span>
                  {a.entity_type && <span className="text-muted-foreground"> · {a.entity_type}</span>}
                  <span className="text-muted-foreground ml-2">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
              {!tenantActivity?.length && <p className="text-muted-foreground text-sm">No activity recorded</p>}
            </div>
          </TabsContent>
        </Tabs>
      </PortalLayout>
    );
  }

  // List view
  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Tenants</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tenants..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered?.map((t: any) => (
            <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedTenantId(t.user_id)}>
              <TableCell className="font-medium">{t.full_name || "Unnamed"}</TableCell>
              <TableCell>{t.phone || "—"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTenantId(t.user_id); }}>View</Button>
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
