import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getTenants, getPayments, isMonthPaid } from "@/lib/store";
import { formatINR, MONTHS } from "@/lib/types";
import { Store, UserCheck, UserX, IndianRupee, AlertCircle, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const data = useMemo(() => {
    const tenants = getTenants();
    const occupied = tenants.filter((t) => t.status === "occupied");
    const vacant = tenants.filter((t) => t.status === "vacant");

    const payments = getPayments();
    const thisMonthPayments = payments.filter(
      (p) => p.month === currentMonth && p.year === currentYear
    );
    const collected = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalExpected = occupied.reduce((sum, t) => sum + t.monthlyRent, 0);
    const pending = totalExpected - collected;

    const dueList = occupied.filter(
      (t) => !isMonthPaid(t.id, currentMonth, currentYear)
    );

    return { tenants, occupied, vacant, collected, pending: Math.max(0, pending), dueList };
  }, [currentMonth, currentYear]);

  const stats = [
    { label: "Total Shops", value: data.tenants.length, icon: Store, color: "text-primary" },
    { label: "Occupied", value: data.occupied.length, icon: UserCheck, color: "text-success" },
    { label: "Vacant", value: data.vacant.length, icon: UserX, color: "text-warning" },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">{MONTHS[currentMonth]} {currentYear}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="stat-card text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Collected</span>
            </div>
            <div className="text-lg font-bold text-foreground">{formatINR(data.collected)}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="text-lg font-bold text-foreground">{formatINR(data.pending)}</div>
          </div>
        </div>

        {/* Due list */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Rent Due This Month</h3>
          {data.dueList.length === 0 ? (
            <div className="stat-card text-center text-sm text-muted-foreground py-6">
              🎉 All rent collected!
            </div>
          ) : (
            <div className="space-y-2">
              {data.dueList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tenant/${t.id}`)}
                  className="stat-card w-full flex items-center justify-between hover:border-primary/30 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-foreground">Shop {t.shopNumber} – {t.name}</div>
                    <div className="text-sm text-muted-foreground">{formatINR(t.monthlyRent)} due by {t.rentDueDay}th</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
