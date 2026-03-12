import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { adminNav } from "./AdminDashboard";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, CheckCircle2, EyeOff, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pending: { label: "Pending", class: "border-yellow-400/40 text-yellow-400", icon: Clock },
  approved: { label: "Approved", class: "border-green-400/40 text-green-400", icon: CheckCircle2 },
  featured: { label: "Featured", class: "border-primary/40 text-primary", icon: Sparkles },
  hidden: { label: "Hidden", class: "border-muted text-muted-foreground", icon: EyeOff },
};

const AdminReviews = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await (supabase as any).from("reviews").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => {
      toast({ title: "Review updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const filtered = filterStatus === "all" ? reviews : reviews?.filter((r: any) => r.status === filterStatus);

  const counts = {
    pending: reviews?.filter((r: any) => r.status === "pending").length || 0,
    approved: reviews?.filter((r: any) => r.status === "approved").length || 0,
    featured: reviews?.filter((r: any) => r.status === "featured").length || 0,
    hidden: reviews?.filter((r: any) => r.status === "hidden").length || 0,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Reviews</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
            <SelectItem value="featured">Featured ({counts.featured})</SelectItem>
            <SelectItem value="hidden">Hidden ({counts.hidden})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <Card key={status} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setFilterStatus(status)}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${cfg.class.split(" ")[1]}`} />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        {!filtered?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No reviews found.</CardContent></Card>
        ) : (
          filtered.map((review: any) => {
            const cfg = statusConfig[review.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="outline" className={cfg.class}>
                          <Icon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">{review.reviewer_type}</Badge>
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      {review.reviewer_name && <p className="text-sm font-medium mb-1">{review.reviewer_name}</p>}
                      {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground">{review.body}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {review.status !== "approved" && (
                        <Button size="sm" variant="outline" className="text-green-400 border-green-400/30 hover:bg-green-400/10 text-xs"
                          onClick={() => updateStatus.mutate({ id: review.id, status: "approved" })}>
                          Approve
                        </Button>
                      )}
                      {review.status !== "featured" && (
                        <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10 text-xs"
                          onClick={() => updateStatus.mutate({ id: review.id, status: "featured" })}>
                          Feature
                        </Button>
                      )}
                      {review.status !== "hidden" && (
                        <Button size="sm" variant="outline" className="text-muted-foreground text-xs"
                          onClick={() => updateStatus.mutate({ id: review.id, status: "hidden" })}>
                          Hide
                        </Button>
                      )}
                      {review.status !== "pending" && (
                        <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-400/30 text-xs"
                          onClick={() => updateStatus.mutate({ id: review.id, status: "pending" })}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminReviews;
