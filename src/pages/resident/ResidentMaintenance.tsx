import { useEffect, useState, useRef } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard, Plus, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentMaintenance = () => {
  const { user, loading, signOut } = useAuth("resident");
  const [requests, setRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    const [reqRes, profileRes] = await Promise.all([
      supabase.from("maintenance_requests").select("*").eq("tenant_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
    ]);
    setRequests(reqRes.data || []);
    setProfile(profileRes.data);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      // Upload photos if any
      const imageUrls: string[] = [];
      for (const photo of photos) {
        const filePath = `${user.id}/${Date.now()}_${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("maintenance-images")
          .upload(filePath, photo);
        if (uploadError) throw uploadError;

        // Create signed URL for private bucket
        const { data: signedData, error: signedError } = await supabase.storage
          .from("maintenance-images")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
        if (signedError) throw signedError;
        imageUrls.push(signedData.signedUrl);
      }

      const { error } = await supabase.from("maintenance_requests").insert({
        tenant_id: user.id,
        title,
        description,
        priority,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      });
      if (error) throw error;
      toast({ title: "Request submitted", description: "We'll address your maintenance request as soon as possible." });
      setTitle(""); setDescription(""); setPriority("medium"); setPhotos([]); setShowForm(false);
      if (fileRef.current) fileRef.current.value = "";
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  const statusColor = (s: string) => {
    switch (s) {
      case "submitted": return "border-yellow-500/30 text-yellow-400";
      case "in_progress": return "border-blue-500/30 text-blue-400";
      case "resolved": return "border-green-500/30 text-green-400";
      default: return "";
    }
  };

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Maintenance Requests</h1>
          <Button variant="cta" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> New Request
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base">Submit a Maintenance Request</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Leaking faucet" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the issue in detail..." />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Photos (optional)
                  </Label>
                  <Input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                  />
                  <p className="text-xs text-muted-foreground">Upload photos of the issue. Max 5 images.</p>
                  {photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {photos.map((p, i) => (
                        <div key={i} className="text-xs bg-muted px-2 py-1 rounded">{p.name}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="cta" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {requests.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No maintenance requests yet.</CardContent></Card>
          ) : (
            requests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{r.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={`text-xs ${statusColor(r.status)}`}>{r.status}</Badge>
                      <Badge variant="outline" className="text-xs">{r.priority}</Badge>
                    </div>
                  </div>
                  {r.image_urls && r.image_urls.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {r.image_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Issue photo ${i + 1}`} className="w-20 h-20 object-cover rounded border border-border" />
                        </a>
                      ))}
                    </div>
                  )}
                  {r.admin_notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground"><strong>Admin note:</strong> {r.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default ResidentMaintenance;
