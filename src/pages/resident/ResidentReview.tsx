import { useState } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard, MessageSquare, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Messages", href: "/resident/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentReview = () => {
  const { user, loading, signOut } = useAuth("resident");
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReview = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("reviews").insert({
        reviewer_id: user?.id,
        reviewer_type: "tenant",
        reviewer_name: name,
        rating,
        title,
        body,
        status: "pending",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Review submitted!", description: "Thank you! Your review will be reviewed by management." });
    },
    onError: () => toast({ title: "Failed to submit review", variant: "destructive" }),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={user?.email} userId={user?.id}>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-serif font-bold">Leave a Review</h1>

        {submitted ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-8 h-8 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="font-semibold text-lg">Thank you for your feedback!</p>
              <p className="text-sm text-muted-foreground">Your review has been submitted and is pending approval by management.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">Share Your Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Rating *</Label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHovered(i + 1)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(i + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 transition-colors ${i < (hovered || rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Name (optional)</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John D." />
              </div>
              <div className="space-y-2">
                <Label>Review Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Great place to live!" />
              </div>
              <div className="space-y-2">
                <Label>Your Review *</Label>
                <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us about your experience living here..." rows={5} />
              </div>
              <p className="text-xs text-muted-foreground">Reviews are reviewed by management before being published.</p>
              <Button
                variant="cta"
                className="w-full"
                onClick={() => submitReview.mutate()}
                disabled={!body || !rating || submitReview.isPending}
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default ResidentReview;
