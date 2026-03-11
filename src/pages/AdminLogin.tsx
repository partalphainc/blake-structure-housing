import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import cblakeLogo from "@/assets/cblake-logo.png";

const ALLOWED_BACKUP = "partalphaincorporation@gmail.com";

const isAdminEmail = (email: string) => {
  const lower = email.toLowerCase();
  return lower === ALLOWED_BACKUP.toLowerCase() || lower.endsWith("@cblakeent.com");
};

type Mode = "magic" | "password";

const AdminLogin = () => {
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("management@cblakeent.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Magic link — sends a one-click login email
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminEmail(email)) {
      toast({ title: "Access denied", description: "Only @cblakeent.com accounts are permitted.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setMagicSent(true);
      toast({ title: "Login link sent!", description: `Check ${email} and click the link to sign in.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (roles?.some((r) => r.role === "admin")) {
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast({ title: "Access denied", description: "No admin role found for this account.", variant: "destructive" });
        }
      }
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/oauth-callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-xl font-serif font-bold text-foreground">Management Portal</h1>
        </div>

        <Card className="border-border/50 glow-primary">
          <CardHeader />
          <CardContent className="space-y-4">

            {/* Email field — shared by both modes */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setMagicSent(false); }}
                placeholder="management@cblakeent.com"
                disabled={isLoading}
              />
            </div>

            {/* Magic link mode */}
            {mode === "magic" && (
              <form onSubmit={handleMagicLink} className="space-y-3">
                {magicSent ? (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-center space-y-1">
                    <p className="text-sm font-medium text-green-600">Login link sent!</p>
                    <p className="text-xs text-muted-foreground">Check <strong>{email}</strong> and click the link to sign in instantly.</p>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline mt-1"
                      onClick={() => setMagicSent(false)}
                    >
                      Resend link
                    </button>
                  </div>
                ) : (
                  <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Login Link →"}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  We'll email you a one-click sign-in link. No password needed.
                </p>
              </form>
            )}

            {/* Password mode */}
            {mode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {/* Toggle between modes */}
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setMagicSent(false); }}
            >
              {mode === "magic" ? "Sign in with password instead" : "Send me a login link instead"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google (@cblakeent.com)
            </Button>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
