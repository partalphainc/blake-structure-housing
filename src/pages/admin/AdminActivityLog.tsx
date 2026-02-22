import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

const AdminActivityLog = () => {
  const { user, loading, signOut } = useAuth("admin");
  const [search, setSearch] = useState("");

  const { data: logs } = useQuery({
    queryKey: ["admin-activity-log"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const filtered = logs?.filter((l: any) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.entity_type || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.actor_type || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Activity Log</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search activity..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered?.map((l: any) => (
            <TableRow key={l.id}>
              <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
              <TableCell><Badge variant="outline">{l.actor_type}</Badge></TableCell>
              <TableCell>{l.action}</TableCell>
              <TableCell>{l.entity_type || "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{l.metadata ? JSON.stringify(l.metadata) : "—"}</TableCell>
            </TableRow>
          ))}
          {!filtered?.length && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No activity logged</TableCell></TableRow>}
        </TableBody>
      </Table>
    </PortalLayout>
  );
};

export default AdminActivityLog;
