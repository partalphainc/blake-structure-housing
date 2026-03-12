import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Sparkles } from "lucide-react";

interface CalcResult {
  proratedDays: number;
  proratedAmount: number;
  firstMonthTotal: number;
  deposit: number;
  lateFee: number;
  moveInTotal: number;
  monthlyTotal: number;
  breakdown: string[];
}

const AIRentCalculator = ({ trigger }: { trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    rentAmount: "",
    deposit: "",
    moveInDate: "",
    dueDay: "1",
    lateFeeAmount: "",
    lateFeeGraceDays: "5",
    additionalFees: "",
  });
  const [result, setResult] = useState<CalcResult | null>(null);

  const calculate = () => {
    const rent = parseFloat(form.rentAmount) || 0;
    const deposit = parseFloat(form.deposit) || 0;
    const additionalFees = parseFloat(form.additionalFees) || 0;
    const lateFee = parseFloat(form.lateFeeAmount) || 0;
    const moveIn = form.moveInDate ? new Date(form.moveInDate) : null;

    if (!rent || !moveIn) return;

    const daysInMonth = new Date(moveIn.getFullYear(), moveIn.getMonth() + 1, 0).getDate();
    const dayOfMonth = moveIn.getDate();
    const remainingDays = daysInMonth - dayOfMonth + 1;
    const dailyRate = rent / daysInMonth;
    const proratedAmount = parseFloat((dailyRate * remainingDays).toFixed(2));
    const firstMonthTotal = proratedAmount;
    const moveInTotal = deposit + firstMonthTotal + additionalFees;

    const breakdown = [
      `Monthly Rent: $${rent.toFixed(2)}`,
      `Daily Rate: $${dailyRate.toFixed(2)} (${rent.toFixed(2)} ÷ ${daysInMonth} days)`,
      `Move-In Date: ${moveIn.toLocaleDateString()} — ${remainingDays} days remaining in month`,
      `Prorated Rent: $${proratedAmount.toFixed(2)} (${remainingDays} days × $${dailyRate.toFixed(2)})`,
      ...(deposit > 0 ? [`Security Deposit: $${deposit.toFixed(2)}`] : []),
      ...(additionalFees > 0 ? [`Additional Fees: $${additionalFees.toFixed(2)}`] : []),
      `Move-In Total Due: $${moveInTotal.toFixed(2)}`,
      `Recurring Monthly: $${rent.toFixed(2)} (due on the ${form.dueDay}${getDaySuffix(parseInt(form.dueDay))})`,
      ...(lateFee > 0 ? [`Late Fee: $${lateFee.toFixed(2)} (applied after ${form.lateFeeGraceDays}-day grace period)`] : []),
    ];

    setResult({ proratedDays: remainingDays, proratedAmount, firstMonthTotal, deposit, lateFee, moveInTotal, monthlyTotal: rent, breakdown });
  };

  const getDaySuffix = (n: number) => {
    if (n >= 11 && n <= 13) return "th";
    if (n % 10 === 1) return "st";
    if (n % 10 === 2) return "nd";
    if (n % 10 === 3) return "rd";
    return "th";
  };

  const f = (key: keyof typeof form, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 mr-2" /> Rent Calculator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Rent Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Monthly Rent *</Label><Input type="number" placeholder="0.00" value={form.rentAmount} onChange={e => f("rentAmount", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Security Deposit</Label><Input type="number" placeholder="0.00" value={form.deposit} onChange={e => f("deposit", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Move-In Date *</Label><Input type="date" value={form.moveInDate} onChange={e => f("moveInDate", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Rent Due Day</Label><Input type="number" min="1" max="28" placeholder="1" value={form.dueDay} onChange={e => f("dueDay", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Late Fee ($)</Label><Input type="number" placeholder="0.00" value={form.lateFeeAmount} onChange={e => f("lateFeeAmount", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Grace Period (days)</Label><Input type="number" placeholder="5" value={form.lateFeeGraceDays} onChange={e => f("lateFeeGraceDays", e.target.value)} /></div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">Additional Move-In Fees (admin fee, etc.)</Label><Input type="number" placeholder="0.00" value={form.additionalFees} onChange={e => f("additionalFees", e.target.value)} /></div>
          </div>

          <Button variant="cta" className="w-full" onClick={calculate}>
            <Sparkles className="w-4 h-4 mr-2" /> Calculate
          </Button>

          {result && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground">Prorated Rent</p>
                    <p className="text-xl font-bold text-primary">${result.proratedAmount.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{result.proratedDays} days</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground">Move-In Total Due</p>
                    <p className="text-xl font-bold text-green-500">${result.moveInTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">First payment</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    <p className="text-xl font-bold">${result.monthlyTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">Recurring</p>
                  </div>
                  {result.lateFee > 0 && (
                    <div className="text-center p-3 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground">Late Fee</p>
                      <p className="text-xl font-bold text-red-500">${result.lateFee.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">After grace</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Breakdown</p>
                  {result.breakdown.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-primary mt-0.5">·</span>{line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIRentCalculator;
