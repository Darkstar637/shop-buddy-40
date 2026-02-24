import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getTenants, addPayment, isMonthPaid } from "@/lib/store";
import { Tenant, MONTHS, formatINR, generateId } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

export default function Payments() {
  const [searchParams] = useSearchParams();
  const now = new Date();

  const tenants = useMemo(() => getTenants().filter((t) => t.status === "occupied"), []);

  const [tenantId, setTenantId] = useState(searchParams.get("tenant") || "");
  const [month, setMonth] = useState(Number(searchParams.get("month") ?? now.getMonth()));
  const [year, setYear] = useState(Number(searchParams.get("year") ?? now.getFullYear()));
  const [paymentDate, setPaymentDate] = useState(now.toISOString().slice(0, 10));
  const [mode, setMode] = useState<"Cash" | "UPI" | "Bank">("UPI");
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-fill amount when tenant is selected
  useEffect(() => {
    const t = tenants.find((t) => t.id === tenantId);
    if (t) setAmount(String(t.monthlyRent));
  }, [tenantId, tenants]);

  const alreadyPaid = tenantId ? isMonthPaid(tenantId, month, year) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !amount) return;
    if (alreadyPaid) {
      toast.error("This month is already marked as paid");
      return;
    }

    addPayment({
      id: generateId(),
      tenantId,
      month,
      year,
      paymentDate,
      mode,
      amount: Number(amount),
    });

    setSuccess(true);
    toast.success("Payment recorded successfully!");
    setTimeout(() => setSuccess(false), 3000);
  };

  const selectedTenant = tenants.find((t) => t.id === tenantId);

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground">Record Payment</h2>

        {success && (
          <div className="stat-card flex items-center gap-3 border-success/30">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-foreground">Payment recorded!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Tenant</label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Choose tenant...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>Shop {t.shopNumber} – {t.name}</option>
              ))}
            </select>
          </div>

          {/* Month/Year */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {alreadyPaid && tenantId && (
            <div className="text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Already paid for {MONTHS[month]} {year}
            </div>
          )}

          {/* Payment date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Mode</label>
            <div className="flex gap-2">
              {(["Cash", "UPI", "Bank"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-card border border-border rounded-xl px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            {selectedTenant && (
              <p className="text-xs text-muted-foreground mt-1">
                Monthly rent: {formatINR(selectedTenant.monthlyRent)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={alreadyPaid || !tenantId}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Record Payment
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
