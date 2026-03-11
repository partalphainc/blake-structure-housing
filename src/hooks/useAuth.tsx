import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth(requiredRole?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Auto-assign admin role for @cblakeent.com — bypasses RLS via SECURITY DEFINER
        if (requiredRole === "admin") {
          await supabase.rpc("assign_admin_role_if_eligible");
        }

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        const userRoles: string[] = roles?.map((r) => r.role as string) || [];
        const matchedRole = requiredRole && userRoles.includes(requiredRole)
          ? requiredRole
          : userRoles[0] || null;
        setRole(matchedRole);

        if (requiredRole && !userRoles.includes(requiredRole)) {
          navigate(requiredRole === "admin" ? "/admin-login" : "/auth");
        }
      } else {
        setUser(null);
        setRole(null);
        navigate(requiredRole === "admin" ? "/admin-login" : "/auth");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        navigate(requiredRole === "admin" ? "/admin-login" : "/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requiredRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate(requiredRole === "admin" ? "/admin-login" : "/auth");
  };

  return { user, role, loading, signOut };
}
