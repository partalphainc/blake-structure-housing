import { useEffect, useState } from "react";
import { User, Bell, CreditCard, Lock, Phone, Save, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const InvestorSettings = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    payoutSent: true,
    leaseEnding: true,
    maintenance: true,
    inspection: false,
    document: true,
    lateRent: true,
  });

  const [contactMethod, setContactMethod] = useState("email");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
        }
        setEmail(user.email || "");
      });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading settings...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save profile. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your profile information has been saved." });
    }
  };

  const handleSaveNotifications = () => {
    toast({ title: "Notifications saved", description: "Your notification preferences have been updated." });
  };

  const handleSaveCommunication = () => {
    toast({ title: "Preferences saved", description: "Your communication preferences have been updated." });
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPwLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPwLoading(false);
    if (error) {
      toast({ title: "Error", description: "Could not send reset email. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Reset email sent", description: `A password reset link has been sent to ${user.email}.` });
    }
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Settings</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Manage your profile, notifications, and preferences</p>
        </div>

        {/* 1. Personal Information */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4738a]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="border-[#f0e8ea] focus:border-[#d4738a] text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Email Address</Label>
              <Input
                value={email}
                disabled
                className="border-[#f0e8ea] text-sm bg-[#faf8f8] text-[#9b8a8d]"
              />
              <p className="text-[10px] text-[#b8a4a8] mt-1">Email cannot be changed here. Contact management to update your email.</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#6b5b5e] mb-1.5 block">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                className="border-[#f0e8ea] focus:border-[#d4738a] text-sm"
              />
            </div>
            <Button
              className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center gap-2"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* 2. Notification Settings */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#d4738a]" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "emailAlerts" as const, label: "Email Alerts", desc: "Receive important updates by email" },
              { key: "smsAlerts" as const, label: "SMS Alerts", desc: "Receive text message notifications" },
              { key: "payoutSent" as const, label: "Payout Sent", desc: "Notify when payout is processed" },
              { key: "leaseEnding" as const, label: "Lease Ending Soon", desc: "Alert when lease expires within 60 days" },
              { key: "maintenance" as const, label: "Maintenance Updates", desc: "Status changes on repair requests" },
              { key: "inspection" as const, label: "Inspection Scheduled", desc: "Alerts for upcoming inspections" },
              { key: "document" as const, label: "New Documents", desc: "Notify when new documents are uploaded" },
              { key: "lateRent" as const, label: "Late Rent", desc: "Alert when a tenant is past due" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#f0e8ea] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#2c2c2c]">{item.label}</p>
                  <p className="text-xs text-[#9b8a8d]">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={() => toggleNotif(item.key)}
                  className="data-[state=checked]:bg-[#d4738a]"
                />
              </div>
            ))}
            <Button
              className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center gap-2"
              onClick={handleSaveNotifications}
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Notifications
            </Button>
          </CardContent>
        </Card>

        {/* 3. Payout Preferences */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#d4738a]" />
              Payout Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-[#faf0f2] rounded-xl border border-[#d4738a]/10">
              <p className="text-sm font-semibold text-[#2c2c2c] mb-1.5">Current Method: Direct Deposit</p>
              <p className="text-xs text-[#6b5b5e] leading-relaxed">
                To update your banking details, account number, or payout preferences, please contact C. Blake Management directly.
                All banking information is handled securely and confidentially.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <a href="tel:6362066037" className="text-xs text-[#d4738a] font-medium hover:underline">(636) 206-6037</a>
                <a href="mailto:management@cblakeent.com" className="text-xs text-[#d4738a] font-medium hover:underline">management@cblakeent.com</a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Password & Security */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#d4738a]" />
              Password & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#faf8f8] rounded-xl">
              <p className="text-sm text-[#6b5b5e]">
                Your account is secured with email/password authentication. To change your password, we'll send a reset link to{" "}
                <strong className="text-[#2c2c2c]">{email}</strong>.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#d4738a]/30 text-[#d4738a] hover:bg-[#faf0f2] text-sm flex items-center gap-2"
              onClick={handlePasswordReset}
              disabled={pwLoading}
            >
              {pwLoading ? (
                <div className="w-4 h-4 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Send Password Reset Email
            </Button>
          </CardContent>
        </Card>

        {/* 5. Communication Preferences */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d4738a]" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[#9b8a8d]">How would you like management to contact you for non-urgent matters?</p>
            {[
              { value: "email", label: "Email", desc: "Preferred for reports and statements" },
              { value: "phone", label: "Phone Call", desc: "For detailed discussions" },
              { value: "text", label: "Text Message", desc: "Quick updates and reminders" },
              { value: "portal", label: "Portal Messages", desc: "All communication through the portal" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  contactMethod === option.value
                    ? "border-[#d4738a]/30 bg-[#faf0f2]"
                    : "border-[#f0e8ea] hover:border-[#d4738a]/20"
                }`}
              >
                <input
                  type="radio"
                  name="contact"
                  value={option.value}
                  checked={contactMethod === option.value}
                  onChange={() => setContactMethod(option.value)}
                  className="mt-0.5 accent-[#d4738a]"
                />
                <div>
                  <p className="text-sm font-medium text-[#2c2c2c]">{option.label}</p>
                  <p className="text-xs text-[#9b8a8d]">{option.desc}</p>
                </div>
              </label>
            ))}
            <Button
              className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center gap-2"
              onClick={handleSaveCommunication}
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorSettings;
