import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import cblakeLogo from "@/assets/cblake-logo.png";

const ALLOWED_BACKUP = "partalphaincorporation@gmail.com";
const BOOTSTRAP_KEY = "CBE-ADMIN-BOOTSTRAP-2025";
const BOOTSTRAP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bootstrap-admin`;

const isAdminEmail = (email: string) => {
  const lower = email.toLowerCase();
  return lower === ALLOWED_BACKUP.toLowerCase() || lower.endsWith("@cblakeent.com");
};

type Mode = "password" | "setup";

const AdminLogin = () => {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("Mark@cblakeent.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminEmail(email)) {
      toast({ title: "Access denied", description: "Only @cblakeent.com accounts are permitted.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login") || error.message.toLowerCase().includes("user not found")) {
          toast({
            title: "Account not found",
            description: "No account exists yet. Click \"First Time Setup\" below to create one.",
            variant: "destructive",
          });
          setMode("setup");
        } else {
          throw error;
        }
        return;
      }
      // Assign admin role (bypasses RLS via SECURITY DEFINER)
      await supabase.rpc("assign_admin_role_if_eligible");
      navigate("/admin");
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Create / reset account via edge function — no email confirmation required
  const handleSetupAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminEmail(email)) {
      toast({ title: "Access denied", description: "Only @cblakeent.com accounts are permitted.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(BOOTSTRAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ email, password, key: BOOTSTRAP_KEY }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Setup failed");

      toast({ title: "Account ready!", description: result.message });

      // Immediately sign in with the new password
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await supabase.rpc("assign_admin_role_if_eligible");
      navigate("/admin");
    } catch (error: any) {
      toast({ title: "Setup failed", description: error.message, variant: "destructive" });
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
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "setup" ? "Create or reset your admin account" : "Sign in to your admin account"}
          </p>
        </div>

        <Card className="border-border/50 glow-primary">
          <CardHeader />
          <CardContent className="space-y-4">

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cblakeent.com"
                disabled={isLoading}
              />
            </div>

            {/* Password login */}
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
                  {isLoading ? "Signing in..." : "Sign In →"}
                </Button>
              </form>
            )}

            {/* First time setup / account creation */}
            {mode === "setup" && (
              <form onSubmit={handleSetupAccount} className="space-y-3">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
                  First time? Create your admin account below. Your email will be confirmed instantly — no link required.
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">Choose a Password</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
                <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Create Account & Sign In →"}
                </Button>
              </form>
            )}

            {/* Toggle between modes */}
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              onClick={() => { setMode(mode === "password" ? "setup" : "password"); setPassword(""); }}
            >
              {mode === "password" ? "First time? Create admin account" : "Already have an account? Sign in"}
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
