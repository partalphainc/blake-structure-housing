import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_BACKUP = "partalphaincorporation@gmail.com";

const AdminOAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    const processSession = async (session: any) => {
      if (handled.current) return;
      handled.current = true;

      if (!session?.user) {
        toast({ title: "Sign-in failed", description: "Could not complete sign-in. Please try again.", variant: "destructive" });
        navigate("/admin-login");
        return;
      }

      const email = session.user.email || "";
      const isAllowed =
        email.toLowerCase().endsWith("@cblakeent.com") ||
        email.toLowerCase() === ALLOWED_BACKUP.toLowerCase();

      if (!isAllowed) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "Only @cblakeent.com accounts are permitted.", variant: "destructive" });
        navigate("/admin-login");
        return;
      }

      // Ensure admin role exists
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some((r: any) => r.role === "admin")) {
        await supabase
          .from("user_roles")
          .insert({ user_id: session.user.id, role: "admin" });
      }

      navigate("/admin");
    };

    // Listen for auth state change (fires when OAuth token is exchanged)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        processSession(session);
      }
    });

    // Also check if session is already available (handles page refresh cases)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) processSession(session);
    });

    // Fallback timeout — if nothing resolved after 8s, redirect back
    const timeout = setTimeout(() => {
      if (!handled.current) {
        toast({ title: "Sign-in timed out", description: "Please try again.", variant: "destructive" });
        navigate("/admin-login");
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">Verifying access...</p>
    </div>
  );
};

export default AdminOAuthCallback;
