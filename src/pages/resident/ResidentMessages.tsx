import { useState } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Messages", href: "/resident/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentMessages = () => {
  const { user, loading, signOut } = useAuth("resident");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: messages } = useQuery({
    queryKey: ["resident-messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(`recipient_id.eq.${user!.id},sender_id.eq.${user!.id},recipient_type.eq.all_tenants`)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("messages").insert({
        sender_id: user?.id,
        sender_type: "tenant",
        recipient_type: "admin",
        subject,
        body,
      });
    },
    onSuccess: () => {
      toast({ title: "Message sent to management!" });
      setSubject("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["resident-messages"] });
    },
    onError: () => toast({ title: "Failed to send", variant: "destructive" }),
  });

  const inbox = messages?.filter((m: any) => m.sender_type === "admin" || m.recipient_type === "all_tenants") || [];
  const sent = messages?.filter((m: any) => m.sender_id === user?.id && m.sender_type === "tenant") || [];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={user?.email} userId={user?.id}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Messages</h1>

        {/* Compose */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="w-4 h-4" /> Send a Message to Management</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Question about my lease" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message here..." rows={4} />
            </div>
            <Button variant="cta" onClick={() => sendMessage.mutate()} disabled={!body || sendMessage.isPending} className="w-full">
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Inbox */}
        <Card>
          <CardHeader><CardTitle className="text-base">Messages from Management ({inbox.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {inbox.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No messages yet.</p>
            ) : (
              inbox.map((m: any) => (
                <div key={m.id} className="px-4 py-3 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{m.subject || "(no subject)"}</p>
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
                  {m.recipient_type === "all_tenants" && <Badge variant="outline" className="text-[10px] mt-2">Broadcast</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sent */}
        {sent.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Sent Messages</CardTitle></CardHeader>
            <CardContent className="p-0">
              {sent.map((m: any) => (
                <div key={m.id} className="px-4 py-3 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{m.subject || "(no subject)"}</p>
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default ResidentMessages;
