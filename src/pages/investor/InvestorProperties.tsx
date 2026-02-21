import { useEffect, useState } from "react";
import { Building2, BarChart3, FileText, Users, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const navItems = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FileText className="w-4 h-4" /> },
];

const InvestorProperties = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
      supabase.from("properties").select("*, units(*)").eq("owner_id", user.id),
    ]).then(([profileRes, propsRes]) => {
      setProfile(profileRes.data);
      setProperties(propsRes.data || []);
    });
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Investor Portal" navItems={navItems} onSignOut={signOut} userName={profile?.full_name || user?.email}>
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Properties & Units</h1>

        {properties.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No properties in your portfolio yet.</CardContent></Card>
        ) : (
          properties.map((prop) => (
            <Card key={prop.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{prop.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{prop.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{prop.address}{prop.city ? `, ${prop.city}` : ""}{prop.state ? `, ${prop.state}` : ""} {prop.zip || ""}</p>
              </CardHeader>
              <CardContent>
                {prop.units && prop.units.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Furnished</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prop.units.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium text-sm">{u.unit_name}</TableCell>
                          <TableCell className="text-sm">{u.unit_type}</TableCell>
                          <TableCell className="text-sm">
                            {u.rate_monthly ? `$${Number(u.rate_monthly).toFixed(0)}/mo` : u.rate_weekly ? `$${Number(u.rate_weekly).toFixed(0)}/wk` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${u.status === "occupied" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{u.is_furnished ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No units configured for this property.</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PortalLayout>
  );
};

export default InvestorProperties;
