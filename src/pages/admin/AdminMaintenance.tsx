import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "destructive",
  in_progress: "default",
  resolved: "secondary",
};

const AdminMaintenance = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests } = useQuery({
    queryKey: ["admin-maintenance"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_requests").select("*, units(unit_name, properties(name))").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const update: any = {};
      if (status) {
        update.status = status;
        if (status === "resolved") update.resolved_at = new Date().toISOString();
      }
      if (admin_notes !== undefined) update.admin_notes = admin_notes;
      const { error } = await supabase.from("maintenance_requests").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-maintenance"] });
      toast({ title: "Request updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <h1 className="text-2xl font-serif font-bold mb-6">Maintenance Requests</h1>

      <div className="grid gap-4">
        {requests?.map((r: any) => (
          <MaintenanceCard key={r.id} request={r} onUpdate={updateRequest.mutate} />
        ))}
        {requests?.length === 0 && <p className="text-muted-foreground text-sm">No maintenance requests.</p>}
      </div>
    </PortalLayout>
  );
};

function MaintenanceCard({ request, onUpdate }: { request: any; onUpdate: (v: any) => void }) {
  const [notes, setNotes] = useState(request.admin_notes || "");

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{request.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{request.units?.unit_name} – {request.units?.properties?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={request.priority === "high" ? "destructive" : "outline"}>{request.priority}</Badge>
          <Badge variant={statusColors[request.status] || "secondary"}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{request.description}</p>
        <div className="flex items-center gap-2">
          <Select defaultValue={request.status} onValueChange={(v) => onUpdate({ id: request.id, status: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Textarea placeholder="Admin notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="text-sm" rows={2} />
          <Button variant="outline" size="sm" onClick={() => onUpdate({ id: request.id, admin_notes: notes })}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminMaintenance;
