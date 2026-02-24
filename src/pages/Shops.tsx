import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTenants, updateTenant } from "@/lib/store";
import { Tenant, formatINR } from "@/lib/types";
import { getRentUrgency, urgencyStyles, urgencyBadge } from "@/lib/rentStatus";
import { ChevronRight, Pencil, X, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Shops() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Tenant>>({});
  const navigate = useNavigate();

  useEffect(() => { setTenants(getTenants()); }, []);

  const startEdit = (t: Tenant) => {
    setEditing(t.id);
    setForm({ ...t });
  };

  const saveEdit = () => {
    if (!editing || !form) return;
    const updated: Tenant = {
      id: editing,
      shopNumber: form.shopNumber!,
      name: form.name || "",
      mobile: form.mobile || "",
      countryCode: form.countryCode || "+91",
      monthlyRent: Number(form.monthlyRent) || 0,
      rentDueDay: Number(form.rentDueDay) || 1,
      status: form.name ? "occupied" : "vacant",
    };
    updateTenant(updated);
    setTenants(getTenants());
    setEditing(null);
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground">Shops & Tenants</h2>

        {tenants.map((t) => (
          <div key={t.id} className={`stat-card ${urgencyStyles(getRentUrgency(t))}`}>
            {editing === t.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Shop {t.shopNumber}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={saveEdit} className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  placeholder="Tenant Name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="+91"
                    value={form.countryCode || "+91"}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className="w-16 bg-muted rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    placeholder="Mobile Number"
                    value={form.mobile || ""}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    inputMode="tel"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      value={form.monthlyRent || ""}
                      onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                      className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-muted-foreground">Due Day</label>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={form.rentDueDay || 1}
                      onChange={(e) => setForm({ ...form, rentDueDay: Number(e.target.value) })}
                      className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button onClick={() => t.status === "occupied" ? navigate(`/tenant/${t.id}`) : startEdit(t)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Shop {t.shopNumber}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      t.status === "occupied" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {t.status}
                    </span>
                    {(() => {
                      const badge = urgencyBadge(getRentUrgency(t));
                      return badge ? (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                      ) : null;
                    })()}
                  </div>
                  {t.status === "occupied" && (
                    <div className="mt-1">
                      <div className="text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{formatINR(t.monthlyRent)}/month · Due {t.rentDueDay}th</div>
                    </div>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(t)} className="p-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {t.status === "occupied" && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
