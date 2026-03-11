import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_BACKUP = "partalphaincorporation@gmail.com";

const AdminOAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast({ title: "Sign-in failed", description: "Could not complete Google sign-in.", variant: "destructive" });
        navigate("/admin-login");
        return;
      }

      const email = session.user.email || "";
      const isAllowed = email.toLowerCase().endsWith("@cblakeent.com") || email.toLowerCase() === ALLOWED_BACKUP.toLowerCase();

      if (!isAllowed) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "Only @cblakeent.com accounts are allowed.", variant: "destructive" });
        navigate("/admin-login");
        return;
      }

      // Ensure admin role exists
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (!roles?.some((r) => r.role === "admin")) {
        // Auto-assign admin role for approved domain
        await (supabase as any).from("user_roles").insert({ user_id: session.user.id, role: "admin" });
      }

      navigate("/admin");
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Verifying access...
    </div>
  );
};

export default AdminOAuthCallback;
