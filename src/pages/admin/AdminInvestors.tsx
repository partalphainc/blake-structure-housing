import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";

const AdminInvestors = () => {
  const { user, loading, signOut } = useAuth("admin");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: investors } = useQuery({
    queryKey: ["admin-investors"],
    enabled: !!user,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "investor");
      if (!roles?.length) return [];
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return profiles || [];
    },
  });

  const selected = investors?.find((i: any) => i.user_id === selectedId);

  const { data: investorProperties } = useQuery({
    queryKey: ["admin-investor-properties", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("owner_id", selectedId!);
      return data || [];
    },
  });

  const { data: investorDocuments } = useQuery({
    queryKey: ["admin-investor-documents", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("owner_type", "investor").eq("owner_id", selectedId!).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: investorActivity } = useQuery({
    queryKey: ["admin-investor-activity", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await (supabase as any).from("activity_log").select("*").eq("actor_id", selectedId!).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const filtered = investors?.filter((i: any) =>
    (i.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  if (selectedId && selected) {
    return (
      <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-2xl font-serif font-bold">{selected.full_name || "Unnamed Investor"}</h1>
        </div>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <p><strong>Name:</strong> {selected.full_name || "—"}</p>
                <p><strong>Phone:</strong> {selected.phone || "—"}</p>
                <p><strong>User ID:</strong> <span className="text-xs text-muted-foreground">{selected.user_id}</span></p>
                <h3 className="font-semibold mt-4">Properties</h3>
                {investorProperties?.map((p: any) => (
                  <div key={p.id} className="border rounded p-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.address}, {p.city} {p.state} {p.zip}</p>
                  </div>
                ))}
                {!investorProperties?.length && <p className="text-sm text-muted-foreground">No properties</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Uploaded</TableHead></TableRow></TableHeader>
              <TableBody>
                {investorDocuments?.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell><a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary underline">{d.file_name}</a></TableCell>
                    <TableCell>{d.category || "—"}</TableCell>
                    <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!investorDocuments?.length && <TableRow><TableCell colSpan={3} className="text-muted-foreground">No documents</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="activity">
            <div className="space-y-2">
              {investorActivity?.map((a: any) => (
                <div key={a.id} className="border rounded p-3 text-sm">
                  <span className="font-medium">{a.action}</span>
                  {a.entity_type && <span className="text-muted-foreground"> · {a.entity_type}</span>}
                  <span className="text-muted-foreground ml-2">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
              {!investorActivity?.length && <p className="text-muted-foreground text-sm">No activity recorded</p>}
            </div>
          </TabsContent>
        </Tabs>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Investors</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search investors..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Actions</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {filtered?.map((i: any) => (
            <TableRow key={i.id} className="cursor-pointer" onClick={() => setSelectedId(i.user_id)}>
              <TableCell className="font-medium">{i.full_name || "Unnamed"}</TableCell>
              <TableCell>{i.phone || "—"}</TableCell>
              <TableCell><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(i.user_id); }}>View</Button></TableCell>
            </TableRow>
          ))}
          {!filtered?.length && <TableRow><TableCell colSpan={3} className="text-muted-foreground">No investors found</TableCell></TableRow>}
        </TableBody>
      </Table>
    </PortalLayout>
  );
};

export default AdminInvestors;
