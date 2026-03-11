import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  rent_reminder: "Rent Reminder",
  announcement: "Announcement",
  maintenance: "Maintenance Notice",
  general: "General",
};

const TYPE_COLORS: Record<string, string> = {
  rent_reminder: "bg-yellow-100 text-yellow-800",
  announcement: "bg-blue-100 text-blue-800",
  maintenance: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

const AdminNotifications = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    recipient: "all",
    title: "",
    message: "",
    type: "rent_reminder",
  });

  // Load all residents for recipient dropdown
  const { data: tenants } = useQuery({
    queryKey: ["admin-tenants-for-notif"],
    enabled: !!user,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "resident");
      if (!roles?.length) return [];
      const ids = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      return profiles || [];
    },
  });

  // Load sent notifications
  const { data: sent } = useQuery({
    queryKey: ["admin-notifications"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const sendNotification = useMutation({
    mutationFn: async () => {
      if (!form.title.trim() || !form.message.trim()) throw new Error("Title and message are required");

      let recipients: string[] = [];

      if (form.recipient === "all") {
        recipients = (tenants || []).map((t: any) => t.user_id);
      } else {
        recipients = [form.recipient];
      }

      if (!recipients.length) throw new Error("No recipients found");

      const inserts = recipients.map((uid) => ({
        user_id: uid,
        title: form.title,
        message: form.message,
        type: form.type,
        created_by: user!.id,
      }));

      const { error } = await (supabase as any).from("notifications").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setForm({ recipient: "all", title: "", message: "", type: "rent_reminder" });
      toast({ title: "Notification sent" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const prefillRentReminder = () => {
    setForm({
      ...form,
      type: "rent_reminder",
      title: "Rent Payment Reminder",
      message: `This is a friendly reminder that your rent payment is due. Please submit your payment at your earliest convenience to avoid any late fees. If you have already paid, please disregard this message.\n\nThank you,\nC. Blake Enterprise`,
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <h1 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" /> Notifications
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4" /> Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendNotification.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <Label>Recipient</Label>
                <Select value={form.recipient} onValueChange={(v) => setForm({ ...form, recipient: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Users className="w-3 h-3" /> All Tenants ({tenants?.length || 0})
                      </span>
                    </SelectItem>
                    {tenants?.map((t: any) => (
                      <SelectItem key={t.user_id} value={t.user_id}>
                        {t.full_name || t.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent_reminder">Rent Reminder</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Rent Due Soon"
                  required
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prefillRentReminder}
                  className="text-xs"
                >
                  Use Rent Reminder Template
                </Button>
              </div>

              <Button type="submit" variant="cta" className="w-full" disabled={sendNotification.isPending}>
                {sendNotification.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sent history */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Sent Notifications</h2>
          {!sent || sent.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No notifications sent yet.
              </CardContent>
            </Card>
          ) : (
            sent.map((n: any) => (
              <Card key={n.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    </div>
                    <Badge className={`text-xs shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                      {TYPE_LABELS[n.type] || n.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.created_at).toLocaleString()}
                    {n.read_at && <span className="ml-2 text-green-600">• Read</span>}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminNotifications;
