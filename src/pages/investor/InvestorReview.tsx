import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const InvestorReview = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        setProfile(data);
        setName(data?.full_name || "");
      });
  }, [user]);

  const submitReview = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("reviews").insert({
        reviewer_id: user?.id,
        reviewer_type: "investor",
        reviewer_name: name,
        rating,
        title,
        body,
        status: "pending",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Review submitted!", description: "Thank you! Your review will be reviewed by management before publishing." });
    },
    onError: () => toast({ title: "Failed to submit review", variant: "destructive" }),
  });

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Leave a Review</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Share your experience working with C. Blake Enterprise</p>
        </div>

        {submitted ? (
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardContent className="p-10 text-center space-y-4">
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-9 h-9 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-[#e0d0d3]"}`} />
                ))}
              </div>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-green-500 fill-green-500" />
              </div>
              <p className="font-serif font-bold text-xl text-[#2c2c2c]">Thank you for your feedback!</p>
              <p className="text-sm text-[#9b8a8d] max-w-xs mx-auto">Your review has been submitted and is pending approval. We appreciate you taking the time to share your experience.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-[#f0e8ea] bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-serif text-[#2c2c2c]">Share Your Experience</CardTitle>
              <p className="text-xs text-[#9b8a8d]">Reviews are reviewed by management before being published.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Star Rating */}
              <div>
                <Label className="text-xs font-medium text-[#6b5b5e] mb-2 block">Your Rating *</Label>
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
                      <Star className={`w-9 h-9 transition-colors ${i < (hovered || rating) ? "text-yellow-400 fill-yellow-400" : "text-[#e0d0d3]"}`} />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm text-[#9b8a8d] self-center ml-1">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Display Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane S."
                  className="border-[#f0e8ea] focus:border-[#d4738a] text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Review Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent property management team!"
                  className="border-[#f0e8ea] focus:border-[#d4738a] text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Your Review *</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us about your experience as a C. Blake investor. What did we do well? How can we improve?"
                  rows={5}
                  className="border-[#f0e8ea] focus:border-[#d4738a] text-sm resize-none"
                />
              </div>

              <Button
                className="w-full bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm"
                onClick={() => submitReview.mutate()}
                disabled={!body || !rating || submitReview.isPending}
              >
                {submitReview.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Submit Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </InvestorLayout>
  );
};

export default InvestorReview;
