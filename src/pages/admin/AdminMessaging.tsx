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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Users, User, MessageSquare, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TEMPLATES = [
  { key: "rent_reminder", label: "Rent Reminder", subject: "Rent Reminder", body: "Hi, this is a friendly reminder that your rent is due. Please submit your payment at your earliest convenience. Thank you." },
  { key: "maintenance_update", label: "Maintenance Update", subject: "Maintenance Request Update", body: "Your maintenance request has been received and is being processed. We will keep you updated on the status." },
  { key: "move_in", label: "Move-In Reminder", subject: "Move-In Details", body: "Welcome! Your move-in date is approaching. Please contact us to confirm your move-in time and to go over any remaining items." },
  { key: "payment_confirm", label: "Payment Confirmation", subject: "Payment Received", body: "We have received your payment. Thank you for keeping your account current." },
  { key: "lease_reminder", label: "Lease Renewal", subject: "Lease Renewal Reminder", body: "Your lease agreement is approaching its end date. Please contact us to discuss renewal options." },
  { key: "general", label: "General Update", subject: "Update from Management", body: "" },
];

const AdminMessaging = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [recipientType, setRecipientType] = useState<"individual_tenant" | "individual_investor" | "all_tenants" | "all_investors">("all_tenants");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { data: tenants } = useQuery({
    queryKey: ["messaging-tenants"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name");
      return data || [];
    },
  });

  const { data: investors } = useQuery({
    queryKey: ["messaging-investors"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, profiles(full_name)")
        .eq("role", "investor");
      return data || [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: thread } = useQuery({
    queryKey: ["message-thread", selectedThread],
    enabled: !!selectedThread,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(`id.eq.${selectedThread},parent_id.eq.${selectedThread}`)
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const isBulk = recipientType === "all_tenants" || recipientType === "all_investors";
      await (supabase as any).from("messages").insert({
        sender_id: user?.id,
        sender_type: "admin",
        recipient_id: isBulk ? null : recipientId || null,
        recipient_type: recipientType,
        subject,
        body,
      });
    },
    onSuccess: () => {
      toast({ title: "Message sent!" });
      setBody("");
      setSubject("");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
    onError: () => toast({ title: "Failed to send", variant: "destructive" }),
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const parent = thread?.[0];
      await (supabase as any).from("messages").insert({
        sender_id: user?.id,
        sender_type: "admin",
        recipient_id: parent?.sender_id,
        recipient_type: parent?.sender_type,
        body: replyBody,
        parent_id: selectedThread,
      });
    },
    onSuccess: () => {
      toast({ title: "Reply sent!" });
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: ["message-thread", selectedThread] });
    },
  });

  const applyTemplate = (key: string) => {
    const tpl = TEMPLATES.find(t => t.key === key);
    if (tpl) { setSubject(tpl.subject); setBody(tpl.body); }
  };

  const inboundMessages = messages?.filter((m: any) => m.sender_type !== "admin") || [];
  const sentMessages = messages?.filter((m: any) => m.sender_type === "admin") || [];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email}>
      <h1 className="text-2xl font-serif font-bold mb-6">Communication Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="w-4 h-4" /> Compose Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Send To</Label>
                  <Select value={recipientType} onValueChange={(v) => setRecipientType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_tenants">All Tenants (Bulk)</SelectItem>
                      <SelectItem value="all_investors">All Investors (Bulk)</SelectItem>
                      <SelectItem value="individual_tenant">Individual Tenant</SelectItem>
                      <SelectItem value="individual_investor">Individual Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(recipientType === "individual_tenant" || recipientType === "individual_investor") && (
                  <div className="space-y-2">
                    <Label>Select {recipientType === "individual_tenant" ? "Tenant" : "Investor"}</Label>
                    <Select value={recipientId} onValueChange={setRecipientId}>
                      <SelectTrigger><SelectValue placeholder="Choose person" /></SelectTrigger>
                      <SelectContent>
                        {recipientType === "individual_tenant"
                          ? tenants?.map((t: any) => (
                              <SelectItem key={t.user_id} value={t.user_id}>{t.full_name || t.user_id}</SelectItem>
                            ))
                          : investors?.map((i: any) => (
                              <SelectItem key={i.user_id} value={i.user_id}>{(i.profiles as any)?.full_name || i.user_id}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Template (optional)</Label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger><SelectValue placeholder="Use a template..." /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={4} />
              </div>

              <Button
                variant="cta"
                onClick={() => sendMutation.mutate()}
                disabled={!body || sendMutation.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {recipientType.startsWith("all_") ? "Send Bulk Message" : "Send Message"}
              </Button>
            </CardContent>
          </Card>

          {/* Thread view */}
          {selectedThread && thread && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {thread.map((m: any) => (
                  <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender_type === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p>{m.body}</p>
                      <p className={`text-xs mt-1 ${m.sender_type === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2 border-t">
                  <Textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Reply..." rows={2} className="flex-1" />
                  <Button onClick={() => replyMutation.mutate()} disabled={!replyBody || replyMutation.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Inbox / Sent sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Inbox ({inboundMessages.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {inboundMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4">No incoming messages</p>
              ) : (
                inboundMessages.slice(0, 10).map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedThread(m.parent_id || m.id)}
                    className="w-full flex items-start gap-2 px-4 py-3 hover:bg-muted border-b border-border last:border-0 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{m.sender_type}</Badge>
                        {!m.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs font-medium mt-1 truncate">{m.subject || "(no subject)"}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.body}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 mt-2" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Sent ({sentMessages.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {sentMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4">No sent messages</p>
              ) : (
                sentMessages.slice(0, 8).map((m: any) => (
                  <div key={m.id} className="px-4 py-3 border-b border-border last:border-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] capitalize">{m.recipient_type?.replace("_", " ")}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-medium mt-1 truncate">{m.subject || "(no subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.body}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminMessaging;
