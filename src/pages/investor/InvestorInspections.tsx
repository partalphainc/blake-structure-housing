import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Building2, DollarSign, FileText, Users } from "lucide-react";

const investorNav = [
  { label: "Dashboard", href: "/investor", icon: <Building2 className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Inspections", href: "/investor/inspections", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const INSPECTION_TYPE_COLORS: Record<string, string> = {
  "move-in": "bg-green-100 text-green-800",
  "move-out": "bg-red-100 text-red-800",
  "routine": "bg-blue-100 text-blue-800",
  "maintenance": "bg-orange-100 text-orange-800",
};

const InvestorInspections = () => {
  const { user, loading, signOut } = useAuth("investor");

  const { data: inspections } = useQuery({
    queryKey: ["investor-inspections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get investor's properties
      const { data: properties } = await supabase.from("properties").select("id, name").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const propertyIds = properties.map((p: any) => p.id);

      const { data, error } = await (supabase as any)
        .from("inspections")
        .select("*, units(unit_name, properties(name)), profiles(full_name)")
        .in("property_id", propertyIds)
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return (data || []).map((i: any) => ({
        ...i,
        propertyName: properties.find((p: any) => p.id === i.property_id)?.name,
      }));
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Partner Portal" navItems={investorNav} onSignOut={signOut} userName={user?.email || ""}>
      <h1 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> Property Inspections
      </h1>

      {(!inspections || inspections.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No inspections recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inspections.map((insp: any) => (
            <Card key={insp.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{insp.units?.unit_name || "Property"} — {insp.propertyName || insp.units?.properties?.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(insp.inspection_date).toLocaleDateString()} · Inspector: {insp.profiles?.full_name || insp.inspector_name || "—"}
                    </p>
                  </div>
                  <Badge className={`text-xs shrink-0 ${INSPECTION_TYPE_COLORS[insp.type] || "bg-gray-100 text-gray-800"}`}>
                    {insp.type?.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {insp.findings && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Findings</p>
                    <p className="text-sm">{insp.findings}</p>
                  </div>
                )}
                {insp.notes && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{insp.notes}</p>
                  </div>
                )}
                {insp.image_urls?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Evidence</p>
                    <div className="flex gap-2 flex-wrap">
                      {insp.image_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Evidence ${i + 1}`} className="w-20 h-20 object-cover rounded border" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default InvestorInspections;
