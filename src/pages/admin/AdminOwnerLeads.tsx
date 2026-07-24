import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const STATUSES = ["new", "contacted", "qualified", "closed", "archived"];

const AdminOwnerLeads = () => {
  const { user, loading, signOut } = useAuth("admin");
  const qc = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ["admin-owner-leads"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owner_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("owner_leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-owner-leads"] });
      toast.success("Status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("owner_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-owner-leads"] });
      toast.success("Lead deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Owner Leads</h1>
          <p className="text-sm text-muted-foreground">Rental analysis requests submitted from the site.</p>
        </div>
        <Badge variant="outline">{leads?.length ?? 0} total</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Property Address</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads?.map((l: any) => (
            <TableRow key={l.id}>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="font-medium">{l.full_name}</TableCell>
              <TableCell>{l.property_address}</TableCell>
              <TableCell>{l.contact}</TableCell>
              <TableCell>
                <Select value={l.status} onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v })}>
                  <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { if (confirm("Delete this lead?")) deleteLead.mutate(l.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!leads?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center py-8">
                No owner leads yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </PortalLayout>
  );
};

export default AdminOwnerLeads;
