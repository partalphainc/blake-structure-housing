import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, CheckCircle, XCircle, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
};

const AdminApplications = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: units } = useQuery({
    queryKey: ["units-for-apps"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("units").select("id, unit_name, properties(name)").is("deleted_at", null);
      return data || [];
    },
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await (supabase as any).from("applications").update({ status, ...(notes !== undefined ? { notes } : {}) }).eq("id", id);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        actor_id: user!.id,
        actor_type: "admin",
        action: `Application ${status}`,
        entity_type: "application",
        entity_id: id,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setSelectedApp(null);
      toast({ title: "Application updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const getUnitName = (unitId: string) => {
    const u = units?.find((u: any) => u.id === unitId);
    return u ? `${u.unit_name} – ${(u as any).properties?.name}` : "—";
  };

  const filtered = applications?.filter((a: any) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" /> Applications
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-6 h-8 text-xs w-40" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="approved" className="text-xs">Approved</SelectItem>
              <SelectItem value="denied" className="text-xs">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered?.map((app: any) => (
          <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedApp(app); setNoteText(app.notes || ""); }}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{app.full_name}</p>
                  <p className="text-xs text-muted-foreground">{app.email} · {app.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Unit: {getUnitName(app.unit_id)}</p>
                  {app.income && <p className="text-xs text-muted-foreground">Income: ${Number(app.income).toLocaleString()}/yr</p>}
                </div>
                <div className="text-right shrink-0">
                  <Badge className={`text-xs ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-800"}`}>
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-muted-foreground text-sm">No applications found.</p>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application — {selectedApp?.full_name}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-xs text-muted-foreground">Email</p><p>{selectedApp.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p>{selectedApp.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Unit Applied</p><p>{getUnitName(selectedApp.unit_id)}</p></div>
                <div><p className="text-xs text-muted-foreground">Income</p><p>{selectedApp.income ? `$${Number(selectedApp.income).toLocaleString()}/yr` : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Employment</p><p>{selectedApp.employment || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Background Check</p><p>{selectedApp.background_consent ? "Consented" : "Not consented"}</p></div>
              </div>
              <div>
                <Label className="text-xs">Internal Notes</Label>
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add notes..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                  onClick={() => updateApplication.mutate({ id: selectedApp.id, status: "approved", notes: noteText })}
                  disabled={updateApplication.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => updateApplication.mutate({ id: selectedApp.id, status: "denied", notes: noteText })}
                  disabled={updateApplication.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Deny
                </Button>
              </div>
              {noteText !== selectedApp.notes && (
                <Button variant="outline" size="sm" className="w-full text-xs"
                  onClick={() => updateApplication.mutate({ id: selectedApp.id, status: selectedApp.status, notes: noteText })}
                >
                  Save Notes Only
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default AdminApplications;
