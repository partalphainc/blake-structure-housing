import { useEffect, useState, useRef } from "react";
import { DollarSign, Wrench, FileText, Upload, LayoutDashboard, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/resident", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Payments", href: "/resident/payments", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Maintenance", href: "/resident/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Documents", href: "/resident/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Upload Docs", href: "/resident/upload", icon: <Upload className="w-4 h-4" /> },
];

const ResidentUpload = () => {
  const { user, loading, signOut } = useAuth("resident");
  const [profile, setProfile] = useState<any>(null);
  const [docType, setDocType] = useState("id_document");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    setUploading(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resident-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from("resident-documents")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
      if (signedError) throw signedError;
      const fileUrl = signedData.signedUrl;

      const { error: dbError } = await supabase.from("documents").insert({
        owner_type: "tenant",
        owner_id: user.id,
        category: docType,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_by: user.id,
        visible_to_tenant: true,
      });

      if (dbError) throw dbError;

      toast({ title: "Document uploaded", description: "Your document has been submitted for review." });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Resident Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Upload Documents</h1>
        <p className="text-muted-foreground text-sm">Upload identification, proof of income, or other required documents.</p>

        <Card>
          <CardHeader><CardTitle className="text-base">Upload a Document</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id_document">Government ID</SelectItem>
                    <SelectItem value="proof_of_income">Proof of Income</SelectItem>
                    <SelectItem value="reference_letter">Reference Letter</SelectItem>
                    <SelectItem value="application">Application Form</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG, DOC. Max 10MB.</p>
              </div>
              <Button type="submit" variant="cta" disabled={uploading || !file}>
                <UploadCloud className="w-4 h-4 mr-1" />
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default ResidentUpload;
