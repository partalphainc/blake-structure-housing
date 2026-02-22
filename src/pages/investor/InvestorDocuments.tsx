import { useEffect, useState } from "react";
import { Building2, BarChart3, FileText, Users, LayoutDashboard, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const InvestorDocuments = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
      supabase.from("documents").select("*").eq("owner_type", "investor").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]).then(([profileRes, docsRes]) => {
      setProfile(profileRes.data);
      setDocuments(docsRes.data || []);
    });
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Investor Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm">Property management agreements, reports, and other documents.</p>

        {documents.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No documents available yet. Management will upload documents as they become available.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary/60" />
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{doc.category || "Document"}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm"><Download className="w-3 h-3 mr-1" /> View</Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default InvestorDocuments;
