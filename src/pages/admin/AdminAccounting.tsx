import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PortalLayout from "@/components/portal/PortalLayout";
import { adminNav } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";

const AdminAccounting = () => {
  const { user, loading, signOut } = useAuth("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "maintenance", property_id: "", date: new Date().toISOString().slice(0, 10) });

  const { data: payments } = useQuery({
    queryKey: ["accounting-payments"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, leases(units(unit_name, properties(name, id)))").order("payment_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["accounting-expenses"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("expenses").select("*, properties(name)").order("date", { ascending: false });
      return data || [];
    },
  });

  const addExpense = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("expenses").insert({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        property_id: expenseForm.property_id || null,
        date: expenseForm.date,
        recorded_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-expenses"] });
      setExpenseOpen(false);
      setExpenseForm({ description: "", amount: "", category: "maintenance", property_id: "", date: new Date().toISOString().slice(0, 10) });
      toast({ title: "Expense recorded" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const { data: properties } = useQuery({
    queryKey: ["properties-list"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id, name").is("deleted_at", null);
      return data || [];
    },
  });

  const filteredPayments = payments?.filter((p: any) => p.payment_date?.startsWith(monthFilter)) || [];
  const filteredExpenses = expenses?.filter((e: any) => e.date?.startsWith(monthFilter)) || [];

  const totalRevenue = payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
  const monthRevenue = filteredPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const monthExpenses = filteredExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const netIncome = monthRevenue - monthExpenses;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <PortalLayout title="Admin Portal" navItems={adminNav} onSignOut={signOut} userName={user?.email || ""}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Accounting</h1>
        <div className="flex items-center gap-2">
          <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="h-8 text-xs w-36" />
          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addExpense.mutate(); }} className="space-y-3">
                <div><Label>Description</Label><Input required value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Amount ($)</Label><Input type="number" step="0.01" required value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
                  <div><Label>Date</Label><Input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["maintenance", "utilities", "insurance", "taxes", "management", "supplies", "other"].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Property (optional)</Label>
                  <Select value={expenseForm.property_id} onValueChange={(v) => setExpenseForm({ ...expenseForm, property_id: v })}>
                    <SelectTrigger><SelectValue placeholder="All properties" /></SelectTrigger>
                    <SelectContent>
                      {properties?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" variant="cta" className="w-full" disabled={addExpense.isPending}>{addExpense.isPending ? "Saving..." : "Record Expense"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue (All Time)", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-primary" /> },
          { label: "Revenue This Month", value: `$${monthRevenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
          { label: "Expenses This Month", value: `$${monthExpenses.toLocaleString()}`, icon: <TrendingDown className="w-5 h-5 text-red-500" /> },
          { label: "Net Income This Month", value: `$${netIncome.toLocaleString()}`, icon: <BarChart3 className={`w-5 h-5 ${netIncome >= 0 ? "text-green-600" : "text-red-500"}`} /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent><p className="text-xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Payments This Month */}
      <div className="space-y-4">
        <h2 className="font-semibold">Payments — {monthFilter}</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments this month.</TableCell></TableRow>
                ) : filteredPayments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{p.tenant_id?.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">{(p as any).leases?.units?.unit_name || "—"}</TableCell>
                    <TableCell className="font-medium">${Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{Number((p as any).late_fee || 0) > 0 ? `$${Number((p as any).late_fee).toFixed(2)}` : "—"}</TableCell>
                    <TableCell className="text-sm capitalize">{p.payment_method?.replace("_", " ") || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses This Month */}
        {filteredExpenses.length > 0 && (
          <>
            <h2 className="font-semibold">Expenses — {monthFilter}</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-sm">{new Date(e.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{e.description}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{e.category}</Badge></TableCell>
                        <TableCell className="text-sm">{e.properties?.name || "—"}</TableCell>
                        <TableCell className="font-medium text-red-600">-${Number(e.amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminAccounting;
