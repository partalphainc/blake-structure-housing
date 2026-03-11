import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import cblakeLogo from "@/assets/cblake-logo.png";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"resident" | "investor">("resident");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user arrived via email verification link
    const hash = window.location.hash;
    if (hash.includes("type=signup") || hash.includes("type=email")) {
      toast({
        title: "Email verified!",
        description: "Your email has been verified. You may now log in.",
      });
      // Clean the hash from URL
      window.history.replaceState(null, "", window.location.pathname);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await redirectByRole(session.user.id, session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const redirectByRole = async (userId: string, userEmail?: string) => {
    try {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      let userRoles = roles?.map((r) => r.role) || [];

      // Auto-assign admin role for @cblakeent.com accounts on first sign-in
      const email = (userEmail || "").toLowerCase();
      const isAdminEmail = email.endsWith("@cblakeent.com") || email === "partalphaincorporation@gmail.com";
      if (isAdminEmail && !userRoles.includes("admin")) {
        await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        userRoles = ["admin"];
      }

      if (userRoles.includes("admin")) navigate("/admin");
      else if (userRoles.includes("investor")) navigate("/investor");
      else navigate("/resident");
    } catch (err) {
      console.error("Role lookup failed:", err);
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setShowForgot(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { full_name: signupName, role: signupRole },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in.",
      });
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-12 h-12 object-contain" />
            <span className="text-xl font-serif font-bold text-foreground">
              C. Blake <span className="text-gradient">Enterprise</span>
            </span>
          </a>
          <p className="text-muted-foreground text-sm">Resident & Investor Portal</p>
        </div>

        <Card className="border-border/50 glow-primary">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full flex items-center gap-2" disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth` } });
                      if (error) { toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" }); setIsLoading(false); }
                    }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </Button>

                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-center mt-2">
                    Forgot password?
                  </button>

                </form>

                  {showForgot && (
                    <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                      <p className="text-sm font-medium">Reset your password</p>
                      <Input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="cta" disabled={isLoading || !forgotEmail} className="flex-1" onClick={handleForgotPassword as any}>
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowForgot(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Crystal Blake" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSignupRole("resident")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          signupRole === "resident"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        🏠 Resident
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole("investor")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          signupRole === "investor"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        📊 Investor
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full flex items-center gap-2" disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth` } });
                      if (error) { toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" }); setIsLoading(false); }
                    }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Sign up with Google
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
