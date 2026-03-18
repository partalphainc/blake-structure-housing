import { useEffect, useState } from "react";
import { Building2, Wrench, CalendarDays, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InvestorLayout from "@/components/investor/InvestorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const sampleProperties = [
  {
    id: "sample-1",
    name: "4512 Oak Avenue",
    address: "4512 Oak Avenue",
    city: "St. Louis",
    state: "MO",
    status: "active",
    units: [1, 2, 3, 4],
    occupied: 4,
    monthlyRent: 4600,
    lastInspection: "Mar 10, 2026",
    openMaintenance: 1,
  },
  {
    id: "sample-2",
    name: "1823 Maple Drive",
    address: "1823 Maple Drive",
    city: "St. Louis",
    state: "MO",
    status: "active",
    units: [1, 2],
    occupied: 1,
    monthlyRent: 2800,
    lastInspection: "Feb 22, 2026",
    openMaintenance: 1,
  },
];

const PropertyCard = ({ property, onViewDetails }: { property: any; onViewDetails: (id: string) => void }) => {
  const isVacant = property.status !== "active" || property.occupied === 0;

  return (
    <Card className="border border-[#f0e8ea] bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Property Image Placeholder */}
      <div className="h-44 bg-gradient-to-br from-[#d4738a]/20 to-[#c4637a]/10 flex items-center justify-center relative">
        <Building2 className="w-16 h-16 text-[#d4738a]/40" />
        <Badge
          className={`absolute top-3 right-3 text-xs ${
            isVacant ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"
          }`}
        >
          {isVacant ? "Vacant" : "Active"}
        </Badge>
      </div>

      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="font-serif font-bold text-[#2c2c2c] text-lg leading-tight">{property.name || property.address}</h3>
          <p className="text-sm text-[#9b8a8d] mt-1">
            {property.address}{property.city ? `, ${property.city}` : ""}{property.state ? `, ${property.state}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#faf8f8] rounded-lg p-3">
            <p className="text-[10px] text-[#9b8a8d] uppercase tracking-wide mb-1">Units</p>
            <p className="text-sm font-bold text-[#2c2c2c]">{(property.units?.length ?? property.unitCount ?? 0)} total</p>
            <p className="text-xs text-[#9b8a8d]">{property.occupied} occupied</p>
          </div>
          <div className="bg-[#faf8f8] rounded-lg p-3">
            <p className="text-[10px] text-[#9b8a8d] uppercase tracking-wide mb-1">Monthly Rent</p>
            <p className="text-sm font-bold text-[#2c2c2c]">${(property.monthlyRent || 0).toLocaleString()}</p>
            <p className="text-xs text-[#9b8a8d]">gross revenue</p>
          </div>
          <div className="bg-[#faf8f8] rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="w-3 h-3 text-[#9b8a8d]" />
              <p className="text-[10px] text-[#9b8a8d] uppercase tracking-wide">Last Inspection</p>
            </div>
            <p className="text-xs font-semibold text-[#2c2c2c]">{property.lastInspection || "Not recorded"}</p>
          </div>
          <div className="bg-[#faf8f8] rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Wrench className="w-3 h-3 text-[#9b8a8d]" />
              <p className="text-[10px] text-[#9b8a8d] uppercase tracking-wide">Open Work</p>
            </div>
            <p className="text-xs font-semibold text-[#2c2c2c]">{property.openMaintenance || 0} request{(property.openMaintenance || 0) !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <Button
          className="w-full bg-[#d4738a] hover:bg-[#c4637a] text-white text-sm flex items-center justify-center gap-2"
          onClick={() => onViewDetails(property.id)}
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const InvestorProperties = () => {
  const { user, loading, signOut } = useAuth("investor");
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("properties").select("*, units(*)").eq("owner_id", user.id),
      ]);
      setProfile(profileRes.data);
      setProperties(propsRes.data || []);
      setFetching(false);
    };
    fetchData();
  }, [user]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#d4738a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#9b8a8d] text-sm">Loading properties...</p>
      </div>
    </div>
  );

  const displayProperties = properties.length > 0 ? properties : sampleProperties;
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Investor";

  const handleViewDetails = (_id: string) => {
    toast({
      title: "Property Details",
      description: "Property details page coming soon. Contact management for more information.",
    });
  };

  return (
    <InvestorLayout userName={userName} userId={user?.id} onSignOut={signOut}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2c2c2c]">Your Properties</h1>
          <p className="text-[#9b8a8d] text-sm mt-1">Overview of all properties in your portfolio</p>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Properties", value: displayProperties.length, color: "text-[#d4738a]" },
            { label: "Total Units", value: displayProperties.reduce((s, p) => s + (p.units?.length ?? 0), 0), color: "text-blue-500" },
            { label: "Occupied", value: displayProperties.reduce((s, p) => s + (p.occupied || 0), 0), color: "text-green-500" },
            { label: "Open Maintenance", value: displayProperties.reduce((s, p) => s + (p.openMaintenance || 0), 0), color: "text-amber-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border border-[#f0e8ea] bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[#9b8a8d] mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProperties.map((property) => (
            <PropertyCard key={property.id} property={property} onViewDetails={handleViewDetails} />
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
};

export default InvestorProperties;
