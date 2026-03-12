import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { adminNav } from "./AdminDashboard";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Phone, Mail, UserPlus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = [
  { value: "new", label: "New Lead", color: "border-blue-400/40 text-blue-400" },
  { value: "contacted", label: "Contacted", color: "border-yellow-400/40 text-yellow-400" },
  { value: "toured", label: "Toured", color: "border-purple-400/40 text-purple-400" },
  { value: "applied", label: "Applied", color: "border-orange-400/40 text-orange-400" },
  { value: "converted", label: "Converted", color: "border-green-400/40 text-green-400" },
  { value: "lost", label: "Lost", color: "border-muted text-muted-foreground" },
];

const SOURCES = ["website", "referral", "social media", "walk-in", "phone", "other"];

const emptyForm = { full_name: "", email: "", phone: "", source: "website", status: "new", interested_in: "", notes: "" };

const AdminCRM = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: leads } = useQuery({
    queryKey: ["crm-leads"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_leads")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const saveLead = useMutation({
    mutationFn: async () => {
      if (editing) {
        await (supabase as any).from("crm_leads").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
      } else {
        await (supabase as any).from("crm_leads").insert(form);
      }
    },
    onSuccess: () => {
      toast({ title: editing ? "Lead updated" : "Lead added" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    },
    onError: () => toast({ title: "Error saving lead", variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await (supabase as any).from("crm_leads").update({ status, updated_at: new Date().toISOString(), ...(status === "contacted" ? { last_contacted_at: new Date().toISOString() } : {}) }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-leads"] }),
  });

  const openEdit = (lead: any) => {
    setEditing(lead);
    setForm({ full_name: lead.full_name, email: lead.email || "", phone: lead.phone || "", source: lead.source || "website", status: lead.status || "new", interested_in: lead.interested_in || "", notes: lead.notes || "" });
    setDialogOpen(true);
  };

  const filteredLeads = leads?.filter((l: any) => {
    const matchesSearch = !search || l.full_name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts: Record<string, number> = {};
  STATUSES.forEach(s => { counts[s.value] = leads?.filter((l: any) => l.status === s.value).length || 0; });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-serif font-bold">CRM — Leads & Prospects</h1>
        <Button variant="cta" onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {STATUSES.map(s => (
          <Card key={s.value} className={`cursor-pointer hover:border-primary/30 transition-colors ${filterStatus === s.value ? "border-primary/50" : ""}`}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{counts[s.value]}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Leads table */}
      <Card>
        <CardContent className="p-0">
          {!filteredLeads?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No leads yet. Add your first prospect.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLeads.map((lead: any) => {
                const status = STATUSES.find(s => s.value === lead.status);
                return (
                  <div key={lead.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{lead.full_name}</p>
                        {status && <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>}
                        <Badge variant="outline" className="text-[10px] capitalize">{lead.source}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {lead.email && <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</a>}
                        {lead.phone && <a href={`tel:${lead.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</a>}
                        {lead.interested_in && <span className="text-xs text-muted-foreground">Interested: {lead.interested_in}</span>}
                      </div>
                      {lead.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lead.notes}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={lead.status} onValueChange={(v) => updateStatus.mutate({ id: lead.id, status: v })}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(lead)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Lead" : "Add New Lead"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Interested In (unit/property)</Label><Input value={form.interested_in} onChange={e => setForm(f => ({ ...f, interested_in: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="cta" className="flex-1" onClick={() => saveLead.mutate()} disabled={!form.full_name || saveLead.isPending}>
                {editing ? "Save Changes" : "Add Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default AdminCRM;
