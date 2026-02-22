import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import cblakeLogo from "@/assets/cblake-logo.png";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
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
    const redirectByRole = async (userId: string) => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const role = roles?.[0]?.role;
      if (role === "admin") navigate("/admin");
      else if (role === "investor") navigate("/investor");
      else navigate("/resident");
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await redirectByRole(session.user.id);
      } else {
        setIsCheckingSession(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await redirectByRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      // Redirect handled by onAuthStateChange
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
      const { data, error } = await supabase.auth.signUp({
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

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-center mt-2">
                    Forgot password?
                  </button>

                  {showForgot && (
                    <form onSubmit={handleForgotPassword} className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                      <p className="text-sm font-medium">Reset your password</p>
                      <Input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" variant="cta" disabled={isLoading} className="flex-1">
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowForgot(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                </form>
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
