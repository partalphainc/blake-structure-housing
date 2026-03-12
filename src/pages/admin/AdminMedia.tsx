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
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/VideoPlayer";
import { Play, Plus, Edit2, Trash2, Video } from "lucide-react";

const CATEGORIES = [
  { value: "property_walkthrough", label: "Property Walkthrough" },
  { value: "investor_update", label: "Investor Update" },
  { value: "onboarding", label: "Tenant Onboarding" },
  { value: "training", label: "Training / How-To" },
  { value: "announcement", label: "Announcement" },
  { value: "maintenance", label: "Maintenance Guide" },
  { value: "other", label: "Other" },
];

const VISIBILITY = [
  { value: "admin", label: "Admin Only" },
  { value: "tenant", label: "Tenants" },
  { value: "investor", label: "Investors" },
  { value: "public", label: "Public (All)" },
];

const emptyForm = { title: "", description: "", video_url: "", category: "property_walkthrough", visibility: "admin", property_id: "" };

const AdminMedia = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState<any>(null);
  const [filterCat, setFilterCat] = useState("all");

  const { data: media } = useQuery({
    queryKey: ["admin-media"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("media_items")
        .select("*, properties(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["properties-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id, name").is("deleted_at", null);
      return data || [];
    },
  });

  const saveMedia = useMutation({
    mutationFn: async () => {
      if (editing) {
        await (supabase as any).from("media_items").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
      } else {
        await (supabase as any).from("media_items").insert({ ...form, created_by: user?.id });
      }
    },
    onSuccess: () => {
      toast({ title: editing ? "Media updated" : "Media added" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: () => toast({ title: "Error saving media", variant: "destructive" }),
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("media_items").delete().eq("id", id);
    },
    onSuccess: () => {
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "", video_url: item.video_url, category: item.category, visibility: item.visibility, property_id: item.property_id || "" });
    setDialogOpen(true);
  };

  const filtered = filterCat === "all" ? media : media?.filter((m: any) => m.category === filterCat);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><Video className="w-5 h-5" /> Media Library</h1>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="cta" onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Video
          </Button>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Supported video sources:</p>
        <p>YouTube, Vimeo, direct MP4 links, or Supabase Storage URLs. Paste any video URL to embed it.</p>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">{preview.title}</p>
              <button className="text-white hover:text-primary" onClick={() => setPreview(null)}>✕</button>
            </div>
            <VideoPlayer url={preview.video_url} title={preview.title} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!filtered?.length ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            <Video className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No media yet. Add your first video.</p>
          </div>
        ) : (
          filtered.map((item: any) => {
            const cat = CATEGORIES.find(c => c.value === item.category);
            const vis = VISIBILITY.find(v => v.value === item.visibility);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div
                  className="relative bg-black/80 h-36 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors group"
                  onClick={() => setPreview(item)}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {cat && <Badge variant="outline" className="text-[10px]">{cat.label}</Badge>}
                        {vis && <Badge variant="outline" className="text-[10px] capitalize">{vis.label}</Badge>}
                        {item.properties?.name && <Badge variant="outline" className="text-[10px]">{item.properties.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Edit2 className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMedia.mutate(item.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Media" : "Add Video"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Video URL * (YouTube, Vimeo, or direct link)</Label><Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
            {form.video_url && (
              <div className="rounded-lg overflow-hidden">
                <VideoPlayer url={form.video_url} title={form.title} />
              </div>
            )}
            <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Visible To</Label>
                <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VISIBILITY.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Property (optional)</Label>
              <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger><SelectValue placeholder="All properties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {properties?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="cta" className="flex-1" onClick={() => saveMedia.mutate()} disabled={!form.title || !form.video_url || saveMedia.isPending}>
                {editing ? "Save Changes" : "Add Video"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default AdminMedia;
