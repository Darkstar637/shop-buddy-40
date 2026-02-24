import { useMemo, useState } from "react";
import { getTenants, getPayments, isMonthPaid } from "@/lib/store";
import { formatINR, MONTHS } from "@/lib/types";
import { TrendingUp, AlertTriangle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Reports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const data = useMemo(() => {
    const tenants = getTenants().filter((t) => t.status === "occupied");
    const payments = getPayments();

    const monthlyData = MONTHS.map((name, i) => {
      const monthPayments = payments.filter((p) => p.month === i && p.year === year);
      const collected = monthPayments.reduce((s, p) => s + p.amount, 0);
      const expected = tenants.reduce((s, t) => s + t.monthlyRent, 0);
      return { name, collected, expected, pending: Math.max(0, expected - collected) };
    });

    const totalCollected = monthlyData.reduce((s, m) => s + m.collected, 0);
    const totalPending = monthlyData.reduce((s, m) => s + m.pending, 0);

    // Only count up to current month for current year
    const relevantMonths = year === now.getFullYear() 
      ? monthlyData.slice(0, now.getMonth() + 1) 
      : monthlyData;

    const currentPending = relevantMonths.reduce((s, m) => s + m.pending, 0);

    return { monthlyData, totalCollected, totalPending: currentPending, relevantMonths };
  }, [year]);

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Reports</h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Collected</span>
            </div>
            <div className="text-lg font-bold text-foreground">{formatINR(data.totalCollected)}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Total Pending</span>
            </div>
            <div className="text-lg font-bold text-foreground">{formatINR(data.totalPending)}</div>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Monthly Breakdown</h3>
          <div className="space-y-2">
            {data.relevantMonths.map((m, i) => {
              const pct = m.expected > 0 ? Math.round((m.collected / m.expected) * 100) : 0;
              return (
                <div key={i} className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{pct}% collected</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "hsl(var(--success))" : pct > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                    <span>Collected: {formatINR(m.collected)}</span>
                    <span>Pending: {formatINR(m.pending)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
