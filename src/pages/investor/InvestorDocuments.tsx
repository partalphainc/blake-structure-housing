import { useEffect, useState } from "react";
import { FolderOpen, Search, Upload, Download, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const sampleDocuments = [
  { id: "d1", name: "Property Management Agreement — 2024", category: "Agreements", property: "Portfolio", date: "Jan 15, 2024", size: "124 KB" },
  { id: "d2", name: "Lease Agreement — J. Williams (Unit 2B)", category: "Leases", property: "4512 Oak Ave", date: "May 1, 2025", size: "89 KB" },
  { id: "d3", name: "Lease Agreement — R. Davis (Unit 1A)", category: "Leases", property: "1823 Maple Dr", date: "Jun 1, 2025", size: "91 KB" },
  { id: "d4", name: "Quarterly Inspection Report — Mar 2026", category: "Inspections", property: "4512 Oak Ave", date: "Mar 10, 2026", size: "215 KB" },
  { id: "d5", name: "HVAC Repair Invoice — Mar 2026", category: "Invoices", property: "4512 Oak Ave", date: "Mar 14, 2026", size: "67 KB" },
  { id: "d6", name: "Monthly Statement — February 2026", category: "Statements", property: "Portfolio", date: "Mar 1, 2026", size: "182 KB" },
  { id: "d7", name: "Property Insurance Policy — 2025-2026", category: "Insurance", property: "Portfolio", date: "Jan 1, 2025", size: "310 KB" },
  { id: "d8", name: "1099 Tax Form — 2025", category: "Tax", property: "Portfolio", date: "Jan 31, 2026", size: "48 KB" },
];

const tabs = ["All", "Agreements", "Leases", "Inspections", "Invoices", "Statements", "Tax", "Insurance"];

const categoryColors: Record<string, string> = {
  Agreements: "bg-blue-100 text-blue-700",
  Leases: "bg-green-100 text-green-700",
  Inspections: "bg-purple-100 text-purple-700",
  Invoices: "bg-amber-100 text-amber-700",
  Statements: "bg-[#d4738a]/10 text-[#d4738a]",
  Tax: "bg-orange-100 text-orange-700",
  Insurance: "bg-teal-100 text-teal-700",
};

const InvestorDocuments = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading documents...</p>
      </div>
    </div>
  );

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const filtered = sampleDocuments.filter((doc) => {
    const matchTab = activeTab === "All" || doc.category === activeTab;
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.property.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAction = (name: string, action: "View" | "Download") => {
    toast({ title: `${action} Document`, description: `${action === "View" ? "Viewing" : "Downloading"} "${name}" is coming soon. Contact management to request documents.` });
  };

  const handleUpload = () => {
    toast({ title: "Upload Coming Soon", description: "Document upload is coming soon. Contact management to request document uploads." });
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Documents</h1>
            <p className="text-[#9b8a8d] text-sm mt-1">All your leases, agreements, statements, and reports</p>
          </div>
          <Button
            className="bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center gap-2"
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeTab === tab
                  ? "bg-[#d4738a] text-white border-[#d4738a]"
                  : "border-[#f0e8ea] text-[#6b5b5e] hover:border-[#d4738a]/30 hover:text-[#d4738a]"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {sampleDocuments.filter(d => d.category === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="border border-[#f0e8ea] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-serif text-[#2c2c2c] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#d4738a]" />
                {activeTab === "All" ? "All Documents" : activeTab}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9b8a8d]" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs border-[#f0e8ea] w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-[#d4738a]/10 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-7 h-7 text-[#d4738a]/40" />
                </div>
                <p className="text-sm font-semibold text-[#2c2c2c] mb-1">No documents found</p>
                <p className="text-xs text-[#9b8a8d]">Try a different category or search term.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-[#faf8f8] transition-colors group border border-transparent hover:border-[#f0e8ea]"
                  >
                    <div className="w-10 h-10 bg-[#f4eff0] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#d4738a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2c2c2c] truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${categoryColors[doc.category] || "bg-gray-100 text-gray-600"}`}>
                          {doc.category}
                        </Badge>
                        <span className="text-[10px] text-[#9b8a8d]">{doc.property}</span>
                        <span className="text-[10px] text-[#b8a4a8]">•</span>
                        <span className="text-[10px] text-[#9b8a8d]">{doc.date}</span>
                        <span className="text-[10px] text-[#b8a4a8]">•</span>
                        <span className="text-[10px] text-[#9b8a8d]">{doc.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-[#9b8a8d] hover:text-[#d4738a] hover:bg-[#faf0f2]"
                        onClick={() => handleAction(doc.name, "View")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-[#9b8a8d] hover:text-[#d4738a] hover:bg-[#faf0f2]"
                        onClick={() => handleAction(doc.name, "Download")}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default InvestorDocuments;
