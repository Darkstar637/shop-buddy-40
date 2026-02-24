import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTenants, getPaymentsForTenant, isMonthPaid } from "@/lib/store";
import { formatINR, MONTHS, OWNER_NAME } from "@/lib/types";
import { Phone, MessageCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const tenant = useMemo(() => getTenants().find((t) => t.id === id), [id]);
  const payments = useMemo(() => (id ? getPaymentsForTenant(id) : []), [id]);

  if (!tenant || tenant.status === "vacant") {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Tenant not found</div>
      </AppLayout>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Show last 12 months
  const monthsList = Array.from({ length: 12 }, (_, i) => {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) { m += 12; y -= 1; }
    return { month: m, year: y, paid: isMonthPaid(tenant.id, m, y) };
  });

  const pendingMonths = monthsList.filter((m) => !m.paid);

  const phone = `${tenant.countryCode}${tenant.mobile}`.replace(/\s/g, "");

  const sendWhatsApp = (month: number, year: number) => {
    const msg = `Hello ${tenant.name}, this is a reminder that your shop rent of ${formatINR(tenant.monthlyRent)} for ${MONTHS[month]} ${year} is due. – ${OWNER_NAME}`;
    window.open(`https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-bold text-foreground">{tenant.name}</div>
              <div className="text-sm text-muted-foreground">Shop {tenant.shopNumber} · {formatINR(tenant.monthlyRent)}/mo</div>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">occupied</span>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <button
              onClick={() => sendWhatsApp(currentMonth, currentYear)}
              className="flex-1 flex items-center justify-center gap-2 bg-success text-success-foreground rounded-xl py-2.5 text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>

        {/* Pending months */}
        {pendingMonths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Pending Months</h3>
            <div className="space-y-2">
              {pendingMonths.map((m) => (
                <div key={`${m.month}-${m.year}`} className="stat-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-foreground">{MONTHS[m.month]} {m.year}</span>
                  </div>
                  <button
                    onClick={() => sendWhatsApp(m.month, m.year)}
                    className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium"
                  >
                    Remind
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment history */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Payment History</h3>
          <div className="space-y-2">
            {monthsList.map((m) => {
              const payment = payments.find((p) => p.month === m.month && p.year === m.year);
              return (
                <div key={`${m.month}-${m.year}`} className="stat-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.paid ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm text-foreground">{MONTHS[m.month]} {m.year}</div>
                      {payment && (
                        <div className="text-xs text-muted-foreground">
                          {formatINR(payment.amount)} · {payment.mode} · {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </div>
                  </div>
                  {!m.paid && (
                    <button
                      onClick={() => navigate(`/payments?tenant=${tenant.id}&month=${m.month}&year=${m.year}`)}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                    >
                      Record
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
